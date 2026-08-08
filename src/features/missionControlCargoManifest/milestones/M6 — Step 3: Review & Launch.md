# M6 — Step 3: Review & Launch

**Goal:** manifest + destination summary, a live "galactic credits" total driven
by the M1 Binance WebSocket client, a visible reconnect story (not just the
happy path), and a simulated submit that resets the store.

**Files:** `steps/ReviewStep.tsx`, `api/creditStream.ts`

## The M1 client didn't have a reconnect story yet

M1 shipped `subscribeToCreditExchangeRate(onUpdate, onError?)` — it opened a
socket and forwarded parsed trades, but a dropped connection just went silent.
M6's acceptance criteria explicitly wants disconnect/reconnect to be visible,
so the client grew a small state machine instead of pushing that logic into
the component:

```ts
export type ConnectionStatus = "connecting" | "open" | "reconnecting";

export function subscribeToCreditExchangeRate(
  onUpdate: (update: CreditPriceUpdate) => void,
  onStatusChange?: (status: ConnectionStatus) => void,
): Unsubscribe {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let hasConnectedOnce = false;
  let stopped = false;

  function connect() {
    onStatusChange?.(hasConnectedOnce ? "reconnecting" : "connecting");
    socket = new WebSocket(BINANCE_STREAM_URL);
    socket.addEventListener("open", () => {
      hasConnectedOnce = true;
      onStatusChange?.("open");
    });
    socket.addEventListener("error", () => socket?.close());
    socket.addEventListener("close", () => {
      if (stopped) return;
      onStatusChange?.("reconnecting");
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    });
    // ...message handler unchanged from M1
  }

  connect();
  return () => {
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    socket?.close();
  };
}
```

`error` forces a `close()` rather than handling errors separately, so `close`
stays the single place that decides whether to reconnect. The old `onError`
param is gone — nothing outside this module consumed it yet, and a unified
status callback is more useful to a consumer that just wants to render "Live"
vs "Reconnecting…". Reconnect is a fixed 2s delay, not exponential backoff —
this is a demo feed, not a production client, and the milestone only asked for
the affordance to be visible, not tuned.

`missionControlCargoManifestApi.test.ts` covers the state machine with a fake
`WebSocket` that can simulate `open`/`close` and verifies: connecting → open
on success, reconnecting → a *new* socket instance after a close, and — the
one easy to get wrong — no reconnect timer fires after `unsubscribe()`.

## The ticker is isolated so it doesn't re-render the summary above it

Per the project doc's rendering-strategy note, `CreditTicker` owns its own
`price`/`status` state and subscribes in its own `useEffect`. `ReviewStep`
only passes it `subtotalUsd` (from the store) as a prop, so every WS tick
re-renders the ticker card, not the manifest/destination summaries next to it:

```tsx
function CreditTicker({ subtotalUsd }: { subtotalUsd: number }) {
  const [price, setPrice] = useState<CreditPriceUpdate | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const unsubscribe = subscribeToCreditExchangeRate(setPrice, setStatus);
    return unsubscribe;
  }, []);

  const creditsTotal = price ? subtotalUsd / price.priceUsd : null;
  // ...
}
```

"Galactic credits" = manifest subtotal (USD) divided by the live BTC/USDT
price — so the credits figure actually moves as the feed ticks, not just the
underlying price label. When `status !== "open"`, the last-known total stays
on screen at reduced opacity with a "Reconnecting…" badge instead of
disappearing — the stale/disconnected affordance the milestone asked for.

## Launching is simulated, but the guard/reset order matters

`ReviewStep`'s empty-manifest guard (from M3) redirects to `/mccm/cargo` when
`lines.length === 0`. Launching calls `reset()`, which empties `lines` — so
the guard has to be told the launch already happened, or it would immediately
redirect away from the confirmation screen it's supposed to show:

```tsx
const [launched, setLaunched] = useState(false);

if (!hasCargo && !launched) {
  return <Navigate to="/mccm/cargo" replace />;
}
if (launched) {
  return <LaunchConfirmation />;
}

const handleLaunch = () => {
  reset();
  setLaunched(true);
};
```

## Testing this step

Same split as M4/M5: the WS reconnect logic is pure and unit tested (see
above). The rendered step is covered by two new Playwright cases — one
asserting the manifest/destination/ticker summaries and Launch button render,
one driving an actual launch through to the confirmation screen and back to
an empty `/mccm/cargo`. The live price itself isn't asserted in e2e (real
network dependency, would be flaky); it was checked manually instead — the
ticker reached `Live` with a real BTC/USDT price within ~1s against the actual
Binance stream, and the credits figure updated on each tick.
