import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Plus, Minus } from "lucide-react";
import { INPUT_ARRAY, formatInputArray } from "./demoConfig";
import { arrayToTree } from "./kthSmallest";
import { inorderSequence, inorderTrace } from "./traversal";
import { TreeDiagram } from "./TreeDiagram";

// Derived once at module load from the single source of truth in demoConfig.ts.
const DEMO_TREE = arrayToTree(INPUT_ARRAY);
const INORDER = inorderSequence(DEMO_TREE);         // ascending sequence for the answer strip
const TRAVERSAL_STEPS = inorderTrace(DEMO_TREE);    // full enter/visit trace for animation
const INPUT_STRING = formatInputArray(INPUT_ARRAY); // display string for the header

export function KthSmallestBstDemo({ autoPlay = false, loop = false, hideControls = false }: { autoPlay?: boolean; loop?: boolean; hideControls?: boolean } = {}) {
  const [k, setK] = useState(1);
  const [stepIndex, setStepIndex] = useState(-1);
  const [visitOrder, setVisitOrder] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  // Resolve the current traversal step from the flat TRAVERSAL_STEPS array.
  const currentStep =
    stepIndex >= 0 && stepIndex < TRAVERSAL_STEPS.length
      ? TRAVERSAL_STEPS[stepIndex]
      : null;

  // During an "enter" step, highlight the path from root to the entered node (amber).
  // During a "visit" step (or between steps), no path is highlighted.
  const consideringPath = currentStep?.phase === "enter" ? currentStep.path : [];

  // The most recently visited node gets the "current" (bright blue) highlight.
  const lastVisited =
    visitOrder.length > 0 ? visitOrder[visitOrder.length - 1] : null;

  const runDemo = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    setVisitOrder([]);
    setStepIndex(-1);

    let idx = -1;
    let visited: number[] = [];

    // Advance one step every 500 ms through the pre-computed TRAVERSAL_STEPS trace.
    const interval = setInterval(() => {
      idx++;
      if (idx < TRAVERSAL_STEPS.length) {
        const step = TRAVERSAL_STEPS[idx];
        setStepIndex(idx); // drives the "considering" highlight via currentStep

        if (step.phase === "visit") {
          // Only "visit" steps count toward k; "enter" steps are silent descents.
          visited = [...visited, step.val];
          setVisitOrder(visited);
          if (visited.length === k) {
            // We've now seen exactly k nodes in sorted order — this is the answer.
            setResult(step.val);
          }
        }
      } else {
        setStepIndex(-1); // clear considering highlight after the last step
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 500);
  }, [k, isRunning]);

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

  // Predicate helpers passed down to TreeDiagram and used for the input array strip.
  const isConsidering = (val: number) => consideringPath.includes(val); // on descent path, not yet visited
  const isVisited = (val: number) => visitOrder.includes(val);           // counted in in-order sequence
  const isCurrent = (val: number) => lastVisited !== null && lastVisited === val; // most recently visited
  const isKth = (val: number) => result !== null && val === result;       // the final answer

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1 min-w-0">
      {!hideControls && (
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <span className="text-sm font-medium text-foreground">
          In-order traversal (root = {INPUT_STRING})
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="k-select" className="text-sm text-muted-foreground">
            k =
          </label>
          <select
            id="k-select"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            disabled={isRunning}
            className="rounded border border-border bg-background px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {Array.from({ length: INORDER.length }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
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
      </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">
        In-order (left → node → right) visits nodes in ascending order. The kth
        node visited is the kth smallest. We <em>consider</em> nodes (go left) before{" "}
        <em>visiting</em> them.
      </p>

      {/* Input array (level-order serialization) */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Input array (level-order)
        </div>
        <div className="flex flex-wrap gap-1.5 items-center mb-2">
          {INPUT_ARRAY.map((v, i) => {
            if (v === null) {
              return (
                <span
                  key={`null-${i}`}
                  className="inline-flex items-center justify-center min-w-[2rem] h-8 px-1.5 rounded border border-border bg-muted/30 font-mono text-xs text-muted-foreground"
                >
                  null
                </span>
              );
            }
            const considering = isConsidering(v);
            const visited = isVisited(v);
            const current = isCurrent(v);
            const kth = isKth(v);
            return (
              <span
                key={`${v}-${i}`}
                className={`inline-flex items-center justify-center min-w-[2rem] h-8 px-1.5 rounded border-2 font-mono text-sm font-semibold transition-colors ${
                  kth
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-primary bg-primary/15 text-foreground"
                      : visited
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : considering
                          ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "border-border bg-muted/50 text-muted-foreground"
                }`}
              >
                {v}
              </span>
            );
          })}
        </div>
      </div>

      {/* BST diagram with live traversal highlighting */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">BST</div>
        <div
          className="text-sm font-mono p-4 rounded-lg overflow-x-auto"
          aria-label={`Tree structure from ${INPUT_STRING}`}
        >
          {DEMO_TREE && (
            <TreeDiagram
              node={DEMO_TREE}
              isConsidering={isConsidering}
              isVisited={isVisited}
              isCurrent={isCurrent}
              isKth={isKth}
            />
          )}
        </div>
        {currentStep && (
          <p className="text-xs text-muted-foreground mt-2">
            {currentStep.phase === "enter" ? (
              <>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Considering
                </span>{" "}
                (going left):{" "}
                <span className="font-mono">{consideringPath.join(" → ")}</span>
                {" — "}not visited yet.
              </>
            ) : (
              <>
                <span className="text-primary font-medium">Visiting</span>{" "}
                <span className="font-mono">{currentStep.val}</span>
              </>
            )}
          </p>
        )}
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
          <span>
            <span className="inline-block w-4 h-4 rounded border-2 border-amber-500 bg-amber-500/15 mr-1 align-middle" />
            Considering
          </span>
          <span>
            <span className="inline-block w-4 h-4 rounded border-2 border-primary/60 bg-primary/10 mr-1 align-middle" />
            Visited
          </span>
          <span>
            <span className="inline-block w-4 h-4 rounded border-2 border-primary bg-primary mr-1 align-middle" />
            Kth smallest
          </span>
        </div>
      </div>

      {/* In-order visit order strip */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          In-order visit order
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {INORDER.map((val) => {
            const current = isCurrent(val);
            const kth = isKth(val);
            return (
              <span
                key={val}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 font-mono text-sm font-semibold transition-colors ${
                  kth
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-primary bg-primary/15 text-foreground"
                      : visitOrder.includes(val)
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border bg-muted/50 text-muted-foreground"
                }`}
              >
                {val}
              </span>
            );
          })}
        </div>
      </div>

      {result !== null && (
        <p className="text-sm font-medium text-foreground">
          Kth smallest (k = {k}):{" "}
          <span className="font-mono text-primary">{result}</span>
        </p>
      )}

      <details className="group/explain rounded-lg border border-border bg-muted/20 overflow-hidden mt-4">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-3 py-2.5 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <Plus className="w-4 h-4 shrink-0 text-primary group-open/explain:hidden" aria-hidden />
          <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/explain:inline" aria-hidden />
          <span className="font-medium text-foreground text-sm">
            How in-order gives kth smallest
          </span>
        </summary>
        <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground border-t border-border">
          <div className="pt-3 space-y-3">
            <p>
              In a BST,{" "}
              <strong className="text-foreground">in-order traversal</strong> (left
              subtree, then node, then right subtree) visits nodes in{" "}
              <strong className="text-foreground">ascending order</strong>. So the
              1st node visited is the smallest, the 2nd is the 2nd smallest, and
              the kth node visited is the kth smallest. We can stop as soon as we
              have visited k nodes (early exit).
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
