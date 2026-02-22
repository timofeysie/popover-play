# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests once (vitest)
npm run test:watch   # Run tests in watch mode
```

To run a single test file: `npx vitest run src/test/example.test.ts`

## Architecture

This is a **CSS/HTML feature playground** (CodeLab) built with Vite + React + TypeScript + Tailwind + shadcn/ui. Each page demonstrates a modern browser or CSS feature.

**Routing structure** (`src/App.tsx`):
- `Index` (`src/pages/Index.tsx`) is the shell layout — it renders the header and a native HTML Popover API side-nav (`<nav popover="auto" id="navigation">`). Child routes render via `<Outlet />`.
- `/` → `NativePopover` — Exercise 01: Popover API
- `/safe-area` → `SafeArea` — Exercise 02: `env()` / safe-area-inset
- `/isolation` → `IsolationProperty` — Exercise 03: `isolation: isolate`

**Adding a new exercise:**
1. Create `src/pages/MyExercise.tsx`
2. Add a `<Route>` in `src/App.tsx` under the `Index` parent
3. Add an entry to the `exercises` array in `src/pages/Index.tsx` with `active: true`

**Styling:**
- CSS custom properties (HSL) defined in `src/index.css`, consumed via Tailwind tokens in `tailwind.config.ts`
- Custom `code` color tokens (`bg-code`, `text-code-keyword`, `text-code-string`, `text-code-tag`, `text-code-comment`) for syntax-highlighted code blocks rendered inline in JSX
- The `#navigation` popover is styled entirely in `src/index.css` using `:popover-open`, `@starting-style`, and `::backdrop` — no JS animation
- Fonts: Space Grotesk (sans) and JetBrains Mono (mono), loaded from Google Fonts

**UI components:** shadcn/ui components live in `src/components/ui/` and are not intended to be modified directly.
