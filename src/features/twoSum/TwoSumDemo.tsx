import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Single source of truth for the demo input.
 * Edit `nums` and `target` here to change what the animation runs on.
 *
 * Walk-through with target = 17:
 *   i=0 num=3  comp=14 → not found, add 3→0
 *   i=1 num=7  comp=10 → not found, add 7→1
 *   i=2 num=1  comp=16 → not found, add 1→2
 *   i=3 num=5  comp=12 → not found, add 5→3
 *   i=4 num=11 comp=6  → not found, add 11→4
 *   i=5 num=2  comp=15 → not found, add 2→5
 *   i=6 num=4  comp=13 → not found, add 4→6
 *   i=7 num=6  comp=11 → FOUND at seen[11]=4 → return [4, 7]
 */
export const DEMO_INPUT = {
  nums: [3, 7, 1, 5, 11, 2, 4, 6, 8, 9],
  target: 17,
};

export interface TwoSumStep {
  index: number;
  num: number;
  complement: number;
  /** Entries in the seen map after this step's write (or no-write if found). */
  seenAfter: Array<[number, number]>;
  status: "no_match" | "found";
  result: [number, number] | null;
}

export function computeSteps(nums: number[], target: number): TwoSumStep[] {
  const steps: TwoSumStep[] = [];
  const seen = new Map<number, number>();

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const complement = target - num;

    if (seen.has(complement)) {
      steps.push({
        index: i,
        num,
        complement,
        seenAfter: [...seen.entries()],
        status: "found",
        result: [seen.get(complement)!, i],
      });
      break;
    } else {
      seen.set(num, i);
      steps.push({
        index: i,
        num,
        complement,
        seenAfter: [...seen.entries()],
        status: "no_match",
        result: null,
      });
    }
  }

  return steps;
}

const ANIMATION_MS = 900;

export function TwoSumDemo() {
  const { nums, target } = DEMO_INPUT;

  const [steps] = useState<TwoSumStep[]>(() => computeSteps(nums, target));
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

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1 min-w-0">
      {/* Header + controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm font-medium text-foreground">
          Hash map simulation — {nums.length} numbers, target = {target}
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
          : `Step ${currentStep + 1} of ${steps.length}${step?.status === "found" ? " — answer found!" : ""}`}
      </p>

      {/* nums array */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          nums
        </div>
        <div className="flex flex-wrap gap-2">
          {nums.map((num, i) => {
            const isResult =
              step?.result !== null &&
              step?.result !== undefined &&
              (step.result[0] === i || step.result[1] === i);
            const isCurrent = step?.index === i && !isResult;
            const isPast = step !== null && i < step.index && !isResult;

            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className={[
                    "w-10 h-10 flex items-center justify-center rounded-md font-mono font-bold text-sm border-2 transition-all duration-300",
                    isResult
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : isCurrent
                        ? "bg-primary/20 text-primary border-primary"
                        : isPast
                          ? "bg-muted/30 text-muted-foreground border-border opacity-50"
                          : "bg-muted/20 text-foreground border-border",
                  ].join(" ")}
                >
                  {num}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">[{i}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operation panel + seen map */}
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
                {step ? `i = ${step.index}` : "twoSum.ts"}
              </span>
            </div>
            <pre className="bg-code px-5 py-4 font-mono text-sm leading-7 min-h-[9rem] overflow-x-auto">
              {step ? (
                <code>
                  {/* i */}
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">i </span>
                  <span className="text-code-comment">= </span>
                  <span className="text-accent font-bold">{step.index}</span>
                  {"\n"}
                  {/* num */}
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">num </span>
                  <span className="text-code-comment">= nums[{step.index}] = </span>
                  <span className="text-accent font-bold">{step.num}</span>
                  {"\n"}
                  {/* complement — shown as addition so "goal = complement + num = target" is intuitive */}
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">complement</span>
                  <span className="text-code-comment"> = </span>
                  <span className="text-accent font-bold">{step.complement}</span>
                  <span className="text-code-comment"> + {step.num} = {target}</span>
                  {"\n\n"}
                  {/* seen.has check */}
                  <span className="text-code-tag">seen</span>
                  <span className="text-code-foreground">.has(</span>
                  <span className="text-accent">{step.complement}</span>
                  <span className="text-code-foreground">)</span>
                  <span className="text-code-comment">  →  </span>
                  {step.status === "found" ? (
                    <span className="text-primary font-bold">true ✓</span>
                  ) : (
                    <span className="text-destructive font-bold">false ✗</span>
                  )}
                  {"\n"}
                  {step.status === "found" ? (
                    <>
                      <span className="text-code-keyword">return </span>
                      <span className="text-primary font-bold">
                        [{step.result![0]}, {step.result![1]}]
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-code-tag">seen</span>
                      <span className="text-code-foreground">.set(</span>
                      <span className="text-accent">{step.num}</span>
                      <span className="text-code-foreground">, </span>
                      <span className="text-accent">{step.index}</span>
                      <span className="text-code-foreground">)</span>
                    </>
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

        {/* seen Map */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            seen{" "}
            <span className="normal-case font-normal">
              Map&lt;value&nbsp;→&nbsp;index&gt;
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 overflow-hidden min-h-[10.5rem]">
            {step && step.seenAfter.length > 0 ? (
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground w-1/2">
                      value
                    </th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground w-1/2">
                      index
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {step.seenAfter.map(([val, idx]) => {
                    const isHighlighted =
                      step.status === "found"
                        ? val === step.complement
                        : val === step.num;

                    return (
                      <tr
                        key={val}
                        className={[
                          "border-b border-border/50 last:border-0 transition-colors",
                          isHighlighted
                            ? "bg-primary/15 text-primary font-bold"
                            : "text-foreground",
                        ].join(" ")}
                      >
                        <td className="px-4 py-1.5">
                          {val}
                          {isHighlighted && step.status === "found" && (
                            <span className="ml-1.5 text-[10px] font-normal text-primary/70">
                              ← complement
                            </span>
                          )}
                          {isHighlighted && step.status === "no_match" && (
                            <span className="ml-1.5 text-[10px] font-normal text-primary/70">
                              ← just added
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-1.5">{idx}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[10.5rem]">
                <span className="text-xs text-muted-foreground italic">
                  {step ? "empty" : "not started"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result banner */}
      {step?.status === "found" && step.result && (
        <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-primary text-sm">Answer found</span>
          <span className="font-mono font-bold text-primary text-sm">
            [{step.result[0]}, {step.result[1]}]
          </span>
          <span className="text-xs text-muted-foreground">
            nums[{step.result[0]}] + nums[{step.result[1]}] = {nums[step.result[0]]} + {nums[step.result[1]]} = {target}
          </span>
        </div>
      )}
    </div>
  );
}
