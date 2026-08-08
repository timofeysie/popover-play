import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fetchCargoCatalog,
  subscribeToCreditExchangeRate,
} from "@/features/missionControlCargoManifest";

describe("fetchCargoCatalog", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps DummyJSON products into cargo items and flags hazmat categories", async () => {
    const mockResponse = {
      products: [
        { id: 1, title: "Rocket Fuel", category: "automotive", price: 42, thumbnail: "fuel.png", stock: 5 },
        { id: 2, title: "Space Snack", category: "groceries", price: 3, thumbnail: "snack.png", stock: 50 },
      ],
      total: 2,
      skip: 0,
      limit: 12,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchCargoCatalog({ page: 0, limit: 12 });

    expect(result.items).toEqual([
      {
        id: 1,
        title: "Rocket Fuel",
        category: "automotive",
        unitPriceUsd: 42,
        thumbnailUrl: "fuel.png",
        stock: 5,
        clearanceLevel: "hazmat",
      },
      {
        id: 2,
        title: "Space Snack",
        category: "groceries",
        unitPriceUsd: 3,
        thumbnailUrl: "snack.png",
        stock: 50,
        clearanceLevel: "public",
      },
    ]);
    expect(result.total).toBe(2);
    expect(fetchMock.mock.calls[0][0]).toContain("/products?");
  });

  it("hits the search endpoint when a query is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [], total: 0, skip: 0, limit: 12 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchCargoCatalog({ query: "phone" });

    expect(fetchMock.mock.calls[0][0]).toContain("/products/search?q=phone");
  });

  it("paginates using page * limit as skip", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [], total: 0, skip: 24, limit: 12 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await fetchCargoCatalog({ page: 2, limit: 12 });

    expect(fetchMock.mock.calls[0][0]).toContain("skip=24");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    );

    await expect(fetchCargoCatalog()).rejects.toThrow(/500/);
  });
});

describe("subscribeToCreditExchangeRate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses Binance trade events into price updates", () => {
    const listeners: Record<string, (event: { data: string }) => void> = {};
    class FakeWebSocket {
      addEventListener(type: string, handler: (event: { data: string }) => void) {
        listeners[type] = handler;
      }
      close() {}
    }
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const onUpdate = vi.fn();
    const unsubscribe = subscribeToCreditExchangeRate(onUpdate);

    listeners.message({ data: JSON.stringify({ e: "trade", E: 1700000000000, p: "67890.12" }) });

    expect(onUpdate).toHaveBeenCalledWith({ priceUsd: 67890.12, timestamp: 1700000000000 });

    unsubscribe();
  });

  it("closes the socket when unsubscribed", () => {
    const closeMock = vi.fn();
    class FakeWebSocket {
      addEventListener() {}
      close = closeMock;
    }
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const unsubscribe = subscribeToCreditExchangeRate(() => {});
    unsubscribe();

    expect(closeMock).toHaveBeenCalledOnce();
  });

  it("reports connecting, then open, on a successful connection", () => {
    const listeners: Record<string, () => void> = {};
    class FakeWebSocket {
      addEventListener(type: string, handler: () => void) {
        listeners[type] = handler;
      }
      close() {}
    }
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const statuses: string[] = [];
    const unsubscribe = subscribeToCreditExchangeRate(() => {}, (status) => statuses.push(status));
    listeners.open();

    expect(statuses).toEqual(["connecting", "open"]);

    unsubscribe();
  });

  it("reconnects with a new socket after the connection closes, and reports status", () => {
    vi.useFakeTimers();

    const instances: { listeners: Record<string, () => void>; close: () => void }[] = [];
    class FakeWebSocket {
      listeners: Record<string, () => void> = {};
      constructor() {
        instances.push(this as unknown as { listeners: Record<string, () => void>; close: () => void });
      }
      addEventListener(type: string, handler: () => void) {
        this.listeners[type] = handler;
      }
      close() {
        this.listeners.close?.();
      }
    }
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const statuses: string[] = [];
    const unsubscribe = subscribeToCreditExchangeRate(() => {}, (status) => statuses.push(status));

    expect(instances).toHaveLength(1);

    instances[0].listeners.open();
    instances[0].close(); // simulate a server-initiated drop

    expect(statuses).toEqual(["connecting", "open", "reconnecting"]);

    vi.advanceTimersByTime(2000);
    expect(instances).toHaveLength(2);
    expect(statuses.at(-1)).toBe("reconnecting");

    unsubscribe();
    vi.useRealTimers();
  });

  it("does not reconnect after being unsubscribed", () => {
    vi.useFakeTimers();

    const instances: { listeners: Record<string, () => void>; close: () => void }[] = [];
    class FakeWebSocket {
      listeners: Record<string, () => void> = {};
      constructor() {
        instances.push(this as unknown as { listeners: Record<string, () => void>; close: () => void });
      }
      addEventListener(type: string, handler: () => void) {
        this.listeners[type] = handler;
      }
      close() {
        this.listeners.close?.();
      }
    }
    vi.stubGlobal("WebSocket", FakeWebSocket as unknown as typeof WebSocket);

    const unsubscribe = subscribeToCreditExchangeRate(() => {});
    unsubscribe();

    vi.advanceTimersByTime(5000);
    expect(instances).toHaveLength(1);

    vi.useRealTimers();
  });
});
