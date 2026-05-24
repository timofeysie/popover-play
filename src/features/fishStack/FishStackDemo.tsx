import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";

/** SVG fish: body + tail, scales by size, faces left (upstream) or right (downstream). */
function FishSvg({
  size,
  direction,
  variant,
  showNumber = false,
  eaten = false,
  className = "",
  opacity = 1,
}: {
  size: number;
  direction: "left" | "right";
  variant: "upstream" | "downstream";
  showNumber?: boolean;
  eaten?: boolean;
  className?: string;
  opacity?: number;
}) {
  const scale = 0.35 + size * 0.12;
  const w = 24 * scale;
  const h = 14 * scale;
  const fill = variant === "upstream" ? "hsl(210 70% 48%)" : "hsl(25 90% 52%)";
  const flip = direction === "right" ? -1 : 1;

  return (
    <span className={`inline-flex flex-col items-center gap-0.5 ${className}`} style={{ opacity }}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 24 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        style={{ transform: `scaleX(${flip})` }}
        aria-hidden
      >
        <ellipse cx={10} cy={6} rx={8} ry={5} fill={fill} />
        <path
          d="M18 6 L24 2 L24 10 Z"
          fill={fill}
        />
        {eaten ? (
          <g stroke="hsl(0 0% 20%)" strokeWidth={0.8} strokeLinecap="round">
            <line x1={6.2} y1={3.8} x2={9.8} y2={6.2} />
            <line x1={6.2} y1={6.2} x2={9.8} y2={3.8} />
          </g>
        ) : (
          <ellipse cx={8} cy={5} r={1.2} fill="hsl(0 0% 100% / 0.6)" />
        )}
      </svg>
      {showNumber && (
        <span className="text-[10px] font-mono font-semibold tabular-nums text-foreground leading-none">
          {size}
        </span>
      )}
    </span>
  );
}

/** Simple forest silhouette for the downstream (left, lower) end. */
function DownstreamTreesSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 32 L18 12 L28 32 Z"
        fill="hsl(145 45% 32%)"
      />
      <rect x="15" y="30" width="6" height="10" rx="1" fill="hsl(28 40% 28%)" />
      <path
        d="M28 34 L40 8 L52 34 Z"
        fill="hsl(145 42% 36%)"
      />
      <rect x="38" y="32" width="7" height="10" rx="1" fill="hsl(28 38% 26%)" />
      <path
        d="M48 36 L62 14 L76 36 Z"
        fill="hsl(152 38% 30%)"
      />
      <rect x="58" y="34" width="7" height="10" rx="1" fill="hsl(28 40% 28%)" />
      <path
        d="M72 38 L88 10 L104 38 Z"
        fill="hsl(145 45% 34%)"
      />
      <rect x="84" y="36" width="8" height="10" rx="1" fill="hsl(28 38% 26%)" />
    </svg>
  );
}

/** Simple mountain range for the upstream (right, higher) end. */
function UpstreamMountainsSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M0 52 L28 18 L52 52 Z"
        fill="hsl(215 22% 42%)"
      />
      <path
        d="M36 52 L68 8 L100 52 Z"
        fill="hsl(215 18% 48%)"
      />
      <path
        d="M88 52 L118 22 L140 52 Z"
        fill="hsl(210 20% 38%)"
      />
      <path
        d="M20 52 L48 28 L72 52 Z"
        fill="hsl(215 25% 52% / 0.35)"
      />
    </svg>
  );
}

/** Single step state: after processing fish at index `upToIndex` (inclusive) */
export interface FishStep {
  upToIndex: number;
  stack: { size: number; fishIndex: number }[];
  upstreamSurvivors: number;
  upstreamSurvivorIndices: number[];
  eaten: number[];
}

/** 12 fish: mix of upstream/downstream so the stack builds and gets eaten. */
export const DEMO_SIZES = [2, 6, 3, 5, 1, 4, 9, 7, 8, 10, 11, 12];
export const DEMO_DIRECTIONS = [0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0];

