# M1 — Domain types & API client

**Goal:** model the cargo domain in TypeScript, then build two typed API clients — a REST client against a real public product API, and a WebSocket client against a real public exchange feed — that translate those foreign shapes into the domain model.

**Files:** `types.ts`, `api/cargoClient.ts`, `api/creditStream.ts`

## Domain modeling with TypeScript

`types.ts` is the single source of truth for the wizard's shape. Nothing fancy — a union type and a handful of interfaces — but it's what everything downstream (the store, the forms, the components) is typed against:

```ts
export type ClearanceLevel = "public" | "hazmat";

export interface CargoItem {
  id: number;
  title: string;
  category: string;
  unitPriceUsd: number;
  thumbnailUrl: string;
  stock: number;
  clearanceLevel: ClearanceLevel;
}

export interface ManifestLine {
  item: CargoItem;
  quantity: number;
}

export interface Destination {
  station: string;
  sector: string;
}

export interface Manifest {
  lines: ManifestLine[];
  destination: Destination | null;
  clearanceCode: string | null;
}
```

`ClearanceLevel` is the load-bearing type here — it's what M5's conditional validation keys off, and it's set entirely inside the API client below, not by the user.

## A generic, typed fetch wrapper

Rather than sprinkling `await fetch(...).then(r => r.json())` everywhere, there's one generic helper:

```ts
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}
```

The `<T>` means every caller gets a typed result instead of `any`, and there's exactly one place that decides what "failed" means (non-2xx → throw), which is what makes error states in later steps trivial to build.

## Repurposing a real public API into the domain

[DummyJSON](https://dummyjson.com) has no concept of "cargo" or "hazmat" — it's a product catalog. The mapping layer is what turns it into one:

```ts
const HAZMAT_CATEGORIES = new Set([
  "fragrances",
  "skin-care",
  "automotive",
  "motorcycle",
  "lighting",
]);

function clearanceLevelFor(category: string): ClearanceLevel {
  return HAZMAT_CATEGORIES.has(category) ? "hazmat" : "public";
}

function toCargoItem(product: DummyJsonProduct): CargoItem {
  return {
    id: product.id,
    title: product.title,
    category: product.category,
    unitPriceUsd: product.price,
    thumbnailUrl: product.thumbnail,
    stock: product.stock,
    clearanceLevel: clearanceLevelFor(product.category),
  };
}
```

`fetchCargoCatalog` then picks between DummyJSON's two endpoints — `/products/search?q=` when there's a query, plain `/products` when there isn't — and converts DummyJSON's `skip`-based pagination into a `page`-based one for the caller:

```ts
export async function fetchCargoCatalog({
  query = "",
  page = 0,
  limit = 12,
}: FetchCargoCatalogParams = {}): Promise<CargoCatalogPage> {
  const skip = page * limit;
  const trimmedQuery = query.trim();
  const url = trimmedQuery
    ? `${DUMMYJSON_BASE_URL}/products/search?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}&skip=${skip}&select=${PRODUCT_FIELDS}`
    : `${DUMMYJSON_BASE_URL}/products?limit=${limit}&skip=${skip}&select=${PRODUCT_FIELDS}`;

  const data = await fetchJson<DummyJsonProductsResponse>(url);

  return { items: data.products.map(toCargoItem), total: data.total, page, limit };
}
```

Everything above the return statement is DummyJSON's shape; everything in the return statement is the wizard's shape. That boundary is the whole point of the client — nothing outside `cargoClient.ts` ever sees a `DummyJsonProduct`.

## A real-time feed, wrapped the same way

The "galactic credits" ticker is Binance's public trade stream (`btcusdt@trade`) — no auth, no API key, just a WebSocket URL. The wrapper follows a subscribe/unsubscribe shape that's easy to plug into a `useEffect` later:

```ts
export function subscribeToCreditExchangeRate(
  onUpdate: (update: CreditPriceUpdate) => void,
  onError?: (event: Event) => void,
): Unsubscribe {
  const socket = new WebSocket(BINANCE_STREAM_URL);

  socket.addEventListener("message", (event: MessageEvent<string>) => {
    const trade = JSON.parse(event.data) as BinanceTradeEvent;
    onUpdate({ priceUsd: Number(trade.p), timestamp: trade.E });
  });

  if (onError) socket.addEventListener("error", onError);

  return () => socket.close();
}
```

Returning a plain `() => void` cleanup function (rather than exposing the socket itself) means the eventual `ReviewStep` component can do `useEffect(() => subscribeToCreditExchangeRate(setPrice), [])` and get automatic cleanup on unmount for free — no manual socket bookkeeping in the component.

## Testing without a network or a real socket

Both clients are pure enough to unit test by mocking the global `fetch`/`WebSocket`:

```ts
const fetchMock = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(mockResponse),
});
vi.stubGlobal("fetch", fetchMock);

const result = await fetchCargoCatalog({ page: 0, limit: 12 });
expect(result.items[0].clearanceLevel).toBe("hazmat");
```

```ts
class FakeWebSocket {
  addEventListener(type: string, handler: (event: { data: string }) => void) {
    listeners[type] = handler;
  }
  close() {}
}
vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);
```

See `src/test/missionControlCargoManifestApi.test.ts` (6 tests) — covering the hazmat mapping, the search-vs-browse URL switch, pagination math, HTTP error propagation, and the trade-event parsing.