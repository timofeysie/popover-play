# Advanced useEffect

This section delves into the details of the dangerously useful `useEffect` React hook.

## useEffect Without a Dependency Array


```tsx
useEffect(() => {
  // ...
});
```

Is It Ever OK?

Yes — but it's quite rare, and in most React 18 code, an effect with no dependency array is a smell.

The above code snippet means it runs after every render.

Whereas this one:

```tsx
useEffect(() => {
  // ...
}, []);
```

... runs after the initial mount (with the React 18 development/Strict Mode caveat).

And this one:

```tsx
useEffect(() => {
  // ...
}, [value]);
```

... runs after mount and whenever `value` changes.

## When Is No Dependency Array Legitimate?

There are cases where you genuinely want to synchronize something after every render.

For example, suppose you're integrating with an imperative library where the DOM must be synchronized after React has rendered:

```tsx
function Component({ value }) {
  useEffect(() => {
    thirdPartyLibrary.update(value);
  });

  return <div>{value}</div>;
}
```

If `thirdPartyLibrary.update()` needs to run after every render, this can be intentional.

Another example might be measuring something whose relevant DOM state can change as a consequence of any render:

```tsx
useEffect(() => {
  const height = elementRef.current?.offsetHeight;
  reportHeight(height);
});
```

Although even here, it's worth first asking whether the effect can be made more targeted.

## The Important Rule

A useful way to think about it is:

> The dependency array isn't primarily an optimization. It describes what changes should cause the synchronization to happen.

So if your answer is genuinely *"I need this synchronization to happen after every render,"* then omitting the dependency array is valid.

But if you're writing:

```tsx
useEffect(() => {
  doSomething();
});
```

because you don't know what dependencies to put in it, that's not a good reason.

For example:

```tsx
useEffect(() => {
  fetchUser(userId);
});
```

is almost certainly wrong. It will fetch on every render:

```
render
  ↓
effect
  ↓
fetch
  ↓
setState
  ↓
render
  ↓
effect
  ↓
fetch
  ↓
...
```

Instead:

```tsx
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

## Why React 18 Makes This Particularly Worth Understanding

Strict Mode in development intentionally does some extra mounting/effect work to expose effects that aren't properly resilient to being run more than once. So an effect with no dependency array should be treated as saying something quite strong:

> Every time this component renders, I want to perform this synchronization.

If that isn't precisely what you mean, you probably want dependencies.

There's also a deeper point here: many things people put in `useEffect` shouldn't be in an effect at all. If you're using an effect merely to calculate derived data, respond to an event, or transform props into state, there's often a better React pattern.

## Quick Reference

| Form | Meaning |
|---|---|
| No dependency array | Occasionally correct, but requires a deliberate reason |
| `[]` | This synchronization doesn't depend on changing React values |
| `[a, b]` | This synchronization depends on `a` and `b` |
| No effect at all | Often the best answer |
