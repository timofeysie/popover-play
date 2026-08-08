# M0 — Dependencies & scaffolding

**Goal:** get `zustand` into the project and make room for the wizard's internal structure before writing any real code.

## Why Zustand, alongside React Hook Form

This is the one decision underpinning the whole "state management" story of the demo, so it's worth stating explicitly even though M0 itself is almost no code:

- **React Hook Form** owns *per-step, local form state* — the fields on screen right now, their validation, their dirty/touched status. This state is disposable: once a step is submitted, RHF's job is done.
- **Zustand** owns the *durable, cross-step state* — the manifest lines, the destination, the clearance code. This is the "transactional workflow" state: it has to survive navigating between `/mccm/cargo`, `/mccm/destination`, and `/mccm/review`, which unmount and remount components as the user moves through the wizard.

Keeping these separate (rather than lifting everything into one giant form, or putting transient input state in a global store) is the pattern later milestones build on: each step's RHF form gets `defaultValues` hydrated *from* the store, and commits back *to* the store on submit (see M5 — Step 2: Destination & Clearance once it's documented).

## What was added

```diff
   "dependencies": {
     ...
+    "zustand": "^5.0.14"
   },
```

That's it for dependencies — `react-hook-form`, `zod`, `@hookform/resolvers`, and `@tanstack/react-query` were already in `package.json` from the rest of the CodeLab project.

## The folder scaffolding that *didn't* happen

The original milestone plan called for pre-creating empty `api/`, `store/`, and `steps/` subfolders. That step was skipped deliberately: **git doesn't track empty directories**, so an empty folder created in M0 would either need a placeholder file (dead weight) or would simply vanish from the repo until something was actually written into it.

Instead, each folder was created naturally as its first real file landed:
- `api/` appeared in M1 — Domain types & API client, when `cargoClient.ts` was written.
- `store/` appeared in M2 — Zustand store, when `mccmStore.ts` was written.
- `steps/` appeared in M3 — Routing skeleton, when the first step component was written.

A small example of not scaffolding ahead of actual need.

## Verifying

No behavior to check yet — the bar for M0 was just `npx tsc --noEmit`, `npm run lint`, and `npm run build` staying green with the new dependency in place.
