import { useState, useMemo, useRef, useEffect } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";

/** Example grid: "1" = land, "0" = water. This one has 3 islands. */
const DEMO_GRID: string[][] = [
  ["0", "0", "0", "0", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "0", "0", "0", "0"],
];

/** Animation steps: scan = outer loop position; island = new island found; dfs = cell visited (sunk) during DFS. */
type Step =
  | { type: "scan"; row: number; col: number; scanIteration: number; recursionDepth: 0 }
  | { type: "island"; islandCount: number; row: number; col: number; scanIteration: number; recursionDepth: 0 }
  | { type: "dfs"; row: number; col: number; scanIteration: number; recursionDepth: number };

/**
 * Runs the number-of-islands algorithm and records every step so we can animate it.
 * Records recursion depth (how deep the DFS call stack is) and scan iteration (outer loop index).
 */
function buildSteps(grid: string[][]): Step[] {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  if (rowCount === 0 || colCount === 0) return [];

  const steps: Step[] = [];
  const copy = grid.map((row) => row.slice()); // mutate copy so we don't double-count

  function depthFirstSearch(
    row: number,
    col: number,
    recursionDepth: number,
    scanIteration: number
  ): void {
    if (row < 0 || row >= rowCount || col < 0 || col >= colCount || copy[row][col] !== "1") return;
    steps.push({ type: "dfs", row, col, scanIteration, recursionDepth });
    copy[row][col] = "0";
    depthFirstSearch(row - 1, col, recursionDepth + 1, scanIteration);
    depthFirstSearch(row + 1, col, recursionDepth + 1, scanIteration);
    depthFirstSearch(row, col - 1, recursionDepth + 1, scanIteration);
    depthFirstSearch(row, col + 1, recursionDepth + 1, scanIteration);
  }

  let islandCount = 0;
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const scanIteration = row * colCount + col;
      steps.push({ type: "scan", row, col, scanIteration, recursionDepth: 0 });
      if (copy[row][col] === "1") {
        islandCount++;
        steps.push({ type: "island", islandCount, row, col, scanIteration, recursionDepth: 0 });
        depthFirstSearch(row, col, 1, scanIteration); // depth 1 = first level of DFS
      }
    }
  }
  return steps;
}

const STEPS = buildSteps(DEMO_GRID);
const ROW_COUNT = DEMO_GRID.length;
const COL_COUNT = DEMO_GRID[0].length;

const ANIMATION_MS = 350;