/** Runs the fish stack algorithm; returns total survivors. Callback is invoked after each step. */
export function runFishAlgorithm(
  A: number[],
  B: number[],
  onStep: (step: FishStep) => void
): number {
  const downstreamStack: { size: number; fishIndex: number }[] = [];
  let upstreamSurvivors = 0;
  const upstreamSurvivorIndices: number[] = [];
  const eaten: number[] = [];

  for (let i = 0; i < A.length; i++) {
    if (B[i] === 1) {
      downstreamStack.push({ size: A[i], fishIndex: i });
    } else {
      while (
        downstreamStack.length > 0 &&
        downstreamStack[downstreamStack.length - 1].size < A[i]
      ) {
        const eatenFish = downstreamStack.pop()!;
        eaten.push(eatenFish.fishIndex);
      }
      if (downstreamStack.length === 0) {
        upstreamSurvivors++;
        upstreamSurvivorIndices.push(i);
      } else {
        eaten.push(i);
      }
    }
    onStep({
      upToIndex: i,
      stack: [...downstreamStack],
      upstreamSurvivors,
      upstreamSurvivorIndices: [...upstreamSurvivorIndices],
      eaten: [...eaten],
    });
  }

  return upstreamSurvivors + downstreamStack.length;
}

const FISH_ANIMATION_MS = 600;

// Pre-compute fixed container heights so neither panel expands during animation.
// Mirrors FishSvg's scale formula and the entry div's py-1.5 padding.
const _fishEntryPx = (size: number) => {
  const scale = 0.35 + size * 0.12;
  return Math.ceil(14 * scale) + 2 + 10 + 12; // svgH + gap-0.5 + text-[10px] + py-1.5×2
};
const _precomputedSteps: FishStep[] = [];
runFishAlgorithm(DEMO_SIZES, DEMO_DIRECTIONS, (s) => _precomputedSteps.push(s));

const STACK_CONTAINER_PX =
  Math.max(
    ..._precomputedSteps.map(({ stack }) =>
      stack.length === 0
        ? 0
        : stack.reduce((h, e) => h + _fishEntryPx(e.size), 0)
          + (stack.length - 1) * 4  // gap-1 between entries
          + 12                       // p-1.5 container padding
    )
  ) + 20; // buffer

const _finalSurvivorSizes = (_precomputedSteps.at(-1)?.upstreamSurvivorIndices ?? []).map(
  (i) => DEMO_SIZES[i]
);
const SURVIVORS_CONTAINER_PX =
  Math.max(0, ..._finalSurvivorSizes.map((size) => {
    const scale = 0.35 + size * 0.12;
    return Math.ceil(14 * scale) + 2 + 10; // svgH + gap + text
  })) + 10; // buffer

