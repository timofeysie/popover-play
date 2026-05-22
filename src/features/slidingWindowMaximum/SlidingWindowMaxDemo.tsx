import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Single source of truth for the demo input.
 * Edit `nums` and `k` here to change what the animation runs on.
 *
 * Expected output for nums=[1,3,-1,-3,5,3,6,7], k=3 → [3,3,5,5,6,7]
 *
 * Walk-through (deque holds indices; we display values for clarity):
 *   i=0 num=1   pop-out: -        pop-back: -                         push 0   deque=[1]            (warming up)
 *   i=1 num=3   pop-out: -        pop-back: 1<3 → pop                 push 1   deque=[3]            (warming up)
 *   i=2 num=-1  pop-out: -        pop-back: 3 stays                   push 2   deque=[3,-1]         result=[3]
 *   i=3 num=-3  pop-out: -        pop-back: -1 stays                  push 3   deque=[3,-1,-3]      result=[3,3]
 *   i=4 num=5   pop-out: idx 1    pop-back: -3<5, -1<5 → pop both     push 4   deque=[5]            result=[3,3,5]
 *   i=5 num=3   pop-out: -        pop-back: 5 stays                   push 5   deque=[5,3]          result=[3,3,5,5]
 *   i=6 num=6   pop-out: -        pop-back: 3<6, 5<6 → pop both       push 6   deque=[6]            result=[3,3,5,5,6]
 *   i=7 num=7   pop-out: -        pop-back: 6<7 → pop                 push 7   deque=[7]            result=[3,3,5,5,6,7]
 */
export const DEMO_INPUT = {
  nums: [1, 3, -1, -3, 5, 3, 6, 7],
  k: 3,
};

export interface SlidingWindowStep {
  /** Iteration index (0..nums.length-1). */
  index: number;
  /** Value at nums[index]. */
  num: number;
  /** Window range [start, end] (inclusive) in nums after this step. */
  windowStart: number;
  windowEnd: number;
  /** Index removed from the front because it fell out of the window (null if none). */
  removedFront: number | null;
  /** Indices popped from the back because their values were < num. */
  removedBack: number[];
  /** Deque contents (array of indices) after this step's push. */
  dequeAfter: number[];
  /** Value pushed to the result this step (null while warming up: i < k-1). */
  resultPushed: number | null;
  /** Full result array up to and including this step. */
  resultSoFar: number[];
}

export function computeSteps(nums: number[], k: number): SlidingWindowStep[] {
  const steps: SlidingWindowStep[] = [];
  const deque: number[] = [];
  const result: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    let removedFront: number | null = null;
    if (deque.length > 0 && deque[0] <= i - k) {
      removedFront = deque.shift()!;
    }

    const removedBack: number[] = [];
    while (deque.length > 0 && nums[deque[deque.length - 1]] < num) {
      removedBack.push(deque.pop()!);
    }

    deque.push(i);

    let resultPushed: number | null = null;
    if (i >= k - 1) {
      resultPushed = nums[deque[0]];
      result.push(resultPushed);
    }

    steps.push({
      index: i,
      num,
      windowStart: Math.max(0, i - k + 1),
      windowEnd: i,
      removedFront,
      removedBack,
      dequeAfter: [...deque],
      resultPushed,
      resultSoFar: [...result],
    });
  }

  return steps;
}

const ANIMATION_MS = 1000;

