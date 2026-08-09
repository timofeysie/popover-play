import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Rocket, Loader2, CheckCircle2 } from "lucide-react";
import { useMccmStore, selectSubtotalUsd } from "../store/mccmStore";
import {
  subscribeToCreditExchangeRate,
  type CreditPriceUpdate,
  type ConnectionStatus,
} from "../api/creditStream";
import type { ManifestLine, Destination } from "../types";

const TAP_TRANSITION = { type: "spring", stiffness: 500, damping: 30 } as const;
const LAUNCH_DELAY_MS = 700;
const MotionLink = motion.create(Link);

export function ReviewStep() {
  const hasCargo = useMccmStore((state) => state.lines.length > 0);
  const lines = useMccmStore((state) => state.lines);
  const destination = useMccmStore((state) => state.destination);
  const clearanceCode = useMccmStore((state) => state.clearanceCode);
  const subtotalUsd = useMccmStore(selectSubtotalUsd);
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);

  if (!hasCargo && !launched) {
    return <Navigate to="/mccm/cargo" replace />;
  }

  if (launched) {
    // The store is reset lazily, from LaunchConfirmation's "start a new
    // manifest" link — not here. Clearing `lines` in this same transition
    // would flip `hasCargo` to false while `launched` was still settling,
    // and the guard above would redirect away before this ever rendered.
    return <LaunchConfirmation />;
  }

  const handleLaunch = () => {
    setLaunching(true);
    setTimeout(() => setLaunched(true), LAUNCH_DELAY_MS);
  };

  return (
    <div className="space-y-6">
      <MotionLink
        to="/mccm/destination"
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.97 }}
        transition={TAP_TRANSITION}
        className="inline-block text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to Destination
      </MotionLink>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <ManifestSummary lines={lines} subtotalUsd={subtotalUsd} />
          <DestinationSummary destination={destination} clearanceCode={clearanceCode} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <CreditTicker subtotalUsd={subtotalUsd} />
          <motion.button
            onClick={handleLaunch}
            disabled={launching}
            whileHover={launching ? undefined : { scale: 1.03 }}
            whileTap={launching ? undefined : { scale: 0.95 }}
            transition={TAP_TRANSITION}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-70"
          >
            {launching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Launching…
              </>
            ) : (
              <>
                <motion.span
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Rocket className="w-4 h-4" />
                </motion.span>
                Launch Mission
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function ManifestSummary({ lines, subtotalUsd }: { lines: ManifestLine[]; subtotalUsd: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Cargo Manifest</h3>
      <ul className="space-y-2">
        {lines.map((line) => (
          <li key={line.item.id} className="flex items-center gap-3 text-sm">
            <img
              src={line.item.thumbnailUrl}
              alt=""
              className="w-10 h-10 rounded object-cover bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground">{line.item.title}</p>
              <p className="text-xs text-muted-foreground">Qty {line.quantity}</p>
            </div>
            <span className="font-mono text-foreground">
              ${(line.item.unitPriceUsd * line.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-mono font-medium text-foreground">${subtotalUsd.toFixed(2)}</span>
      </div>
    </div>
  );
}

function DestinationSummary({
  destination,
  clearanceCode,
}: {
  destination: Destination | null;
  clearanceCode: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6 space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Destination</h3>
      {destination ? (
        <>
          <p className="text-sm text-foreground">
            {destination.station} · {destination.sector}
          </p>
          {clearanceCode && (
            <p className="text-xs font-mono text-muted-foreground">Clearance: {clearanceCode}</p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No destination set —{" "}
          <MotionLink
            to="/mccm/destination"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={TAP_TRANSITION}
            className="inline-block text-primary hover:underline"
          >
            choose one
          </MotionLink>
          .
        </p>
      )}
    </div>
  );
}

const STATUS_COPY: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  open: "Live",
  reconnecting: "Reconnecting…",
};

// Isolated in its own component so per-tick WebSocket updates only re-render
// this subtree, not the manifest/destination summaries above it.
function CreditTicker({ subtotalUsd }: { subtotalUsd: number }) {
  const [price, setPrice] = useState<CreditPriceUpdate | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const unsubscribe = subscribeToCreditExchangeRate(setPrice, setStatus);
    return unsubscribe;
  }, []);

  const isLive = status === "open";
  const creditsTotal = price ? subtotalUsd / price.priceUsd : null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Galactic Credits</h3>
        <span
          className={`flex items-center gap-1.5 text-xs font-medium ${
            isLive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {isLive ? (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          ) : (
            <Loader2 className="w-3 h-3 animate-spin" />
          )}
          {STATUS_COPY[status]}
        </span>
      </div>

      <div className={`transition-opacity ${isLive ? "" : "opacity-50"}`}>
        {creditsTotal !== null ? (
          <motion.p
            key={creditsTotal.toFixed(6)}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-mono font-semibold text-foreground"
          >
            {creditsTotal.toFixed(6)} <span className="text-sm text-muted-foreground">CR</span>
          </motion.p>
        ) : (
          <p className="text-sm text-muted-foreground py-1">Awaiting exchange rate…</p>
        )}
      </div>

      {price && (
        <p className="text-xs text-muted-foreground">
          1 CR ≈ ${price.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })} · last
          tick {new Date(price.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

function LaunchConfirmation() {
  const reset = useMccmStore((state) => state.reset);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-8 text-center space-y-3"
    >
      <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
      <h3 className="text-lg font-semibold text-foreground">Manifest launched</h3>
      <p className="text-sm text-muted-foreground">
        The resupply run is underway. Ready to requisition another shipment?
      </p>
      <MotionLink
        to="/mccm/cargo"
        onClick={() => reset()}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        transition={TAP_TRANSITION}
        className="inline-block text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
      >
        Start a new manifest
      </MotionLink>
    </motion.div>
  );
}
