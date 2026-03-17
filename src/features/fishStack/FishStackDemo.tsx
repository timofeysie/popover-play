import { useState, useCallback } from "react";
import { Play, Plus, Minus } from "lucide-react";

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
  const flip = direction === "left" ? -1 : 1;

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

/** Single step state: after processing fish at index `upToIndex` (inclusive) */
export interface FishStep {
  upToIndex: number;
  stack: { size: number; fishIndex: number }[];
  upstreamSurvivors: number;
  upstreamSurvivorIndices: number[];
  eaten: number[];
}

/** 12 fish: mix of upstream/downstream so the stack builds and gets eaten. */
const DEMO_A = [2, 6, 3, 5, 1, 4, 9, 7, 8, 10, 11, 12];
const DEMO_B = [0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0];

function runFishAlgorithm(
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

export function FishStackDemo() {
  const [steps, setSteps] = useState<FishStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSurvivors, setTotalSurvivors] = useState<number | null>(null);

  const runDemo = useCallback(() => {
    setIsRunning(true);
    setTotalSurvivors(null);
    const recorded: FishStep[] = [];
    const result = runFishAlgorithm(DEMO_A, DEMO_B, (step) => recorded.push(step));
    setSteps(recorded);
    setTotalSurvivors(result);
    setCurrentStep(-1);

    let i = 0;
    const interval = setInterval(() => {
      if (i < recorded.length) {
        setCurrentStep(i);
        i++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 600);
  }, []);

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const eatenSet = step ? new Set(step.eaten) : new Set<number>();
  const stackEntries = step?.stack ?? [];
  const upstreamSurvivorIndices = step?.upstreamSurvivorIndices ?? [];

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">
          Stack simulation (12 fish)
        </span>
        <button
          type="button"
          onClick={runDemo}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          Run
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Fish flow at the same speed. 0 = upstream (←), 1 = downstream (→). When two meet, the larger eats the smaller.
      </p>

      {/* Stream: SVG fish by position (left = upstream, right = downstream) */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Stream — blue = upstream (←), orange = downstream (→). Size scales with number.
        </div>
        <div
          className="flex flex-nowrap items-end gap-3 overflow-x-auto rounded-lg border border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-4 px-3"
          role="img"
          aria-label="River stream with fish in order from upstream to downstream"
        >
          {DEMO_A.map((size, i) => {
            const isUpstream = DEMO_B[i] === 0;
            const isEaten = step ? eatenSet.has(i) : false;
            const isCurrent = step?.upToIndex === i;
            return (
              <div
                key={i}
                className={`inline-flex shrink-0 flex-col items-center gap-1 px-1 py-1 transition-colors ${isCurrent ? "ring-2 ring-primary/40 rounded-lg" : ""}`}
                data-fish-index={i}
                data-size={size}
                data-direction={isUpstream ? "upstream" : "downstream"}
                data-state={isEaten ? "eaten" : isCurrent ? "current" : "alive"}
              >
                <FishSvg
                  size={size}
                  direction={isUpstream ? "left" : "right"}
                  variant={isUpstream ? "upstream" : "downstream"}
                  showNumber
                  eaten={isEaten}
                  opacity={isEaten ? 0.65 : 1}
                />
                <span className={`text-[10px] text-muted-foreground ${isEaten ? "line-through" : ""}`}>
                  #{i}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stack and counts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Downstream stack</span>
            <span className="text-[10px] text-muted-foreground">(top ↑)</span>
          </div>
          <div
            className="flex flex-col-reverse min-h-[7rem] w-full rounded border-2 border-dashed border-border bg-muted/30 p-1.5 gap-1"
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
          {stackEntries.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1.5">
              + size(stack) → survivors
            </p>
          )}
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Upstream survivors</div>
          <div className="flex flex-wrap gap-1.5 min-h-[2.5rem] items-center">
            {upstreamSurvivorIndices.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">0</span>
            ) : (
              upstreamSurvivorIndices.map((fishIndex) => (
                <FishSvg
                  key={fishIndex}
                  size={DEMO_A[fishIndex]}
                  direction="left"
                  variant="upstream"
                  showNumber
                />
              ))
            )}
          </div>
        </div>
      </div>

      {totalSurvivors !== null && (
        <p className="text-sm font-medium text-foreground">
          Total survivors: <span className="font-mono text-primary">{totalSurvivors}</span>
        </p>
      )}

      <details className="group/explain rounded-lg border border-border bg-muted/20 overflow-hidden mt-4">
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
      </details>
    </div>
  );
}
