# Don't Mutate State Directly

## The Problem

A common mistake is to mutate a state object in place before passing it to the setter:

```tsx
const [user, setUser] = useState({ name: "John", age: 25 });

const updateAge = () => {
  user.age = 26;   // ❌ direct mutation
  setUser(user);   // same object reference — React sees no change
};
```

This "works" at first and then breaks later in completely different places, because React uses reference equality to decide whether state has changed. Mutating the object keeps the same reference, so React doesn't detect the update and may skip re-renders entirely — or re-render at the wrong time.

It gets especially tricky with nested objects. One small direct mutation and suddenly something doesn't re-render, or updates too late.

## The Fix

Always produce a new object so React receives a new reference:

```tsx
const updateAge = () => {
  setUser(prev => ({ ...prev, age: 26 }));   // ✅ immutable update
};
```

## Why It Matters Beyond Basic Cases

Immutable updates aren't just best practice — they're essential as soon as you introduce any of the following:

- **`React.memo` / `useMemo` / `useCallback`** — memoisation compares previous and next props/values by reference. A mutated object passes the same reference, so memoised components never re-render even when the data has changed.
- **`useEffect` dependency arrays** — a mutated object won't trigger an effect that lists that object as a dependency.
- **State management libraries (Redux, Zustand, Jotai…)** — all built around the assumption that state is never mutated directly.
- **Concurrent Mode & React 19 optimisations** — React may read state multiple times; mutations create race conditions that are nearly impossible to debug.

## Nested Objects

Spread only one level deep, so go as deep as the value you're changing:

```tsx
// State: { user: { address: { city: "Berlin" } } }

// ❌ only spreads the top level — nested objects are still shared
setState(prev => ({ ...prev, user: prev.user }));

// ✅ spread every level that contains the changed value
setState(prev => ({
  ...prev,
  user: {
    ...prev.user,
    address: {
      ...prev.user.address,
      city: "Munich",
    },
  },
}));
```

For deeply nested state, consider flattening the shape, using [`useImmer`](https://github.com/immerjs/use-immer), or restructuring into separate `useState` calls.

## Quick Reference

| Pattern | Reference changes? | React detects update? |
|---|---|---|
| `state.value = x` then `setState(state)` | No | ❌ |
| `setState({ ...state, value: x })` | Yes | ✅ |
| `setState(prev => ({ ...prev, value: x }))` | Yes | ✅ |

If you apply immutable updates consistently from the start, you save yourself a lot of debugging later.
