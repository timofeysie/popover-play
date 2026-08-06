// Repurposes Binance's public trade stream as a live "galactic credit" exchange
// rate — no auth required, and it's a real WebSocket feed for the review step.
const BINANCE_STREAM_URL = "wss://stream.binance.com:9443/ws/btcusdt@trade";

export interface CreditPriceUpdate {
  priceUsd: number;
  timestamp: number;
}

interface BinanceTradeEvent {
  e: string;
  E: number;
  p: string;
}

export type Unsubscribe = () => void;

export function subscribeToCreditExchangeRate(
  onUpdate: (update: CreditPriceUpdate) => void,
  onError?: (event: Event) => void,
): Unsubscribe {
  const socket = new WebSocket(BINANCE_STREAM_URL);

  socket.addEventListener("message", (event: MessageEvent<string>) => {
    const trade = JSON.parse(event.data) as BinanceTradeEvent;
    onUpdate({ priceUsd: Number(trade.p), timestamp: trade.E });
  });

  if (onError) {
    socket.addEventListener("error", onError);
  }

  return () => socket.close();
}