export function NumberOfIslandsDemo({ autoPlay = false, loop = false, hideControls = false }: { autoPlay?: boolean; loop?: boolean; hideControls?: boolean } = {}) {
  const [stepIndex, setStepIndex] = useState(-1); // -1 = not started; 0..STEPS.length = replay position
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDfs = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(true);
    setStepIndex(-1);

    let i = -1;
    intervalRef.current = setInterval(() => {
      i++;
      if (i <= STEPS.length) {
        setStepIndex(i);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
      }
    }, ANIMATION_MS);
  };

  const pauseDfs = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const stepBack = () => {
    if (isRunning) pauseDfs();
    setStepIndex((prev) => Math.max(-1, prev - 1));
  };

  const stepForward = () => {
    if (isRunning) pauseDfs();
    setStepIndex((prev) => Math.min(STEPS.length, prev + 1));
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loopRef = useRef<{ loop: boolean; run: () => void }>({ loop: false, run: () => {} });
  useEffect(() => { loopRef.current = { loop, run: runDfs }; });
  const wasRunningRef = useRef(false);
  useEffect(() => {
    if (wasRunningRef.current && !isRunning && loopRef.current.loop) {
      const t = setTimeout(() => loopRef.current.run(), 1500);
      return () => clearTimeout(t);
    }
    wasRunningRef.current = isRunning;
  }, [isRunning]);
  useEffect(() => {
    if (autoPlay) runDfs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive UI state by replaying steps 0..stepIndex: current cell, sunk set, island count, recursion depth, scan iteration
  const { current, sunk, islandCount, isScan, recursionDepth, scanIteration } = useMemo(() => {
    const sunkSet = new Set<string>();
    let islandCountResult = 0;
    let currentCell: { row: number; col: number } | null = null;
    let isScanPhase = false;
    let currentRecursionDepth: number = 0;
    let currentScanIteration: number = 0;

    for (let index = 0; index <= stepIndex && index < STEPS.length; index++) {
      const step = STEPS[index];
      currentRecursionDepth = step.recursionDepth;
      currentScanIteration = step.scanIteration;
      if (step.type === "scan") {
        currentCell = { row: step.row, col: step.col };
        isScanPhase = true;
      } else if (step.type === "island") {
        islandCountResult = step.islandCount;
        currentCell = { row: step.row, col: step.col };
        isScanPhase = false;
      } else if (step.type === "dfs") {
        sunkSet.add(`${step.row},${step.col}`);
        currentCell = { row: step.row, col: step.col };
        isScanPhase = false;
      }
    }
    if (stepIndex >= STEPS.length) {
      currentCell = null;
    }
    return {
      current: currentCell,
      sunk: sunkSet,
      islandCount: islandCountResult,
      isScan: isScanPhase,
      recursionDepth: currentRecursionDepth,
      scanIteration: currentScanIteration,
    };
  }, [stepIndex]);

  const getCellState = (row: number, col: number) => {
    const key = `${row},${col}`;
    const isSunk = sunk.has(key);
    const isCurrent = current?.row === row && current?.col === col;
    const isLand = DEMO_GRID[row][col] === "1";
    return { isLand, isSunk, isCurrent, isWater: !isLand };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1">
      {!hideControls && (
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-sm font-medium text-foreground">Number of Islands (DFS)</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={runDfs}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            title="Run from start"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          <button
            type="button"
            onClick={pauseDfs}
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
            disabled={stepIndex <= -1}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            title="Previous step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={stepForward}
            disabled={stepIndex >= STEPS.length}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-muted/30 text-foreground text-sm font-medium hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
            title="Next step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        <span className="text-sm text-muted-foreground">
          Islands found: <strong className="text-foreground">{stepIndex < 0 ? "—" : islandCount}</strong>
        </span>
        {stepIndex >= 0 && (
          <>
            <span className="text-xs text-muted-foreground">
              Scan iteration: <strong className="text-foreground font-mono">{scanIteration}</strong>
            </span>
            <span className="text-xs text-muted-foreground">
              Recursion depth: <strong className="text-foreground font-mono">{recursionDepth}</strong>
            </span>
          </>
        )}
        {current && (
          <span className="text-xs text-muted-foreground font-mono">
            {isScan ? "Scanning" : "DFS"}({current.row},{current.col})
          </span>
        )}
      </div>

      {/* Grid: each cell shows 1/0 from original grid; styling reflects current / sunk / land / water */}
      <div
        className="inline-grid gap-1 mb-4"
        style={{
          gridTemplateColumns: `repeat(${COL_COUNT}, minmax(0, 2rem))`,
          gridTemplateRows: `repeat(${ROW_COUNT}, 2rem)`,
        }}
      >
        {DEMO_GRID.map((gridRow, row) =>
          gridRow.map((cell, col) => {
            const { isLand, isSunk, isCurrent, isWater } = getCellState(row, col);
            return (
              <div
                key={`${row}-${col}`}
                className={`inline-flex items-center justify-center rounded border-2 font-mono text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isSunk
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : isLand
                        ? "border-border bg-muted text-foreground"
                        : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}
                title={`(${row},${col}) ${cell === "1" ? "land" : "water"}${isSunk ? " (sunk)" : ""}${isCurrent ? " (current)" : ""}`}
              >
                {isWater ? "0" : "1"}
              </div>
            );
          })
        )}
      </div>

      <details className="group/explain rounded-lg border border-border bg-muted/20 overflow-hidden mb-4">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-3 py-2.5 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <Plus className="w-4 h-4 shrink-0 text-primary group-open/explain:hidden" aria-hidden />
          <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/explain:inline" aria-hidden />
          <span className="font-medium text-foreground text-sm">How the code works</span>
        </summary>
        <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground border-t border-border">
          <div className="pt-3 space-y-3">
            <p>
              The grid is scanned row-by-row. Each cell is either <strong className="text-foreground">land</strong> (
              <code className="bg-muted px-1 rounded text-foreground">1</code>) or{" "}
              <strong className="text-foreground">water</strong> (
              <code className="bg-muted px-1 rounded text-foreground">0</code>). When the scan hits a land cell, we
              count a new island and run <strong className="text-foreground">DFS</strong> from that cell to
              &quot;sink&quot; all connected land (mark as visited) so we don&apos;t count it again.
            </p>
            <p>
              DFS visits the current cell (highlighted), flips it to water, then recurses to the four neighbors (up,
              down, left, right). The same &quot;visit then recurse on neighbors&quot; pattern as the tree demo — here
              the &quot;neighbors&quot; are the four adjacent grid cells. Sunk cells stay styled so you can see the
              island that was explored.
            </p>
            <p>
              <strong className="text-foreground">Result:</strong> This grid has 3 islands. The animation shows the
              scan order and the DFS order within each island.
            </p>
          </div>
        </div>
      </details>

      {/* Legend for cell states */}
      <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded border-2 border-border bg-muted" aria-hidden />
          Land
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded border-2 border-border/60 bg-muted/30" aria-hidden />
          Water
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded border-2 border-primary bg-primary" aria-hidden />
          Current
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded border-2 border-primary/60 bg-primary/15" aria-hidden />
          Sunk
        </span>
      </div>
    </div>
  );
}