export function FishStackDemo({ autoPlay = false, loop = false, hideControls = false }: { autoPlay?: boolean; loop?: boolean; hideControls?: boolean } = {}) {
  const [steps, setSteps] = useState<FishStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSurvivors, setTotalSurvivors] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDemo = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(true);
    setTotalSurvivors(null);
    const recorded: FishStep[] = [];
    const result = runFishAlgorithm(DEMO_SIZES, DEMO_DIRECTIONS, (step) => recorded.push(step));
    setSteps(recorded);
    setTotalSurvivors(result);
    setCurrentStep(-1);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      if (i < recorded.length) {
        setCurrentStep(i);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
      }
    }, FISH_ANIMATION_MS);
  }, []);

  const pauseDemo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const stepBack = useCallback(() => {
    if (isRunning) pauseDemo();
    setCurrentStep((prev) => Math.max(-1, prev - 1));
  }, [isRunning, pauseDemo]);

  const stepForward = useCallback(() => {
    if (isRunning) pauseDemo();
    setCurrentStep((prev) =>
      steps.length > 0 ? Math.min(steps.length - 1, prev + 1) : prev
    );
  }, [isRunning, pauseDemo, steps.length]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loopRef = useRef<{ loop: boolean; run: () => void }>({ loop: false, run: () => {} });
  useEffect(() => { loopRef.current = { loop, run: runDemo }; });
  const wasRunningRef = useRef(false);
  useEffect(() => {
    if (wasRunningRef.current && !isRunning && loopRef.current.loop) {
      const t = setTimeout(() => loopRef.current.run(), 1500);
      return () => clearTimeout(t);
    }
    wasRunningRef.current = isRunning;
  }, [isRunning]);
  useEffect(() => {
    if (autoPlay) runDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const eatenSet = step ? new Set(step.eaten) : new Set<number>();
  const stackEntries = step?.stack ?? [];
  const upstreamSurvivorIndices = step?.upstreamSurvivorIndices ?? [];

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1 min-w-0">
      {!hideControls && (
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm font-medium text-foreground">
          Stack simulation (12 fish)
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={runDemo}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            title="Run from start"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          <button
            type="button"
            onClick={pauseDemo}
            disabled={!isRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            title="Pause"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
          <button
            type="button"
            onClick={stepBack}
            disabled={currentStep <= -1}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={stepForward}
            disabled={steps.length === 0 || currentStep >= steps.length - 1}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      {!hideControls && (<>
      <p className="text-sm text-muted-foreground mb-2">
        Fish flow at the same speed. 0 = upstream (←), 1 = downstream (→). When two meet, the larger eats the smaller. Fish moving in the same direction never meet.
      </p>
      <p className="text-xs text-muted-foreground mb-2">
        Opposite directions alone is not enough: two fish must be moving <strong className="text-foreground">toward</strong> each other (on a collision course). Fish #0 is to the left and swims left (←); fish #1 is to the right and swims right (→). So they move <strong className="text-foreground">apart</strong> and never meet. The only pairs that meet are when a downstream fish (→) is to the <strong className="text-foreground">left</strong> of an upstream fish (←) — then they approach and the larger wins.
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        In the lanes below: #0 (top, col 0) and #1 (bottom, col 1) are in different columns and lanes, moving apart. #1 (bottom, col 1) and #2 (top, col 2) are adjacent and point toward each other, so they meet.
      </p>
      </>)}

      {/* Two-lane stream: row 0 = upstream (←), row 1 = downstream (→); columns = index.
          River is skewed so the right (upstream, mountains) reads higher than the left (trees). */}
      <div className="mb-4">
        {!hideControls && (
        <div className="text-xs font-medium text-muted-foreground mb-2">
          The top lane (blue fish) moves left going downstream.  The bottom lane (orange fish) moves right going upstream.
        </div>
        )}
        <div className="relative pt-10 pb-8 px-1 overflow-x-auto overflow-y-visible">
          <div
            className="pointer-events-none absolute left-2 top-0 z-10 w-[min(11rem,42%)] max-w-[140px]"
            aria-hidden
          >
            <DownstreamTreesSvg className="w-full h-auto opacity-90" />
          </div>
          <div
            className="pointer-events-none absolute right-0 bottom-0 z-10 w-[min(12rem,45%)] max-w-[150px]"
            aria-hidden
          >
            <UpstreamMountainsSvg className="w-full h-auto opacity-95" />
          </div>
          <div
            className="rounded-lg border border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 shadow-sm origin-bottom [transform:skewY(-5deg)]"
            role="img"
            aria-label="Two-lane river stream tilted with upstream toward the right and mountains; trees on the left downstream; upstream lane top, downstream lane bottom; columns are positions"
          >
            <div className="overflow-x-auto py-3 px-3 origin-bottom [transform:skewY(5deg)]">
              <div
                className="grid gap-y-2 min-w-0"
                style={{
                  gridTemplateColumns: `repeat(${DEMO_SIZES.length}, minmax(2.75rem, 1fr))`,
                  gridTemplateRows: "auto auto",
                }}
              >
                {/* Row 0: Upstream lane (←) */}
                {DEMO_SIZES.map((size, i) => (
                  <div
                    key={`up-${i}`}
                    className="flex min-h-[3rem] flex-col items-center justify-end gap-0.5"
                  >
                    {DEMO_DIRECTIONS[i] === 0 ? (
                      <>
                        <div
                          className={`flex flex-col items-center gap-0.5 px-1 py-1 transition-colors ${step?.upToIndex === i ? "ring-2 ring-primary/40 rounded-lg" : ""}`}
                          data-fish-index={i}
                          data-direction="upstream"
                          data-state={step ? (eatenSet.has(i) ? "eaten" : step.upToIndex === i ? "current" : "alive") : "alive"}
                        >
                          <FishSvg
                            size={size}
                            direction="left"
                            variant="upstream"
                            showNumber
                            eaten={step ? eatenSet.has(i) : false}
                            opacity={step && eatenSet.has(i) ? 0.65 : 1}
                          />
                        </div>
                        <span className={`text-[10px] text-muted-foreground ${step && eatenSet.has(i) ? "line-through" : ""}`}>
                          #{i}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">—</span>
                    )}
                  </div>
                ))}
                {/* Row 1: Downstream lane (→) */}
                {DEMO_SIZES.map((size, i) => (
                  <div
                    key={`down-${i}`}
                    className="flex min-h-[3rem] flex-col items-center justify-start gap-0.5"
                  >
                    {DEMO_DIRECTIONS[i] === 1 ? (
                      <>
                        <div
                          className={`flex flex-col items-center gap-0.5 px-1 py-1 transition-colors ${step?.upToIndex === i ? "ring-2 ring-primary/40 rounded-lg" : ""}`}
                          data-fish-index={i}
                          data-direction="downstream"
                          data-state={step ? (eatenSet.has(i) ? "eaten" : step.upToIndex === i ? "current" : "alive") : "alive"}
                        >
                          <FishSvg
                            size={size}
                            direction="right"
                            variant="downstream"
                            showNumber
                            eaten={step ? eatenSet.has(i) : false}
                            opacity={step && eatenSet.has(i) ? 0.65 : 1}
                          />
                        </div>
                        <span className={`text-[10px] text-muted-foreground ${step && eatenSet.has(i) ? "line-through" : ""}`}>
                          #{i}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">—</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between gap-2 text-[10px] text-muted-foreground">
                <span>Downstream</span>
                <span>Upstream</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upstream survivors first (left), then downstream stack (right) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Upstream survivors</div>
          <div className="flex flex-wrap gap-1.5 items-center" style={{ height: SURVIVORS_CONTAINER_PX }}>
            {upstreamSurvivorIndices.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">0</span>
            ) : (
              upstreamSurvivorIndices.map((fishIndex) => (
                <FishSvg
                  key={fishIndex}
                  size={DEMO_SIZES[fishIndex]}
                  direction="left"
                  variant="upstream"
                  showNumber
                />
              ))
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Downstream stack</span>
            <span className="text-[10px] text-muted-foreground">(top ↑)</span>
          </div>
          <div
            className="flex flex-col-reverse w-full rounded border-2 border-dashed border-border bg-muted/30 p-1.5 gap-1"
            style={{ height: STACK_CONTAINER_PX }}
            aria-label="Stack of downstream fish; top of stack at top"
          >
            {stackEntries.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-4">
                <span className="text-xs text-muted-foreground italic">empty</span>
              </div>
            ) : (
              stackEntries.map((entry, idx) => (
                <div
                  key={`${entry.fishIndex}-${idx}`}
                  className="flex items-center justify-center rounded border border-primary/30 bg-primary/5 py-1.5 px-2"
                >
                  <FishSvg
                    size={entry.size}
                    direction="right"
                    variant="downstream"
                    showNumber
                  />
                </div>
              ))
            )}
          </div>
          {!hideControls && stackEntries.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
              + size(stack) → survivors
            </p>
          )}
        </div>
      </div>

      <p className="text-sm font-medium text-foreground">
        Total survivors:{" "}
        <span className="font-mono text-primary">
          {step != null
            ? step.upstreamSurvivors + step.stack.length
            : totalSurvivors !== null
              ? totalSurvivors
              : "—"}
        </span>
        {step != null && steps.length > 0 && step.upToIndex < steps.length - 1 && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(so far)</span>
        )}
      </p>

      {!hideControls && (<details className="group/explain rounded-lg border border-border bg-muted/20 overflow-hidden mt-4">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-3 py-2.5 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <Plus className="w-4 h-4 shrink-0 text-primary group-open/explain:hidden" aria-hidden />
          <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/explain:inline" aria-hidden />
          <span className="font-medium text-foreground text-sm">How the stack works</span>
        </summary>
        <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground border-t border-border">
          <div className="pt-3 space-y-3">
            <p>
              We process fish <strong className="text-foreground">left to right</strong> (upstream to downstream). Downstream fish (→) are pushed onto the stack. Upstream fish (←) fight the stack top: they eat every smaller downstream fish (pop until empty or bigger); if the stack becomes empty, the upstream fish survives; otherwise the top eats it.
            </p>
            <p>
              In this 12-fish example, the stack builds when several downstream fish (orange, →) appear in a row, then upstream fish (blue, ←) fight the stack. Eaten fish show X eyes. Result: <strong className="text-foreground">upstream survivors + size(stack)</strong>.
            </p>
          </div>
        </div>
      </details>)}
    </div>
  );
}
