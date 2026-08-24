# AbortController

`AbortController` is a global Web API (available in browsers and Node) for cancelling in-flight async work — most commonly a `fetch()`, but it works with any API that accepts an `AbortSignal`. It solves a problem promises don't solve on their own: a promise has no way to tell the thing that created it "I don't care about the result anymore, stop doing work."

## The basic shape

```ts
const controller = new AbortController();

fetch("/api/search?q=abc", { signal: controller.signal })
  .then((res) => res.json())
  .then((data) => setResults(data));

// later, in response to some event:
controller.abort();
```

- `controller.signal` is an `AbortSignal` — a read-only handle you pass to whatever you want to be cancellable.
- `controller.abort(reason?)` flips the signal to "aborted" and rejects any pending promise tied to it. `fetch` rejects with a `DOMException` named `AbortError` (or, if you passed a `reason`, that reason becomes the rejection value in modern browsers).
- A controller is **single-use**: once aborted, `signal.aborted` is `true` forever. To cancel a new request, create a new controller — you can't "un-abort" or reuse one.

## Handling the abort in your `.catch`

Aborting isn't a failure — it's an intentional cancellation — so it needs to be distinguished from a real network/parsing error:

```ts
fetch(url, { signal: controller.signal })
  .then((res) => res.json())
  .then(setData)
  .catch((err) => {
    if (err.name === "AbortError") return; // expected, not an error
    setError(err);
  });
```

With `async`/`await`, the same check applies around a `try`/`catch`:

```ts
try {
  const res = await fetch(url, { signal: controller.signal });
  setData(await res.json());
} catch (err) {
  if (err instanceof DOMException && err.name === "AbortError") return;
  setError(err);
}
```

## Why it matters in React: race conditions and cleanup

The most common place this shows up in a React codebase is inside `useEffect` — fetching data tied to a prop/state value that can change before the request resolves. Without cancellation, a slow, stale request can resolve *after* a newer one and overwrite fresher state:

```tsx
// ❌ no cancellation — a stale response can win the race
useEffect(() => {
  fetch(`/api/user/${userId}`)
    .then((res) => res.json())
    .then(setUser);
}, [userId]);
```

Switching `userId` quickly (e.g. clicking through a list) fires a new request each time, but nothing stops an earlier, slower response from landing last and clobbering the correct one.

```tsx
// ✅ each effect run gets its own controller; the cleanup aborts the
// previous request before the next run (or on unmount) starts a new one
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/user/${userId}`, { signal: controller.signal })
    .then((res) => res.json())
    .then(setUser)
    .catch((err) => {
      if (err.name === "AbortError") return;
      setError(err);
    });

  return () => controller.abort();
}, [userId]);
```

React calls the cleanup function before every re-run of the effect (and on unmount), so the controller created on the *previous* run is always aborted before the next request starts — this both prevents the out-of-order overwrite and stops the browser doing pointless network work for a response no one will use.

This is also what protects against the classic "set state after unmount" warning: if the component unmounts while a request is pending, `abort()` runs in the cleanup and the `.then`/`await` after it never resolves into a `setState` call.

## Beyond `fetch`: any signal-aware API

`AbortSignal` isn't `fetch`-specific — anything can accept and check it. You can wire it up to your own async code too:

```ts
function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(signal.reason);
    });
  });
}
```

Other built-ins that accept a `signal` option: `addEventListener` (auto-removes the listener when aborted — no manual `removeEventListener` needed), the Streams API, and Node's `fs`/`child_process`/`http` APIs.

## Timeouts: `AbortSignal.timeout()`

For "cancel this request if it takes too long," you don't need a `setTimeout` + controller by hand — `AbortSignal.timeout(ms)` returns a signal that aborts itself after the given duration:

```ts
fetch(url, { signal: AbortSignal.timeout(5000) })
  .catch((err) => {
    if (err.name === "TimeoutError") return handleTimeout();
    if (err.name === "AbortError") return; // externally cancelled
    throw err;
  });
```

Note the `name` on a timeout-triggered rejection is `TimeoutError`, not `AbortError` — worth distinguishing if you want a different UI for "too slow" vs. "cancelled."

## Combining multiple abort sources: `AbortSignal.any()`

A request often needs to be cancellable for more than one reason at once — say, both a user-driven "cancel" button *and* a timeout. `AbortSignal.any([signals])` merges multiple signals into one that aborts as soon as any of them do:

```ts
const userController = new AbortController();

fetch(url, {
  signal: AbortSignal.any([userController.signal, AbortSignal.timeout(8000)]),
});

// cancel button:
cancelButton.onclick = () => userController.abort();
```

## Gotchas

- **A controller can only be aborted once.** Calling `.abort()` a second time is a no-op — it doesn't throw, but it also doesn't do anything new. Create a fresh controller per cancellable operation.
- **`signal.aborted` can already be `true` before you ever call `.abort()` yourself** if you're reusing a signal that was aborted elsewhere (e.g. via `AbortSignal.any()` or `AbortSignal.timeout()`). Check `signal.aborted` up front in code that doesn't go through `fetch`, since `fetch` checks it for you but hand-rolled async code won't.
- **Aborting doesn't guarantee the underlying work stops instantly.** For `fetch`, the browser does stop the network transfer, but any `.then()`/code after the `await` that already scheduled won't magically not run — that's why you still need the `if (err.name === "AbortError") return;` guard rather than assuming abort short-circuits everything.
- **Don't confuse "abort" with "the promise never settles."** An aborted `fetch` promise *rejects* — it doesn't hang forever — so an unhandled rejection (missing `.catch`, or no `try`/`catch` around an `await`) will surface as a console error/unhandled rejection even though the cancellation itself was intentional.
