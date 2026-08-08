# M2 — Zustand store

**Goal:** hold the wizard's cross-step state (the manifest, destination, clearance code) in a single typed Zustand store, with derived values exposed as selectors.

**File:** `store/mccmStore.ts`

## Store shape and the double-call syntax

```ts
export interface MccmState {
  lines: ManifestLine[];
  destination: Destination | null;
  clearanceCode: string | null;
}

export interface MccmActions {
  addCargoItem: (item: CargoItem, quantity?: number) => void;
  removeCargoItem: (itemId: number) => void;
  setDestination: (destination: Destination) => void;
  setClearanceCode: (code: string | null) => void;
  reset: () => void;
}

export type MccmStore = MccmState & MccmActions;

export const useMccmStore = create<MccmStore>()((set) => ({
  ...initialState,
  addCargoItem: (item, quantity = 1) => set((state) => { /* ... */ }),
  // ...
}));
```

The `create<MccmStore>()((set) => ...)` — two calls instead of one — isn't a typo. It's a curried-generics workaround: TypeScript can't always infer a generic from a later argument, so Zustand splits `create` into "give me the type" and "here's the implementation" so `set`'s type comes through correctly without having to annotate every action by hand.

State and actions live in the same object — no separate reducer, no action-type constants, no dispatch. Compared to the Redux-style ceremony this project intentionally avoids, a Zustand store reads like a plain object with methods that happen to trigger re-renders.

## The interesting action: merge-or-append

`addCargoItem` is the one action with real logic — adding an item already on the manifest bumps its quantity instead of creating a duplicate line:

```ts
addCargoItem: (item, quantity = 1) =>
  set((state) => {
    const existing = state.lines.find((line) => line.item.id === item.id);
    if (existing) {
      return {
        lines: state.lines.map((line) =>
          line.item.id === item.id
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        ),
      };
    }
    return { lines: [...state.lines, { item, quantity }] };
  }),
```

`removeCargoItem` deliberately removes the whole line regardless of quantity — there's no decrement action. That's a real constraint the UI in M4 designs around (an "Add another" button plus a "Remove" button, not a quantity stepper).

## Selectors: derived values without recomputing in components

Rather than have every component that needs "is there hazmat cargo on the manifest?" or "what's the subtotal?" recompute it inline, those are exported as plain functions over the state shape:

```ts
export function selectHasHazardousCargo(state: MccmState): boolean {
  return state.lines.some((line) => line.item.clearanceLevel === "hazmat");
}

export function selectSubtotalUsd(state: MccmState): number {
  return state.lines.reduce((sum, line) => sum + line.item.unitPriceUsd * line.quantity, 0);
}
```

Consumed as `useMccmStore(selectSubtotalUsd)` — Zustand only re-renders the component when the *selected* value changes, not on every store update, so a component reading just the subtotal doesn't re-render when, say, the destination changes. `selectHasHazardousCargo` is the one that matters most: it's what M5's destination form schema reads to decide whether `clearanceCode` is required.

## Testing without React

Because the store is a module-level singleton independent of any component tree, it's testable by calling actions directly — no `render()`, no hooks:

```ts
beforeEach(() => {
  useMccmStore.getState().reset();
});

it("flips true as soon as any hazmat item is on the manifest", () => {
  useMccmStore.getState().addCargoItem(snack);
  useMccmStore.getState().addCargoItem(fuel);

  expect(selectHasHazardousCargo(useMccmStore.getState())).toBe(true);
});
```

See `src/test/mccmStore.test.ts` (10 tests) — covering add/merge/remove, destination and clearance setters, `reset`, and both selectors including the hazmat flip on add and on remove.
