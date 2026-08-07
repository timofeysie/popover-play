# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests once (vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright e2e smoke tests (auto-starts the dev server)
```

To run a single test file: `npx vitest run src/test/example.test.ts`

## Architecture

This is a **CodeLab playground** (originally scaffolded with Lovable) built with Vite + React + TypeScript + Tailwind + shadcn/ui. It has two kinds of exercises living side by side:

- **Browser/CSS feature demos** — e.g. the Popover API, `env()`/safe-area-inset, `isolation: isolate`.
- **DSA algorithm visualizations** — step-through animations of algorithms (DFS, BFS, sliding window, BST traversal, etc.), each usually paired with a write-up in `docs/problems/`.

**Routing structure** (`src/App.tsx`):
- `Index` (`src/pages/Index.tsx`) is the shell layout — it renders the header and a native HTML Popover API side-nav (`<nav popover="auto" id="navigation">`), driven entirely by the `exercises` array at the top of that file. Child routes render via `<Outlet />`.
- The index route (`/`) renders `Dashboard` (`src/pages/Dashboard.tsx`), which shows a card grid of the algorithm demos (via their `autoPlay loop hideControls` preview mode — see below) with links into their full pages.
- Each other route is a thin `src/pages/*.tsx` wrapper around a component from `src/features/<name>/`.

**Adding a new exercise:**
1. Build the demo in `src/features/<name>/` (see feature module pattern below).
2. Create `src/pages/MyExercise.tsx` that renders it.
3. Add a `<Route>` in `src/App.tsx` under the `Index` parent.
4. Add an entry to the `exercises` array in `src/pages/Index.tsx` with `active: true` (this is what makes it appear in the popover nav).
5. If it's an algorithm demo, add it to the `DEMOS` array in `src/pages/Dashboard.tsx` so it shows up on the home page.

**Feature module pattern** (`src/features/<name>/`):
- A barrel `index.ts` re-exports the public pieces (the demo component, and often pure helper functions/types like `computeSteps`/`*Step` used for testing the algorithm independent of React).
- Algorithm demo components accept `autoPlay`, `loop`, and `hideControls` props so the same component can run unattended as a small preview card on `Dashboard` and as a fully interactive, controllable demo on its own page.
- Pure step-generation logic (e.g. `computeSteps`, BST helpers in `kthSmallestBst/kthSmallest.ts`) is kept separate from the animating component so it can be unit tested directly (see `src/test/`).

**Styling:**
- CSS custom properties (HSL) defined in `src/index.css`, consumed via Tailwind tokens in `tailwind.config.ts`.
- Custom `code` color tokens (`bg-code`, `text-code-keyword`, `text-code-string`, `text-code-tag`, `text-code-comment`) for syntax-highlighted code blocks rendered inline in JSX.
- The `#navigation` popover is styled entirely in `src/index.css` using `:popover-open`, `@starting-style`, and `::backdrop` — no JS animation.
- A few features (e.g. `javascriptGotchas`) use a CSS module instead of inline Tailwind classes.
- Fonts: Space Grotesk (sans) and JetBrains Mono (mono), loaded from Google Fonts.

**UI components:** shadcn/ui components live in `src/components/ui/` and are not intended to be modified directly.

**Testing:** vitest + jsdom + Testing Library (`src/test/setup.ts`). Tests target the pure algorithm logic exported from feature barrels (e.g. `src/test/fishStack.test.ts`, `src/features/kthSmallestBst/kthSmallestBst.test.ts`) rather than the animated components themselves. `e2e/` holds a small Playwright smoke suite (currently just the MCCM wizard's routing/manifest flow, `e2e/mccm.spec.ts`) — this is deliberately narrow, not a per-demo regression suite; see `docs/playwright-issues.md` for tooling gotchas hit while setting it up.

## Other notes

- `docs/` contains the author's personal DSA/algorithm write-ups (problem explanations, complexity notes, gotchas) — several correspond 1:1 with a feature demo (e.g. `docs/problems/two-sum.md` ↔ `src/features/twoSum/`). Useful background when working on a related demo, but not code that needs to stay in sync.
- `bun.lockb` is present alongside `package-lock.json`; this project is developed with npm — use `npm`, not `bun`, for installs and scripts.
