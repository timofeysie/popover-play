import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { computeSteps, DEMO_INPUT } from "./SlidingWindowMaxDemo";

interface BruteForceStep {
  index: number;
  windowStart: number;
  windowEnd: number;
  isWarmup: boolean;
  currentMax: number | null;
  totalComparisons: number;
  resultSoFar: number[];
}

function computeBruteForceSteps(nums: number[], k: number): BruteForceStep[] {
  const steps: BruteForceStep[] = [];
  let totalComparisons = 0;
  const result: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    const isWarmup = i < k - 1;
    let currentMax: number | null = null;

    if (!isWarmup) {
      const wStart = i - k + 1;
      currentMax = nums[wStart];
      for (let j = wStart + 1; j <= i; j++) {
        if (nums[j] > currentMax) currentMax = nums[j];
      }
      totalComparisons += k;
      result.push(currentMax);
    }

    steps.push({
      index: i,
      windowStart: Math.max(0, i - k + 1),
      windowEnd: i,
      isWarmup,
      currentMax,
      totalComparisons,
      resultSoFar: [...result],
    });
  }

  return steps;
}

const ANIMATION_MS = 1000;

function DequeCell({
  val,
  idx,
  variant,
  sublabel,
}: {
  val: number;
  idx: number;
  variant: "front" | "surviving" | "expired" | "dominated" | "pushed";
  sublabel: string;
}) {
  const cellCls = {
    front:     "bg-primary text-primary-foreground border-primary",
    surviving: "bg-primary/10 text-foreground border-primary/40",
    expired:   "bg-amber-500/10 text-amber-700 border-amber-500 opacity-60",
    dominated: "bg-orange-500/10 text-orange-700 border-orange-500 opacity-60",
    pushed:    "bg-accent/30 text-foreground border-accent",
  }[variant];

  const idxCls = {
    front:     "text-primary-foreground/70",
    surviving: "text-muted-foreground",
    expired:   "text-amber-600",
    dominated: "text-orange-600",
    pushed:    "text-muted-foreground",
  }[variant];

  const sublabelCls = {
    front:     "text-muted-foreground",
    surviving: "text-muted-foreground",
    expired:   "text-amber-500",
    dominated: "text-orange-500",
    pushed:    "text-primary",
  }[variant];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={[
          "flex flex-col items-center rounded border-2 px-2.5 py-1.5 min-w-[3rem] transition-all duration-300",
          cellCls,
        ].join(" ")}
      >
        <span className={["text-[9px] font-mono leading-none", idxCls].join(" ")}>idx</span>
        <span className="text-sm font-bold font-mono leading-none">{idx}</span>
        <span className={["text-[9px] font-mono mt-0.5", idxCls].join(" ")}>
          ={val}
        </span>
      </div>
      <span className={["text-[9px] font-mono h-3", sublabelCls].join(" ")}>{sublabel}</span>
    </div>
  );
}

function NumsRow({
  nums,
  highlight,
}: {
  nums: number[];
  highlight: (i: number) => { cell: string };
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {nums.map((num, i) => {
        const { cell } = highlight(i);
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={[
                "w-10 h-10 flex items-center justify-center rounded font-mono font-bold text-sm border-2 transition-all duration-300",
                cell,
              ].join(" ")}
            >
              {num}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground">[{i}]</span>
          </div>
        );
      })}
    </div>
  );
}

