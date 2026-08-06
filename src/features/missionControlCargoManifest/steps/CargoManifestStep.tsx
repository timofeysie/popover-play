import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion, AnimatePresence, arc } from "motion/react";
import { Loader2, Plus, AlertTriangle, PackageCheck } from "lucide-react";
import { fetchCargoCatalog } from "../api/cargoClient";
import { useMccmStore, selectSubtotalUsd } from "../store/mccmStore";
import type { CargoItem, ManifestLine } from "../types";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 350;

interface Flight {
  id: string;
  src: string;
  from: DOMRect;
  to: DOMRect;
}

export function CargoManifestStep() {
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const manifestBadgeRef = useRef<HTMLDivElement>(null);

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

  const lines = useMccmStore((state) => state.lines);
  const addCargoItem = useMccmStore((state) => state.addCargoItem);
  const removeCargoItem = useMccmStore((state) => state.removeCargoItem);
  const subtotalUsd = useMccmStore(selectSubtotalUsd);

  const manifestQuantity = (itemId: number) =>
    lines.find((line) => line.item.id === itemId)?.quantity ?? 0;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const handleAddToManifest = (item: CargoItem, imgEl: HTMLImageElement | null) => {
    addCargoItem(item);

    const from = imgEl?.getBoundingClientRect();
    const to = manifestBadgeRef.current?.getBoundingClientRect();
    if (!from || !to) return;

    setFlights((current) => [
      ...current,
      { id: `${item.id}-${Date.now()}`, src: item.thumbnailUrl, from, to },
    ]);
  };

  const handleFlightComplete = (id: string) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search the cargo catalog…"
          aria-label="Search the cargo catalog"
          className="w-full sm:max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Couldn't load the cargo catalog{error instanceof Error ? `: ${error.message}` : ""}.
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium text-primary hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {isPending ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-16">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading cargo catalog…
            </div>
          ) : data && data.items.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-16">
              No cargo matches "{query}".
            </div>
          ) : (
            data && (
              <div
                className={`grid sm:grid-cols-2 gap-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}
              >
                {data.items.map((item) => (
                  <CargoItemCard
                    key={item.id}
                    item={item}
                    quantity={manifestQuantity(item.id)}
                    onAdd={(imgEl) => handleAddToManifest(item, imgEl)}
                    onRemove={() => removeCargoItem(item.id)}
                  />
                ))}
              </div>
            )
          )}

          {data && data.total > data.limit && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                ← Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page + 1 >= totalPages}
                className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        <ManifestLinesPanel
          lines={lines}
          subtotalUsd={subtotalUsd}
          badgeRef={manifestBadgeRef}
          onIncrement={(item) => addCargoItem(item)}
          onRemove={removeCargoItem}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Link to="/mccm/destination" className="text-sm font-medium text-primary hover:underline">
          Continue to Destination →
        </Link>
      </div>

      <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
        <AnimatePresence>
          {flights.map((flight) => (
            <FlyingCargoImage
              key={flight.id}
              flight={flight}
              onComplete={() => handleFlightComplete(flight.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CargoItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
}: {
  item: CargoItem;
  quantity: number;
  onAdd: (imgEl: HTMLImageElement | null) => void;
  onRemove: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex gap-3">
      <img
        ref={imgRef}
        src={item.thumbnailUrl}
        alt=""
        loading="lazy"
        className="w-16 h-16 rounded-md object-cover bg-muted shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground truncate">{item.title}</h4>
          {item.clearanceLevel === "hazmat" && (
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
              Hazmat
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-mono text-foreground">
            ${item.unitPriceUsd.toFixed(2)}
          </span>
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(imgRef.current)}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">Qty {quantity}</span>
              <button
                onClick={() => onAdd(imgRef.current)}
                aria-label={`Add another ${item.title}`}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRemove}
                aria-label={`Remove ${item.title} from manifest`}
                className="text-xs font-medium text-destructive hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManifestLinesPanel({
  lines,
  subtotalUsd,
  badgeRef,
  onIncrement,
  onRemove,
}: {
  lines: ManifestLine[];
  subtotalUsd: number;
  badgeRef: RefObject<HTMLDivElement>;
  onIncrement: (item: CargoItem) => void;
  onRemove: (itemId: number) => void;
}) {
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 lg:sticky lg:top-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div
            ref={badgeRef}
            className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center overflow-hidden"
          >
            <motion.div
              key={totalQuantity}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 12 }}
              className="flex items-center justify-center"
            >
              <PackageCheck className="w-4 h-4" />
            </motion.div>
          </div>
          Manifest
        </h3>
        <motion.span
          key={totalQuantity}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="text-xs font-medium text-muted-foreground"
        >
          {lines.length} line{lines.length === 1 ? "" : "s"}
        </motion.span>
      </div>

      {lines.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          No cargo added yet — add items from the catalog.
        </p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <motion.li
                key={line.item.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-center gap-2 text-sm"
              >
                <img
                  src={line.item.thumbnailUrl}
                  alt=""
                  className="w-8 h-8 rounded object-cover bg-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-foreground">{line.item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty {line.quantity} · ${(line.item.unitPriceUsd * line.quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => onIncrement(line.item)}
                  aria-label={`Add another ${line.item.title}`}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onRemove(line.item.id)}
                  aria-label={`Remove ${line.item.title} from manifest`}
                  className="text-xs font-medium text-destructive hover:underline shrink-0"
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-mono font-medium text-foreground">${subtotalUsd.toFixed(2)}</span>
      </div>
    </div>
  );
}

function FlyingCargoImage({ flight, onComplete }: { flight: Flight; onComplete: () => void }) {
  const path = useMemo(() => arc({ strength: 0.4, peak: 0.5, rotate: true }), []);

  const dx = flight.to.left + flight.to.width / 2 - (flight.from.left + flight.from.width / 2);
  const dy = flight.to.top + flight.to.height / 2 - (flight.from.top + flight.from.height / 2);

  return (
    <motion.img
      src={flight.src}
      alt=""
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: dx, y: dy, scale: 0.25, opacity: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeIn",
        path,
        opacity: { duration: 0.55, delay: 0.2 },
      }}
      onAnimationComplete={onComplete}
      className="fixed rounded-md object-cover"
      style={{
        top: flight.from.top,
        left: flight.from.left,
        width: flight.from.width,
        height: flight.from.height,
      }}
    />
  );
}
