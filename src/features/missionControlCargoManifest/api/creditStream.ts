// Repurposes Binance's public trade stream as a live "galactic credit" exchange
// rate — no auth required, and it's a real WebSocket feed for the review step.
const BINANCE_STREAM_URL = "wss://stream.binance.com:9443/ws/btcusdt@trade";
const RECONNECT_DELAY_MS = 2000;

export interface CreditPriceUpdate {
  priceUsd: number;
  timestamp: number;
}

export type ConnectionStatus = "connecting" | "open" | "reconnecting";

interface BinanceTradeEvent {
  e: string;
  E: number;
  p: string;
}

export type Unsubscribe = () => void;

// Auto-reconnects on drop (fixed delay, no backoff — this is a demo feed, not
// a production client) so the review step can show a live "reconnecting"
// affordance instead of silently going stale.
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

    socket.addEventListener("message", (event: MessageEvent<string>) => {
      const trade = JSON.parse(event.data) as BinanceTradeEvent;
      onUpdate({ priceUsd: Number(trade.p), timestamp: trade.E });
    });

    // Errors precede a close event on WebSocket; force it so the close
    // handler below is the single place that schedules a reconnect.
    socket.addEventListener("error", () => socket?.close());

    socket.addEventListener("close", () => {
      if (stopped) return;
      onStatusChange?.("reconnecting");
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    });
  }

  connect();

  return () => {
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    socket?.close();
  };
}