function ResultRow({
  resultSoFar,
  latestIsNew,
  done,
  empty,
}: {
  resultSoFar: number[];
  latestIsNew: boolean;
  done: boolean;
  empty: string;
}) {
  return (
    <div className="rounded border border-border bg-muted/10 px-3 py-2 min-h-[2.75rem] flex items-center">
      {resultSoFar.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 items-center">
          {resultSoFar.map((val, idx) => {
            const isLatest = latestIsNew && idx === resultSoFar.length - 1;
            return (
              <span
                key={idx}
                className={[
                  "inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded font-mono font-bold text-sm border-2 transition-all",
                  isLatest
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-primary/10 text-foreground border-primary/30",
                ].join(" ")}
              >
                {val}
              </span>
            );
          })}
          {done && (
            <span className="ml-1 text-xs text-primary font-medium">← final answer</span>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground italic font-mono">{empty}</span>
      )}
    </div>
  );
}

export function SlidingWindowComparisonVisualization() {
  const { nums, k } = DEMO_INPUT;

  const bruteSteps = useMemo(() => computeBruteForceSteps(nums, k), [nums, k]);
  const dequeSteps = useMemo(() => computeSteps(nums, k), [nums, k]);

  const cumulativePops = useMemo(() => {
    const counts: number[] = [];
    let total = 0;
    for (const s of dequeSteps) {
      total += (s.removedFront !== null ? 1 : 0) + s.removedBack.length;
      counts.push(total);
    }
    return counts;
  }, [dequeSteps]);

  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pauseDemo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const runDemo = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(true);
    setCurrentStep(-1);
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < bruteSteps.length) {
        setCurrentStep(i);
        i++;
      } else {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsRunning(false);
      }
    }, ANIMATION_MS);
  }, [bruteSteps.length]);

  const stepBack = useCallback(() => {
    if (isRunning) pauseDemo();
    setCurrentStep((prev) => Math.max(-1, prev - 1));
  }, [isRunning, pauseDemo]);

  const stepForward = useCallback(() => {
    if (isRunning) pauseDemo();
    setCurrentStep((prev) => Math.min(bruteSteps.length - 1, prev + 1));
  }, [isRunning, pauseDemo, bruteSteps.length]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const bruteStep = currentStep >= 0 ? bruteSteps[currentStep] : null;
  const dequeStep = currentStep >= 0 ? dequeSteps[currentStep] : null;

  const pushesSoFar = currentStep >= 0 ? currentStep + 1 : 0;
  const popsSoFar = currentStep >= 0 ? cumulativePops[currentStep] : 0;
  const totalOps = pushesSoFar + popsSoFar;
  const opsPerElement = pushesSoFar > 0 ? (totalOps / pushesSoFar).toFixed(2) : "—";
  const isDone = currentStep === bruteSteps.length - 1;

  return (
    <div className="space-y-4">
      {/* Shared Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={runDemo}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          Run
        </button>
        <button
          type="button"
          onClick={pauseDemo}
          disabled={!isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Pause className="w-4 h-4" />
          Pause
        </button>
        <button
          type="button"
          onClick={stepBack}
          disabled={currentStep <= -1}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={stepForward}
          disabled={currentStep >= bruteSteps.length - 1}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-muted-foreground ml-1">
          {currentStep === -1
            ? "Not started — press Run or use → to step"
            : `Step ${currentStep + 1} of ${bruteSteps.length}${isDone ? " — done!" : ""}`}
        </p>
      </div>

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* ── LEFT: Brute Force ─────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-destructive">Brute Force</span>
            <span className="rounded px-1.5 py-0.5 bg-destructive/10 text-destructive text-xs font-mono">
              O(n·k)
            </span>
          </div>

          {/* Nums */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              nums
            </div>
            <NumsRow
              nums={nums}
              highlight={(i) => {
                const inWindow =
                  bruteStep !== null &&
                  !bruteStep.isWarmup &&
                  i >= bruteStep.windowStart &&
                  i <= bruteStep.windowEnd;
                const isCurrent = bruteStep?.index === i;
                return {
                  cell: inWindow
                    ? "bg-destructive/20 text-foreground border-destructive"
                    : isCurrent
                      ? "bg-muted/40 text-foreground border-muted-foreground"
                      : "bg-muted/10 text-muted-foreground border-border/50 opacity-40",
                };
              }}
            />
            <p className="text-xs text-muted-foreground mt-1.5 font-mono h-4">
              {bruteStep
                ? bruteStep.isWarmup
                  ? `warming up — window not full until i = ${k - 1}`
                  : `scan nums[${bruteStep.windowStart}..${bruteStep.windowEnd}] — all ${k} elements`
                : ""}
            </p>
          </div>

          {/* Work counter */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-destructive mb-1">
              Comparisons made
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-foreground">
                {bruteStep?.totalComparisons ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">element accesses so far</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {bruteStep && !bruteStep.isWarmup ? (
                <>
                  This window:{" "}
                  <span className="font-mono text-foreground">+{k}</span> (full re-scan every time)
                </>
              ) : (
                <span className="italic">no scan yet (warming up)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Final total:{" "}
              <span className="font-mono text-foreground">
                (n−k+1) × k = {(nums.length - k + 1) * k}
              </span>
            </p>
          </div>

          {/* Current max */}
          <div className="flex items-center gap-3 h-7">
            <span className="text-xs text-muted-foreground">Window max:</span>
            <span className="font-mono font-bold text-lg text-foreground">
              {bruteStep?.currentMax !== null && bruteStep?.currentMax !== undefined
                ? bruteStep.currentMax
                : "—"}
            </span>
          </div>

          {/* Result */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              result
            </div>
            <ResultRow
              resultSoFar={bruteStep?.resultSoFar ?? []}
              latestIsNew={bruteStep?.currentMax !== null}
              done={isDone}
              empty={bruteStep ? "[] (window not full yet)" : "not started"}
            />
          </div>
        </div>

        {/* ── RIGHT: Monotonic Deque ────────────────────────── */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">Monotonic Deque</span>
            <span className="rounded px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-mono">
              O(n)
            </span>
          </div>

          {/* Nums */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              nums
            </div>
            <NumsRow
              nums={nums}
              highlight={(i) => {
                if (!dequeStep) {
                  return { cell: "bg-muted/10 text-muted-foreground border-border/50 opacity-40" };
                }
                const inWindow = i >= dequeStep.windowStart && i <= dequeStep.windowEnd;
                const isCurrent = dequeStep.index === i;
                const inDeque = dequeStep.dequeAfter.includes(i);
                const isMax =
                  dequeStep.resultPushed !== null && dequeStep.dequeAfter[0] === i;
                return {
                  cell: isMax
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : isCurrent
                      ? "bg-accent/30 text-foreground border-accent"
                      : inDeque
                        ? "bg-primary/15 text-foreground border-primary/60"
                        : inWindow
                          ? "bg-muted/30 text-foreground border-border"
                          : "bg-muted/10 text-muted-foreground border-border/50 opacity-40",
                };
              }}
            />
            <p className="text-xs text-muted-foreground mt-1.5 font-mono h-4">
              {dequeStep
                ? `window = nums[${dequeStep.windowStart}..${dequeStep.windowEnd}]${
                    dequeStep.resultPushed !== null
                      ? ` · max = ${dequeStep.resultPushed}`
                      : ""
                  }`
                : ""}
            </p>
          </div>

          {/* ① Deque contents — indices + values */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              ① Deque stores{" "}
              <span className="text-foreground">indices</span>, not values
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 min-h-[6rem]">
              {dequeStep ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase">
                    <span>front</span>
                    <span className="flex-1 border-t border-dashed border-border mx-1" />
                    <span>back</span>
                  </div>
                  {(() => {
                    // Reconstruct the before-state so removals are visible.
                    // dequeAfter = [surviving..., pushedItem]. Pushed is always last.
                    const survivingItems = dequeStep.dequeAfter.slice(0, -1);
                    // removedBack is popped back-to-front; reverse restores front→back order.
                    const dominatedItems = [...dequeStep.removedBack].reverse();
                    const newItemIsFront = dequeStep.dequeAfter.length === 1;
                    const windowFull = dequeStep.resultPushed !== null;
                    return (
                      <div className="flex flex-wrap gap-2 items-end">
                        {/* 1. Expired front item */}
                        {dequeStep.removedFront !== null && (
                          <DequeCell
                            val={nums[dequeStep.removedFront]}
                            idx={dequeStep.removedFront}
                            variant="expired"
                            sublabel="expired"
                          />
                        )}
                        {/* 2. Surviving items — first is the new front/max */}
                        {survivingItems.map((idx, pos) => (
                          <DequeCell
                            key={idx}
                            val={nums[idx]}
                            idx={idx}
                            variant={pos === 0 ? "front" : "surviving"}
                            sublabel={pos === 0 ? (windowFull ? "max" : "front") : ""}
                          />
                        ))}
                        {/* 3. Dominated back items (restored to front→back order) */}
                        {dominatedItems.map((idx) => (
                          <DequeCell
                            key={idx}
                            val={nums[idx]}
                            idx={idx}
                            variant="dominated"
                            sublabel="dominated"
                          />
                        ))}
                        {/* 4. Newly pushed item */}
                        <DequeCell
                          val={dequeStep.num}
                          idx={dequeStep.index}
                          variant={newItemIsFront ? "front" : "pushed"}
                          sublabel={newItemIsFront ? (windowFull ? "max" : "front") : "← pushed"}
                        />
                      </div>
                    );
                  })()}
                  <p className="text-[10px] text-muted-foreground">
                    <span className="text-amber-500 font-medium">Amber</span> = expired (slid out of window) ·{" "}
                    <span className="text-orange-500 font-medium">Orange</span> = dominated (smaller than incoming) ·{" "}
                    index stored so we know which window it belongs to
                  </p>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">not started</span>
              )}
            </div>
          </div>

          {/* ② Two simultaneous invariants */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              ② Two simultaneous invariants
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Recency */}
              {(() => {
                const triggered = dequeStep !== null && dequeStep.removedFront !== null;
                return (
                  <div
                    className={[
                      "rounded-lg border p-3 transition-all duration-300",
                      triggered
                        ? "border-amber-500/60 bg-amber-500/10"
                        : "border-border bg-muted/10",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-[10px] font-bold uppercase tracking-wide mb-1",
                        triggered ? "text-amber-500" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      Recency
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Drop front when{" "}
                      <code className="font-mono text-[9px] bg-muted px-0.5 rounded">
                        deque[0] &lt;= i−k
                      </code>
                    </p>
                    <p
                      className={[
                        "text-[10px] mt-1.5 font-mono",
                        triggered ? "text-amber-600 font-medium" : "text-muted-foreground italic",
                      ].join(" ")}
                    >
                      {triggered
                        ? `idx ${dequeStep!.removedFront} (val ${nums[dequeStep!.removedFront!]}) expired`
                        : "not triggered"}
                    </p>
                  </div>
                );
              })()}

              {/* Dominance */}
              {(() => {
                const triggered = (dequeStep?.removedBack.length ?? 0) > 0;
                return (
                  <div
                    className={[
                      "rounded-lg border p-3 transition-all duration-300",
                      triggered
                        ? "border-orange-500/60 bg-orange-500/10"
                        : "border-border bg-muted/10",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-[10px] font-bold uppercase tracking-wide mb-1",
                        triggered ? "text-orange-500" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      Dominance
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Pop back while{" "}
                      <code className="font-mono text-[9px] bg-muted px-0.5 rounded">
                        nums[back] &lt; nums[i]
                      </code>
                    </p>
                    <p
                      className={[
                        "text-[10px] mt-1.5 font-mono",
                        triggered ? "text-orange-600 font-medium" : "text-muted-foreground italic",
                      ].join(" ")}
                    >
                      {triggered && dequeStep
                        ? `popped: ${dequeStep.removedBack
                            .map((idx) => `val ${nums[idx]}`)
                            .join(", ")}`
                        : "not triggered"}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ③ Amortized analysis */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              ③ Amortized analysis
            </div>
            <div className="rounded-lg border border-border bg-muted/10 p-3">
              <div className="grid grid-cols-4 gap-2 text-center mb-2">
                {[
                  { label: "Pushes", value: pushesSoFar, sub: "1 per element" },
                  { label: "Pops", value: popsSoFar, sub: "≤ 1 per element" },
                  { label: "Total ops", value: totalOps, sub: "pushes + pops" },
                  { label: "Ops / elem", value: opsPerElement, sub: "≤ 2 always" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="space-y-0.5">
                    <div className="text-xl font-bold font-mono text-foreground">{value}</div>
                    <div className="text-[10px] font-medium text-foreground">{label}</div>
                    <div className="text-[9px] text-muted-foreground">{sub}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Each index is pushed exactly once and popped at most once — total deque work bounded
                by 2n regardless of how many back-pops happen in a single step.
              </p>
            </div>
          </div>

          {/* Result */}
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              result
            </div>
            <ResultRow
              resultSoFar={dequeStep?.resultSoFar ?? []}
              latestIsNew={dequeStep?.resultPushed !== null}
              done={isDone}
              empty={dequeStep ? "[] (window not full yet)" : "not started"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
