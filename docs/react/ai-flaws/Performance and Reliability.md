# Performance and Reliability

## Infinite API loops

AI-generated `useEffect` calls often trigger the exact request loop they're meant to prevent: an effect updates state, the state change triggers a re-render, the re-render re-runs the effect, and so on — hammering the backend with duplicate requests. The usual cause is a missing or wrong dependency array.

**Example — an effect that re-triggers itself:**

```tsx
// ❌ No dependency array: the effect reruns on every render,
// and setUser triggers exactly that
function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }); // <- missing [id]

  return <div>{user?.name}</div>;
}

// ✅ Dependency array scopes the effect to actual input changes
function UserProfile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }, [id]);

  return <div>{user?.name}</div>;
}
```

### Mitigation strategy

- **Never write a `useEffect` without a dependency array**, and don't rely on memory to keep it complete — let a linter verify it.
- **Turn on `eslint-plugin-react-hooks`'s `exhaustive-deps` rule.** It statically flags any value an effect reads but doesn't declare as a dependency, including a missing array entirely. See [lint rules for missing effect dependencies](/notes/lint-rules#catch-missing-effect-dependencies) for the config and a worked example.

---

## Missing debounce on search

A search input wired directly to `onChange` fires one request per keystroke — typing "product" is 7 API calls instead of 1. In one project the source article reviewed, this pattern produced 50+ search requests/sec at peak; adding debouncing brought it down to 2–3 requests/sec.

**Example:**

```tsx
// ❌ Every keystroke hits the network
function Search() {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    fetch(`/api/search?q=${e.target.value}`).then(/* ... */);
  };

  return <input onChange={handleChange} />;
}

// ✅ Debounce collapses bursts of keystrokes into one request
function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) fetch(`/api/search?q=${debouncedQuery}`).then(/* ... */);
  }, [debouncedQuery]);

  return <input onChange={e => setQuery(e.target.value)} />;
}
```

### Mitigation strategy

- **Name the constraint, not just the feature.** "Add a search box" gets a naive `onChange` handler; "add a search box that debounces requests" gets `useDebounce`/`lodash.debounce` from the start — AI defaults to the literal, synchronous version of whatever event it's given.
- **Treat any handler on a fast-firing event as debounce-or-throttle by default** — keystrokes, scroll, resize, drag. Search wants debounce (wait for a pause); a scroll-position tracker usually wants throttle (run at most every N ms) — call out which one you mean.
- **Guard against out-of-order responses, not just request volume.** A debounced input can still fire two requests close together; if a stale response resolves after a newer one, it can overwrite fresher results. Track the in-flight query (or use an `AbortController` per keystroke) and drop responses that don't match the current query.
- **Watch request volume in review**, not just the diff — a network tab open while typing into the field catches a missing debounce that reading the code might not.

**Sample prompt that produces the full-featured version below:**

> Add a search input that debounces requests by 300ms, cancels any in-flight request when a newer one fires, and ignores a response if it comes back for a query that's no longer current. Show a loading indicator while a request is in flight.

**Full example — debounce + cancellation + stale-response guard:**

```tsx
function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    // A new debounced query cancels whatever the previous one kicked off,
    // so a slow, stale response can never land after a fresher one.
    const controller = new AbortController();
    // AbortController is a global Web API built into the browser (and Node)
    setIsLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then(r => r.json())
      .then((data: Result[]) => setResults(data))
      .catch(err => {
        // Expected when a newer keystroke aborts this request — not a real error.
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isLoading && <Spinner />}
      <ResultsList results={results} />
    </div>
  );
}
```

---

## Over-fetching and lack of context

Models solve the immediate prompt without awareness of the system as a whole. Instead of asking the backend for the shape it actually needs, they pull raw data and process it client-side — e.g. hitting `/api/users` and counting rows in the frontend instead of requesting a count endpoint, or loading every one of a user's files ("sometimes hundreds") to display only 4.

**Example:**

```tsx
// ❌ Fetches everything, computes a total on the client
function UserCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(users => setCount(users.length));
  }, []);

  return <p>{count} users</p>;
}

// ✅ Asks the backend for the number it needs
function UserCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/users/count").then(r => r.json()).then(({ count }) => setCount(count));
  }, []);

  return <p>{count} users</p>;
}
```

### Mitigation strategy

- **Ask for the shape, not the source.** "Show the user count" invites "fetch `/api/users` and count them" because that's the only endpoint the model can see; "show the user count, using a count endpoint if one exists, otherwise flag that one is needed" pushes it to check first.
- **Make the backend contract visible to the prompt.** If the API surface (OpenAPI spec, route list, existing hooks like `useUserCount`) isn't in context, the model can't know a purpose-built endpoint exists and will default to the general-purpose one it does know about.
- **Treat "fetch everything, filter/count/slice on the client" as a smell in review**, not just a style nit — check what a new call actually returns (row count, payload size) against what the UI displays.
- **Paginate or scope by default for any list that isn't known to be small.** Ask explicitly for cursor/offset pagination or a `?limit=` param rather than letting the model reach for the unbounded list endpoint.

---

## Missing lazy loading

Images load eagerly regardless of whether they're in the viewport. A landing page that loaded 20 images up front but displayed 3 on screen improved Time to Interactive by ~2 seconds once the offscreen images were deferred.

**Example:**

```tsx
// ❌ All images load immediately, even offscreen ones
<img src={product.imageUrl} alt={product.name} />

// ✅ Defer offscreen images to the browser's native lazy loading
<img src={product.imageUrl} alt={product.name} loading="lazy" />
```

### Mitigation strategy

- **Default to `loading="lazy"` on any `<img>` that isn't known to be above the fold.** It's a native HTML attribute, not a library — there's no cost to adding it, and AI won't reach for it unless the prompt or a lint rule asks for it.
- **Turn on a lint rule that flags `<img>` tags with no `loading` attribute at all**, so the omission fails the build instead of relying on catching it in review. See [lint rules for missing lazy-loading images](/notes/lint-rules#catch-missing-lazy-loading-images) for the config and a worked example.
- **Exclude the actual above-the-fold images explicitly** (hero banners, the first few list items) — eager-loading those and lazy-loading the rest is the correct split, not lazy-loading everything uniformly.
- **Reach for `IntersectionObserver` only when `loading="lazy"` doesn't cover the case** — e.g. lazy-mounting a heavy non-image component (a chart, a map) rather than deferring image decode. Don't ask for a custom observer-based solution when the native attribute already does the job.
- **Extend the same instinct to route-level code**, not just images: routes and heavy, rarely-used components (modals, charts, editors) should load via `React.lazy` + `Suspense` rather than shipping in the main bundle. "Add a settings page" gets a static import by default; "add a settings page, code-split it" gets `React.lazy`.
- **Check bundle/network impact in review, not just the diff** — a Lighthouse run or the network tab's image list catches offscreen assets loading eagerly, and the bundle analyzer catches a component that should've been route-split but wasn't.

**Sample prompt that produces the full-featured version below:**

> Add an image component that lazy-loads by default, shows a skeleton placeholder while the image loads, fades it in once it's ready, and lets the first few above-the-fold images opt into eager, high-priority loading.

**Full example — placeholder + fade-in + explicit above-the-fold opt-out:**

```tsx
function LazyImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

// Only the first few above-the-fold cards opt into eager/high-priority loading
{products.map((product, i) => (
  <LazyImage key={product.id} src={product.imageUrl} alt={product.name} priority={i < 3} />
))}
```

---

## Missing virtualization for large datasets

A plain `.map()` over rows works fine in a demo and falls over in production. One dashboard became unusable past ~500 rows; virtualizing the list let it handle 10,000 rows smoothly by only rendering what's in (or near) the viewport.

**Example:**

```tsx
// ❌ Renders every row's DOM node up front, however many there are
function Table({ rows }: { rows: Row[] }) {
  return <div>{rows.map(row => <TableRow key={row.id} {...row} />)}</div>;
}

// ✅ Only the visible slice is ever mounted
import { FixedSizeList } from "react-window";

function Table({ rows }: { rows: Row[] }) {
  return (
    <FixedSizeList height={600} itemCount={rows.length} itemSize={40} width="100%">
      {({ index, style }) => <TableRow style={style} {...rows[index]} />}
    </FixedSizeList>
  );
}
```

### Mitigation strategy

- **Name the scale, not just the feature.** "Render a table of the results" gets a plain `.map()` because the model has no reason to expect more rows than the fixture it's looking at; "render a table that stays smooth up to 10,000 rows" gets a virtualized list from the start.
- **Treat an unbounded `.map()` over rows/cards/list items as a smell in review**, the same way you would a missing `key` prop — check what feeds it in production, not the 5-row dev fixture the demo was built against.
- **Reach for a variable-size list (`VariableSizeList` / `react-virtual`) when row height isn't fixed.** `FixedSizeList` silently breaks — rows overlap or clip — the moment content wraps to a second line or a row renders an image; only ask for the fixed variant when every row is genuinely the same height.
- **Pair virtualization with pagination for datasets that don't fit in memory at all**, not just ones that are slow to render — virtualizing a 200,000-row array still means fetching and holding 200,000 rows client-side.
- **This one is hard to lint for, so lean on a perf budget instead.** A Lighthouse CI check or a test asserting DOM node count stays flat as the dataset grows catches a regression that code review alone tends to miss, since the code looks identical whether the array behind `rows` has 50 items or 50,000.

**Sample prompt that produces the full-featured version below:**

> Add a virtualized table that stays smooth up to 10,000 rows, fetches the next page automatically as the user scrolls near the bottom, and shows a loading row while that page is in flight.

**Full example — virtualization + infinite loading + loading-row placeholder:**

```tsx
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

function Table({
  rows,
  hasNextPage,
  loadNextPage,
}: {
  rows: Row[];
  hasNextPage: boolean;
  loadNextPage: () => Promise<void>;
}) {
  // One extra slot at the end represents the not-yet-loaded next page
  const itemCount = hasNextPage ? rows.length + 1 : rows.length;
  const isRowLoaded = (index: number) => !hasNextPage || index < rows.length;

  return (
    <InfiniteLoader
      isItemLoaded={isRowLoaded}
      itemCount={itemCount}
      loadMoreItems={hasNextPage ? loadNextPage : () => {}}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          height={600}
          itemCount={itemCount}
          itemSize={40}
          width="100%"
          onItemsRendered={onItemsRendered}
          ref={ref}
        >
          {({ index, style }) =>
            isRowLoaded(index) ? (
              <TableRow style={style} {...rows[index]} />
            ) : (
              <div style={style}>Loading…</div>
            )
          }
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
```

---

## Missing resilience

AI optimizes for the literal request — ask for "a fetch call" and that's what you get, with no timeout, no retry, and no boundary to contain a failure. Under real-world network conditions (slow connections, flaky endpoints, transient 500 errors) that turns a single failed request into a broken page instead of a recoverable error.

**Example:**

```tsx
// ❌ No timeout, no retry, no fallback UI on failure
function Profile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
  }, [id]);

  return <div>{user?.name}</div>;
}

// ✅ Bounded request, wrapped by an <ErrorBoundary> higher up the
// tree so a failed fetch degrades to a fallback instead of crashing
function Profile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(`/api/users/${id}`, { signal: controller.signal })
      .then(r => r.json())
      .then(setUser)
      .finally(() => clearTimeout(timeout));

    return () => controller.abort();
  }, [id]);

  return <div>{user?.name}</div>;
}
```

### Mitigation strategy

- **Name the failure modes you want handled, not just "add resilience."** A bare "fetch the user" prompt makes the no-timeout, no-retry version a legitimate literal reading; "time out after 5s, retry transient failures twice, and show a fallback if it still fails" isn't.
- **Reach for a data-fetching library (TanStack Query, SWR) instead of hand-rolling timeout/retry/cache logic.** They ship sane resilience defaults — retry, dedupe, cache — so asking for a fetch to go through one usually gets those defaults for free, in a way rolling your own rarely does on the first pass.
- **Distinguish retryable from non-retryable failures.** Retry network errors and 500 errors; don't retry 4xxs — retrying a 404 or a 401 just repeats a request that was never going to succeed. Naive retry loops tend not to make this distinction unless asked to.
- **Wrap anything that can fail with an `<ErrorBoundary>` further up the tree.** A bounded, retried request that still ultimately fails needs somewhere to degrade to — without a boundary, that failure crashes the surrounding page instead of showing a fallback.
- **Watch for retries applied to mutations without considering idempotency.** Blindly retrying a `POST`/non-idempotent mutation can double-submit; only retry mutations known to be safe to repeat, or dedupe with an idempotency key.
- **Check this in review by simulating failure, not by reading the diff.** Throttle the network tab or point the endpoint at a 500 and confirm the UI degrades gracefully — the code often looks identical whether or not it actually handles the failure path.

**Sample prompt that produces the full-featured version below:**

> Add a profile fetch that times out after 5s, retries transient failures (network errors and 5xx) up to twice with exponential backoff, doesn't retry 4xx errors, and falls back to an error UI via an error boundary if it still fails.

**Full example — timeout + backoff retry + 4xx/5xx distinction + error boundary fallback:**

```tsx
async function fetchWithRetry(
  url: string,
  { retries = 2, timeoutMs = 5000 }: { retries?: number; timeoutMs?: number } = {}
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { signal: controller.signal });
      // A 4xx is a client error, not a transient failure - retrying won't help
      if (!res.ok && res.status < 500) return res;
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      const backoffMs = 2 ** attempt * 500;
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    } finally {
      clearTimeout(timeout);
    }
  }
}

function Profile({ id }: { id: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchWithRetry(`/api/users/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setUser(data);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return <div>{user?.name}</div>;
}

// A boundary above Profile catches whatever fetchWithRetry ultimately throws
// and renders a fallback instead of taking down the rest of the page
<ErrorBoundary fallback={<ProfileError />}>
  <Profile id={id} />
</ErrorBoundary>
```

---

## Cheat sheet

| Flaw | Symptom | Fix |
|---|---|---|
| [Infinite API loops](#infinite-api-loops) | `useEffect` re-triggers itself, hammering the backend | Always include a dependency array; enforce with `exhaustive-deps` |
| [Missing debounce on search](#missing-debounce-on-search) | One request per keystroke | Debounce input, cancel in-flight requests, guard against stale responses |
| [Over-fetching and lack of context](#over-fetching-and-lack-of-context) | Fetches the full dataset to compute something small client-side | Ask for the shape you need (a count/scoped endpoint), not the raw source |
| [Missing lazy loading](#missing-lazy-loading) | All images load eagerly, even offscreen ones | `loading="lazy"` by default; eager-load only above-the-fold images |
| [Missing virtualization for large datasets](#missing-virtualization-for-large-datasets) | Plain `.map()` over rows chokes past a few hundred | Virtualize (`react-window`/`react-virtual`); name the expected scale |
| [Missing resilience](#missing-resilience) | A fetch call has no timeout, retry, or failure boundary | Timeout + retry transient (not 4xx) failures + wrap in an `<ErrorBoundary>` |