export function SlidingWindowMaxDemo() {
  const { nums, k } = DEMO_INPUT;

  const [steps] = useState<SlidingWindowStep[]>(() => computeSteps(nums, k));
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
      if (i < steps.length) {
        setCurrentStep(i);
        i++;
      } else {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsRunning(false);
      }
    }, ANIMATION_MS);
  }, [steps.length]);

  const stepBack = useCallback(() => {
    if (isRunning) pauseDemo();
    setCurrentStep((prev) => Math.max(-1, prev - 1));
  }, [isRunning, pauseDemo]);

  const stepForward = useCallback(() => {
    if (isRunning) pauseDemo();
    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  }, [isRunning, pauseDemo, steps.length]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const isWarmup = step !== null && step.index < k - 1;

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1 min-w-0">
      {/* Header + controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm font-medium text-foreground">
          Monotonic deque simulation — {nums.length} numbers, k = {k}
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
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={stepForward}
            disabled={currentStep >= steps.length - 1}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step counter */}
      <p className="text-xs text-muted-foreground mb-3">
        {currentStep === -1
          ? "Not started — press Run or use → to step through"
          : `Step ${currentStep + 1} of ${steps.length}${
              isWarmup ? " — warming up (window not yet full)" : ""
            }${currentStep === steps.length - 1 ? " — done!" : ""}`}
      </p>

      {/* nums array with sliding window highlight */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          nums
        </div>
        <div className="flex flex-wrap gap-2">
          {nums.map((num, i) => {
            const inWindow =
              step !== null && i >= step.windowStart && i <= step.windowEnd;
            const isCurrent = step?.index === i;
            const inDeque = step?.dequeAfter.includes(i) ?? false;
            const isMaxOfWindow =
              step !== null &&
              !isWarmup &&
              step.dequeAfter.length > 0 &&
              i === step.dequeAfter[0];

            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className={[
                    "w-11 h-11 flex items-center justify-center rounded-md font-mono font-bold text-sm border-2 transition-all duration-300",
                    isMaxOfWindow
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : isCurrent
                        ? "bg-accent/30 text-foreground border-accent"
                        : inWindow && inDeque
                          ? "bg-primary/15 text-foreground border-primary/60"
                          : inWindow
                            ? "bg-muted/40 text-foreground border-border"
                            : "bg-muted/10 text-muted-foreground border-border/50 opacity-50",
                  ].join(" ")}
                >
                  {num}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">[{i}]</span>
              </div>
            );
          })}
        </div>
        {step !== null && (
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            window = nums[{step.windowStart}..{step.windowEnd}]
            {!isWarmup && step.dequeAfter.length > 0 && (
              <>
                {" "}
                · max ={" "}
                <span className="text-primary font-bold">
                  {nums[step.dequeAfter[0]]}
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Operation panel + deque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Operation panel — code-editor style */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Current operation
          </div>
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              <span className="ml-2 text-xs text-code-comment font-mono">
                {step ? `i = ${step.index}` : "maxSlidingWindow.ts"}
              </span>
            </div>
            <pre className="bg-code px-5 py-4 font-mono text-sm leading-7 min-h-[12rem] overflow-x-auto">
              {step ? (
                <code>
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">i </span>
                  <span className="text-code-comment">= </span>
                  <span className="text-accent font-bold">{step.index}</span>
                  {", "}
                  <span className="text-code-keyword">num </span>
                  <span className="text-code-comment">= nums[{step.index}] = </span>
                  <span className="text-accent font-bold">{step.num}</span>
                  {"\n\n"}
                  <span className="text-code-comment">{"// 1. drop indices that fell out\n"}</span>
                  {step.removedFront !== null ? (
                    <>
                      <span className="text-code-tag">deque</span>
                      <span className="text-code-foreground">.shift()</span>
                      <span className="text-code-comment">  →  out idx </span>
                      <span className="text-destructive font-bold">{step.removedFront}</span>
                    </>
                  ) : (
                    <span className="text-code-comment">{"front in window — no shift"}</span>
                  )}
                  {"\n\n"}
                  <span className="text-code-comment">{"// 2. pop back while < num\n"}</span>
                  {step.removedBack.length > 0 ? (
                    <>
                      <span className="text-code-tag">deque</span>
                      <span className="text-code-foreground">.pop()</span>
                      <span className="text-code-comment">  →  drop </span>
                      <span className="text-destructive font-bold">
                        [{step.removedBack
                          .map((idx) => `${DEMO_INPUT.nums[idx]}`)
                          .join(", ")}]
                      </span>
                    </>
                  ) : (
                    <span className="text-code-comment">{"back ≥ num — keep all"}</span>
                  )}
                  {"\n\n"}
                  <span className="text-code-comment">{"// 3. push current index\n"}</span>
                  <span className="text-code-tag">deque</span>
                  <span className="text-code-foreground">.push(</span>
                  <span className="text-accent">{step.index}</span>
                  <span className="text-code-foreground">)</span>
                  {"\n\n"}
                  <span className="text-code-comment">{"// 4. record max if window full\n"}</span>
                  {step.resultPushed !== null ? (
                    <>
                      <span className="text-code-tag">result</span>
                      <span className="text-code-foreground">.push(nums[</span>
                      <span className="text-accent">{step.dequeAfter[0]}</span>
                      <span className="text-code-foreground">])</span>
                      <span className="text-code-comment">  →  </span>
                      <span className="text-primary font-bold">{step.resultPushed}</span>
                    </>
                  ) : (
                    <span className="text-code-comment">
                      {`i < k-1 (${step.index} < ${k - 1}) — skip`}
                    </span>
                  )}
                </code>
              ) : (
                <code className="text-code-comment">
                  {"// press Run or → to begin\n"}
                  {"// each step shows one\n"}
                  {"// iteration of the loop"}
                </code>
              )}
            </pre>
          </div>
        </div>

        {/* Deque visualisation */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            deque{" "}
            <span className="normal-case font-normal">
              indices (front → back, monotonic decreasing values)
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 overflow-hidden min-h-[12rem] flex flex-col">
            {step && step.dequeAfter.length > 0 ? (
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                  <span>front (max)</span>
                  <span className="flex-1 border-t border-dashed border-border" />
                  <span>back</span>
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                  {step.dequeAfter.map((idx, position) => {
                    const value = DEMO_INPUT.nums[idx];
                    const isFront = position === 0;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-0.5">
                        <div
                          className={[
                            "min-w-[2.75rem] h-11 px-2 flex items-center justify-center rounded-md font-mono font-bold text-sm border-2 transition-all",
                            isFront
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-primary/10 text-foreground border-primary/40",
                          ].join(" ")}
                        >
                          {value}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          idx {idx}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-auto">
                  Values strictly decrease left → right. The front always holds the
                  current window&apos;s maximum.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[12rem]">
                <span className="text-xs text-muted-foreground italic">
                  {step ? "empty" : "not started"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result row */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          result
        </div>
        <div className="rounded-lg border border-border bg-muted/10 px-4 py-3 min-h-[3.25rem] flex items-center">
          {step && step.resultSoFar.length > 0 ? (
            <div className="flex flex-wrap gap-2 items-center">
              {step.resultSoFar.map((val, idx) => {
                const isLatest =
                  step.resultPushed !== null && idx === step.resultSoFar.length - 1;
                return (
                  <span
                    key={idx}
                    className={[
                      "inline-flex items-center justify-center min-w-[2.5rem] h-9 px-2 rounded-md font-mono font-bold text-sm border-2 transition-all",
                      isLatest
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-primary/10 text-foreground border-primary/30",
                    ].join(" ")}
                  >
                    {val}
                  </span>
                );
              })}
              {currentStep === steps.length - 1 && (
                <span className="ml-2 text-xs font-medium text-primary">
                  ← final answer
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic font-mono">
              {step ? "[] (window not full yet)" : "not started"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
