# The App Version Error

![The "Cannot find name '__APP_VERSION__'" TypeScript error shown in the editor](/notes/app-version-ts-error.png)

The above error was seen in the header (`src/pages/Index.tsx`) file which shows the app's version next to the CodeLab logo. But the `__APP_VERSION__` variable isn't a real global — it's a build-time constant injected by Vite.

## How it's defined

`vite.config.ts` reads the `version` field out of `package.json` and wires it up via Vite's [`define`](https://vitejs.dev/config/shared-options.html#define) option:

```ts
const { version } = JSON.parse(
  readFileSync(path.resolve(__dirname, "./package.json"), "utf-8"),
) as { version: string };

export default defineConfig(({ mode }) => ({
  // ...
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
}));
```

`define` does a literal text substitution at build time: every occurrence of `__APP_VERSION__` in the source is replaced with the JSON-stringified version string before TypeScript or esbuild ever sees it. So `v{__APP_VERSION__}` becomes `v{"1.2.3"}` in the bundle. This is why bumping `version` in `package.json` is enough to change the displayed version — no other code needs to change.

## Why TypeScript needs to know about it separately

Since `define` is a pure text-replacement step, TypeScript has no idea `__APP_VERSION__` exists unless it's told. That's what the ambient declaration in `src/vite-env.d.ts` is for:

```ts
declare global {
  const __APP_VERSION__: string;
  // ...
}
```

### The gotcha: `export {}` turns the file into a module

`vite-env.d.ts` ends with `export {}`, which is required so the `declare global { ... }` block (used there to augment `React.HTMLAttributes` with `popover` props) actually merges into the global scope.

But that same `export {}` has a side effect: any file with a top-level `import`/`export` is treated by TypeScript as a **module**, not a script. Ambient declarations (`declare const ...`) written at the *top level* of a module are scoped to that module only — they don't merge into the global scope.

So this placement is broken (looks fine, but the declaration is invisible everywhere else):

```ts
declare const __APP_VERSION__: string; // scoped to this module only — bug

declare global {
  namespace React { /* ... */ }
}

export {};
```

And this placement is correct — the declaration has to live *inside* the `declare global` block to actually be global:

```ts
declare global {
  const __APP_VERSION__: string;

  namespace React { /* ... */ }
}

export {};
```

Runtime behavior is identical either way (Vite's text replacement doesn't care about TS scoping at all), but only the second form clears the editor error:

```
Cannot find name '__APP_VERSION__'. ts(2304)
```
