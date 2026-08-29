# M4 — Step 1: Cargo Manifest

**Goal:** a real data-fetching UI — search, pagination, caching, loading/empty/error states — wired to the M2 store, plus (added in a follow-up pass) a few Framer Motion micro-interactions that make adding cargo feel tactile rather than just re-rendering a list.

**File:** `steps/CargoManifestStep.tsx`

## Debounced search feeding a cached query

Two pieces of state track the search box: `searchInput` (what's on screen, updates every keystroke) and `query` (what's actually fetched, updates 350ms after typing stops). TanStack Query is keyed on the debounced value plus the current page:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setQuery(searchInput.trim());
    setPage(0);
  }, SEARCH_DEBOUNCE_MS);
  return () => clearTimeout(timer);
}, [searchInput]);

const { data, isPending, isFetching, isError, error, refetch } = useQuery({
  queryKey: ["mccm-cargo-catalog", query, page],
  queryFn: () => fetchCargoCatalog({ query, page, limit: PAGE_SIZE }),
  placeholderData: keepPreviousData,
});
```

`placeholderData: keepPreviousData` is what makes pagination and caching visible rather than theoretical: flipping back to a page you've already seen returns instantly from cache instead of refetching, and moving to a *new* page keeps the old results on screen (dimmed via `isFetching`) instead of flashing a loading spinner over the whole grid.

## Loading / empty / error, each handled distinctly

```tsx
{isPending ? (
  <Loader2 className="animate-spin" /> // Loading cargo catalog…
) : data && data.items.length === 0 ? (
  // No cargo matches "{query}".
) : (
  data && <div className={isFetching ? "opacity-60" : ""}>{/* grid of CargoItemCard */}</div>
)}

{isError && (
  <div>
    Couldn't load the cargo catalog{error instanceof Error ? `: ${error.message}` : ""}.
    <button onClick={() => refetch()}>Retry</button>
  </div>
)}
```

`isPending` (no data yet at all) is distinct from `isFetching` (a background refetch while stale data is still shown) — conflating the two is a common TanStack Query mistake that would make every page change flash a full-page spinner instead of just dimming the existing grid.

## The store is the only place "is this on the manifest" lives

The grid has no local state for cart membership — every card asks the M2 store directly:

```tsx
const lines = useMccmStore((state) => state.lines);
const addCargoItem = useMccmStore((state) => state.addCargoItem);
const removeCargoItem = useMccmStore((state) => state.removeCargoItem);

const manifestQuantity = (itemId: number) =>
  lines.find((line) => line.item.id === itemId)?.quantity ?? 0;
```

Because `removeCargoItem` (from M2) removes the whole line rather than decrementing, the card's UI matches that exactly — an "Add another" (+1) button and a separate "Remove" button, no quantity stepper implying a decrement that doesn't exist:

```tsx
{quantity === 0 ? (
  <button onClick={() => onAdd(imgRef.current)}>+ Add</button>
) : (
  <>
    <span>Qty {quantity}</span>
    <button onClick={() => onAdd(imgRef.current)} aria-label={`Add another ${item.title}`}>+</button>
    <button onClick={onRemove} aria-label={`Remove ${item.title} from manifest`}>Remove</button>
  </>
)}
```

## The flying-image micro-interaction

The one piece of real complexity added in the follow-up pass: clicking "Add" animates a clone of the item's thumbnail flying from the card to the manifest badge. It works by measuring both elements' screen positions at click time and animating the delta:

```tsx
const handleAddToManifest = (item: CargoItem, imgEl: HTMLImageElement | null) => {
  addCargoItem(item);

  const from = imgEl?.getBoundingClientRect();
  const to = manifestBadgeRef.current?.getBoundingClientRect();
  if (!from || !to) return;

  setFlights((current) => [...current, { id: `${item.id}-${Date.now()}`, src: item.thumbnailUrl, from, to }]);
};
```

```tsx
function FlyingCargoImage({ flight, onComplete }: { flight: Flight; onComplete: () => void }) {
  const path = useMemo(() => arc({ strength: 0.4, peak: 0.5, rotate: true }), []);
  const dx = flight.to.left + flight.to.width / 2 - (flight.from.left + flight.from.width / 2);
  const dy = flight.to.top + flight.to.height / 2 - (flight.from.top + flight.from.height / 2);

  return (
    <motion.img
      src={flight.src}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: dx, y: dy, scale: 0.25, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeIn", path, opacity: { duration: 0.55, delay: 0.2 } }}
      onAnimationComplete={onComplete}
      style={{ top: flight.from.top, left: flight.from.left, width: flight.from.width, height: flight.from.height }}
    />
  );
}
```

The store update (`addCargoItem`) happens immediately, synchronously, regardless of whether the animation can run (`if (!from || !to) return` bails on the animation only) — the flight is pure visual polish layered on top of state that's already correct, not something the correctness of the feature depends on. `onAnimationComplete` removes the flight from `flights` once it finishes, so `AnimatePresence` can clean it up.

The manifest panel itself uses lighter touches of the same library — `layout` on each `motion.li` so removing a line reflows the rest with a spring instead of a jump-cut, and a `key={totalQuantity}` remount trick on the badge icon/count so it "pops" on every change.

## Testing this step

Unit tests stayed at the API/store layer (M1, M2) rather than testing this component directly, per this project's convention of testing pure logic over animated components. Instead, a small Playwright e2e suite was added (`e2e/mccm.spec.ts`, run via `npm run test:e2e`) that drives the real dev server:

```ts
test("adding an item updates the manifest panel", async ({ page }) => {
  await page.goto("/mccm/cargo");
  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(page.getByText("1 line")).toBeVisible();
  await expect(page.getByText(/Qty 1 · \$/)).toBeVisible();
});

test("visiting review with an empty manifest redirects back to cargo", async ({ page }) => {
  await page.goto("/mccm/review");
  await expect(page).toHaveURL(/\/mccm\/cargo$/);
});
```

`docs/playwright-issues.md` has the environment gotchas hit while setting this up (no `chromium-cli` in this sandbox, `text=` locators not matching `<input placeholder>`, one-time browser binary install) — worth a read before touching the e2e suite.
