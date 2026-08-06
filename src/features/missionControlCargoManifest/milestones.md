# MCCM Wizard — Milestone Plan

Build order for the Mission Control Cargo Manifest wizard described in
[`docs/mission-control-cargo-manifest.md`](../../docs/mission-control-cargo-manifest.md).
Each milestone should land as its own PR-sized chunk, in order — later milestones
depend on earlier ones existing and typechecking.

## M0 — Dependencies & scaffolding

- Add `zustand` to `package.json` (not yet a project dependency; `react-hook-form`, `zod`, and `@tanstack/react-query` already are).
- Create `src/features/missionControlCargoManifest/` subfolders: `api/`, `store/`, `steps/`.
- No behavior yet — goal is `npm run build` and `npm run lint` staying green with the new empty structure in place.

**Done when:** `zustand` installed, folders exist, build/lint/typecheck pass.

## M1 — Domain types & API client

- `types.ts`: `CargoItem`, `ManifestLine`, `Destination`, `ClearanceLevel`, `Manifest`.
- `api/cargoClient.ts`: generic `fetchJson<T>(url, init?)` wrapper (typed, throws on non-2xx) plus `fetchCargoCatalog({ query, page, limit })` hitting DummyJSON's `/products` (mapped into `CargoItem[]`, aliasing product → cargo item fields).
- `api/creditStream.ts`: typed wrapper around a Binance public WebSocket (`btcusdt@trade`), exposing a small subscribe/unsubscribe API and a parsed `{ price, timestamp }` shape — no React yet, just the client.

**Done when:** both API modules have unit tests against mocked `fetch`/`WebSocket` (per `CLAUDE.md`, pure logic separated from components so it's directly testable — see `src/test/`).

## M2 — Zustand store

- `store/mccmStore.ts`: typed store (`MccmState` + actions) holding the durable cross-step state — manifest lines, destination, clearance code, derived totals.
- Actions: `addCargoItem`, `removeCargoItem`, `setDestination`, `setClearanceCode`, `reset`.
- Selectors for derived values (e.g. `hasHazardousCargo`, `subtotalUsd`) so components don't recompute inline.

**Done when:** store has unit tests covering the cross-field rule (adding hazardous cargo flips `hasHazardousCargo`, which downstream Zod schemas depend on).

## M3 — Routing skeleton

- Nested routes under `/mccm`: `/mccm/cargo`, `/mccm/destination`, `/mccm/review`, with `/mccm` redirecting to `/mccm/cargo`.
- A step layout component (progress indicator + `<Outlet />`) so the three step pages share a shell.
- Guard: visiting `/mccm/review` with an empty manifest redirects back to `/mccm/cargo` (demonstrates URL-as-state driving real navigation, not just display).
- Update `src/App.tsx` routes and replace the current single `/mccm` plan-page route with this nested structure (keep the plan content reachable, e.g. move it to a `/mccm/plan` route or fold a summary into the step shell — decide when implementing).

**Done when:** all three step routes render (empty placeholders), guard redirect works, nav/back-forward behaves correctly.

## M4 — Step 1: Cargo Manifest

- `steps/CargoManifestStep.tsx`: search input + paginated catalog grid backed by TanStack Query (`useQuery` keyed on `[query, page]`, demonstrating caching — repeated searches/pages don't refetch).
- Add-to-manifest button per item writes into the Zustand store directly (catalog browsing state stays local/query-owned; manifest membership is store-owned).
- Loading, empty-results, and fetch-error states.

**Done when:** can search, paginate, add/remove items, and the manifest persists if you navigate away and back.

## M5 — Step 2: Destination & Clearance

- `steps/DestinationStep.tsx`: React Hook Form step with cascading selects (station → sector) and a conditional `clearanceCode` field.
- Zod schema with `superRefine`: `clearanceCode` required iff `hasHazardousCargo` (read from the store) is true.
- `defaultValues` hydrated from the store; `onSubmit` commits back to the store and advances the route.

**Done when:** clearance field appears/becomes required only when hazardous cargo is present; validation errors block navigation; refreshing the page mid-step preserves entered values (hydrated from store).

## M6 — Step 3: Review & Launch

- `steps/ReviewStep.tsx`: manifest summary, destination summary, and a live "galactic credits" total using the M1 WebSocket client (subscribe on mount, unsubscribe on unmount).
- Stale/disconnected price affordance (e.g. last-known price + "reconnecting…" state) so the real-time error-handling story is visible, not just the happy path.
- Submit action (simulated — no real backend) resets the store and shows a confirmation state.

**Done when:** total updates live from the WS feed, disconnect/reconnect is visibly handled, submit clears the manifest and confirms.

## M7 — Polish & nav

- Replace the placeholder plan-only `/mccm` page content from the earlier milestone with a short "About this demo" blurb (linking to the docs write-up) inside the step shell, rather than a separate page.
- Update `src/pages/Index.tsx` nav label if the route shape changed.
- Sweep for consistent styling with the rest of the app (existing `bg-card`/`text-muted-foreground`/etc. tokens, no ad hoc colors).

**Done when:** `npm run lint`, `npx tsc --noEmit`, and `npm run test` are all clean, and the full flow (cargo → destination → review → submit) works end-to-end in the browser.
