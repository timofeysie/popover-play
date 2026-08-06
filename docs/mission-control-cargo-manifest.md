# Mission Control Cargo Manifest (MCCM) — Plan

A multi-step cargo requisition wizard, skinned as a sci-fi "mission control" console.
Its real purpose is a demo surface for four skill areas: React application-level
architecture, strict TypeScript, Zustand for transactional form state, and REST +
real-time API integration.

## Theme

You're provisioning a resupply run for a space station. Steps:

1. **Cargo Manifest** — search/browse a catalog and add items to the manifest (pagination + search against a real API).
2. **Destination & Clearance** — pick a station/sector; conditional fields appear based on cargo contents (e.g. hazardous cargo requires a clearance code).
3. **Review & Launch** — review the manifest, see the total converted to "galactic credits" via a live price feed, then submit.

Each step is its own route; the URL is the source of truth for "which step am I on,"
while Zustand holds the actual manifest data across steps.

## Tech-to-skill mapping

**Modern Frontend Frameworks (React, app-level concerns)**
- Routing-as-state: `/mccm/cargo`, `/mccm/destination`, `/mccm/review` are real routes (not a single component with local `step` state), so back/forward/refresh/deep-links all work.
- Step components are code-split and read/write a shared store rather than prop-drilling wizard state.
- Rendering strategy: cargo catalog list is paginated/virtualized-friendly; the live credit ticker is isolated in its own subtree so WebSocket updates don't re-render the whole wizard.

**TypeScript**
- Strict types for the manifest domain model (`CargoItem`, `Manifest`, `Destination`), generic API client wrapper (`fetchJson<T>`), and a typed Zustand store (`MccmState` + typed actions/selectors).
- Zod schemas per step, inferred into RHF's `z.infer<typeof schema>` types — single source of truth for both runtime validation and compile-time types.

**State Management (Zustand + React Hook Form)**
- Zustand store owns the durable, cross-step manifest (items, destination, clearance, computed totals) — this is the "transactional workflow" state that must survive navigating between steps.
- Each step's RHF form is `defaultValues`-hydrated from the Zustand store and commits back to the store `onSubmit`/step-change, not on every keystroke — a deliberate separation between "form-local validation state" (RHF) and "workflow state" (Zustand).
- Cross-field/conditional logic: hazardous cargo → clearance code becomes required; destination sector → available shipping lanes narrow. Demonstrated with Zod `superRefine` / conditional schemas.

**API Integration**
- REST: [DummyJSON](https://dummyjson.com) `/products` as the cargo catalog — search, pagination, and caching demoed via TanStack Query (already a project dependency).
- Real-time: a public Binance WebSocket stream (e.g. `btcusdt@trade`, no auth required) repurposed as the "galactic credit exchange rate," live-updating the manifest total on the review step.
- Error handling: catalog fetch failures, WS reconnect/backoff, and an offline/stale-price affordance on the review step.

## Status

This is the plan only. Next step is breaking this into concrete milestones (store shape,
API client, step 1 UI, step 2 UI, step 3 + WS ticker, polish) before writing wizard code.
