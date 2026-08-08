# M5 — Step 2: Destination & Clearance

**Goal:** a React Hook Form step with cascading station → sector selects and a
clearance-code field that's conditionally required based on cross-step state
(hazardous cargo on the M2 store), hydrated from and committed back to the store.

**Files:** `steps/DestinationStep.tsx`, `steps/destinationSchema.ts`, `stations.ts`

## The conditional schema isn't static

`clearanceCode` being required depends on `hasHazardousCargo`, which lives in
the Zustand store, not in the form. Rather than a fixed Zod schema, the schema
is a function of that boolean, rebuilt whenever it changes:

```ts
export function destinationFormSchema(hasHazardousCargo: boolean) {
  return z
    .object({
      station: z.string().min(1, "Select a station"),
      sector: z.string().min(1, "Select a sector"),
      clearanceCode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (hasHazardousCargo && !data.clearanceCode?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["clearanceCode"],
          message: "Clearance code is required for hazardous cargo",
        });
      }
    });
}
```

The component reads `hasHazardousCargo` via the M2 `selectHasHazardousCargo`
selector and memoizes the resulting schema so `zodResolver` only rebuilds when
the flag actually flips:

```tsx
const hasHazardousCargo = useMccmStore(selectHasHazardousCargo);
const schema = useMemo(() => destinationFormSchema(hasHazardousCargo), [hasHazardousCargo]);
const form = useForm<DestinationFormValues>({ resolver: zodResolver(schema), defaultValues: {/* ... */} });
```

A whitespace-only clearance code (`"   "`) fails the same `superRefine` check
via `.trim()` — covered directly in `mccmDestination.test.ts` rather than left
as an edge case someone finds later.

## Cascading selects reset the dependent field

Changing `station` clears whatever `sector` was previously selected, since the
old value likely isn't a valid option for the new station:

```tsx
<Select
  onValueChange={(value) => {
    field.onChange(value);
    form.resetField("sector", { defaultValue: "" });
  }}
  value={field.value}
>
```

`sectorsForStation` (`stations.ts`) is a pure lookup — `STATIONS.find(...).sectors ?? []`
— so it's unit tested directly rather than through the rendered selects, same
as the M1/M2 pattern of keeping logic separable from components.

## Hydrate from the store, commit back on submit

`defaultValues` reads `destination` and `clearanceCode` straight from the
store, so refreshing mid-step doesn't lose entered values. `onSubmit` writes
back and clears `clearanceCode` to `null` if hazardous cargo isn't present
(so a stale code from a since-removed hazmat item doesn't linger):

```tsx
const onSubmit = (values: DestinationFormValues) => {
  setDestination({ station: values.station, sector: values.sector });
  setClearanceCode(hasHazardousCargo ? (values.clearanceCode?.trim() ?? null) : null);
  navigate("/mccm/review");
};
```

## The clearance field's appearance is animated, not just conditional

`AnimatePresence`/`motion.div` (height + opacity) around the hazard banner and
clearance field means the field doesn't just pop in — it's the same "state
change should be visible" idea as M4's flying-cargo-image, applied to a form
field instead of a list item.

## Testing this step

Same split as the rest of the project: `destinationSchema.ts` and
`stations.ts` are pure and unit tested (`mccmDestination.test.ts` — 7 cases
covering required fields, hazardous/non-hazardous pass-fail, and the
whitespace edge case). The rendered form is covered by two new Playwright
cases in `e2e/mccm.spec.ts`: an empty submit blocked with visible field
errors, and a full station → sector → submit flow reaching `/mccm/review`.
