# Lint rules as guardrails

Prompts and reviewers are both easy to route around — a prompt can under-specify, a reviewer can miss a diff on a Friday. Lint rules can't be skipped by accident: they run on every file, every time, and fail the build instead of just leaving a comment. That makes them the cheapest way to catch the [architectural drift](/notes/code-quality-and-maintainability#architectural-design) AI agents tend to introduce — reaching for a raw `fetch` instead of the shared data layer, or reimplementing a util that already exists two folders over.

Three rules cover most of what shows up in practice.

## Ban raw fetch outside the data layer

If your project has a `useX`/`apiClient` convention, a bare `fetch(...)` anywhere else is almost always an AI agent skipping it. `no-restricted-syntax` catches this at the AST level, so it fires even when `fetch` is buried inside a `useEffect`:

```js
// eslint.config.js
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/lib/api/**"], // the data layer itself is allowed to call fetch
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "CallExpression[callee.name='fetch']",
        message: "Use the shared api client (src/lib/api) instead of calling fetch directly.",
      },
    ],
  },
},
```

## Enforce folder boundaries

`eslint-plugin-boundaries` turns your folder conventions (feature modules, layers) into an enforced dependency graph, so a feature can't reach into another feature's internals or bypass the layer it's supposed to go through:

```js
// eslint.config.js
import boundaries from "eslint-plugin-boundaries";

{
  plugins: { boundaries },
  settings: {
    "boundaries/elements": [
      { type: "feature", pattern: "src/features/*" },
      { type: "page", pattern: "src/pages/*" },
      { type: "ui", pattern: "src/components/ui/*" },
    ],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: "feature", allow: ["ui"] },      // features may use shared ui
          { from: "page", allow: ["feature", "ui"] }, // pages compose features
          // no rule allows feature -> feature: cross-feature imports are blocked
        ],
      },
    ],
  },
},
```

With this in place, an agent that tries to import directly from a sibling feature's internals fails the lint step instead of quietly shipping a coupling that only a careful reviewer would have caught.

## Catch missing effect dependencies

[Infinite API loops](/notes/performance-and-reliability#infinite-api-loops) almost always trace back to the same root cause: a `useEffect` whose dependency array doesn't actually list everything the effect reads. `eslint-plugin-react-hooks`'s `exhaustive-deps` rule statically analyzes the effect body and flags any value used inside but missing from the array — including the "no array at all" case that reruns the effect on every render:

```js
// eslint.config.js
import reactHooks from "eslint-plugin-react-hooks";

{
  plugins: { "react-hooks": reactHooks },
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error", // most starters ship this as a warning; error catches it in CI
  },
},
```

```tsx
useEffect(() => {
  fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
}, []);
```
*❌ Flagged — `id` is read inside the effect but missing from the dependency array*

```tsx
useEffect(() => {
  fetch(`/api/users/${id}`).then(r => r.json()).then(setUser);
}, [id]);
```
*✅ Passes — every value the effect reads is listed*

It won't catch every infinite-loop shape — an effect that unconditionally calls its own setter is dependency-complete and still loops — but it eliminates the most common AI-generated cause: an effect that's just missing its array.

## Why this beats relying on prompts alone

- **It doesn't decay.** A convention documented only in `CLAUDE.md` erodes as sessions get long or context gets summarized; a lint rule doesn't forget.
- **It catches what review misses.** A duplicated fetch call or a cross-feature import is easy to approve in a large diff — a rule flags it regardless of diff size.
- **It's enforceable in CI**, not just advisory — the same guardrail applies whether the code came from an agent or a human.

Treat repeated AI mistakes as a signal to add a rule, not just a reminder for next time.
