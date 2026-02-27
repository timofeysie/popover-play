import { useState, useMemo } from "react";
import { Play, Plus, Minus } from "lucide-react";

/** Example grid: "1" = land, "0" = water. This one has 3 islands. */
const DEMO_GRID: string[][] = [
  ["1", "1", "1", "1", "0"],
  ["1", "1", "1", "1", "0"],
  ["0", "0", "0", "0", "0"],
  ["0", "0", "0", "1", "1"],
];

/** Animation steps: 
 * scan = outer loop position; 
 * island = new island found; 
 * dfs = cell visited (sunk) during DFS. */
type Step =
  | { type: "scan"; r: number; c: number }
  | { type: "island"; count: number; r: number; c: number }
  | { type: "dfs"; r: number; c: number };

/**
 * Runs the number-of-islands algorithm and records every step so we can animate it.
 * Returns a flat list of steps (scan → island → dfs, dfs, … for each island).
 */
function buildSteps(grid: string[][]): Step[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return [];

  const steps: Step[] = [];
  const copy = grid.map((row) => row.slice()); // mutate copy so we don't double-count

  function dfs(r: number, c: number): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols || copy[r][c] !== "1") return;
    steps.push({ type: "dfs", r, c }); // record this cell for animation
    copy[r][c] = "0"; // sink: mark as visited so we don't revisit
    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  }

  let islandCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({ type: "scan", r, c }); // show cursor at (r, c)
      if (copy[r][c] === "1") {
        islandCount++;
        steps.push({ type: "island", count: islandCount, r, c });
        dfs(r, c); // sink entire island and record each dfs visit
      }
    }
  }
  return steps;
}

const STEPS = buildSteps(DEMO_GRID);
const ROWS = DEMO_GRID.length;
const COLS = DEMO_GRID[0].length;

export function NumberOfIslandsDemo() {
  const [stepIndex, setStepIndex] = useState(-1); // -1 = not started; 0..STEPS.length = replay position
  const [isRunning, setIsRunning] = useState(false);

  const runDfs = () => {
    setIsRunning(true);
    setStepIndex(-1);

    let i = -1;
    const interval = setInterval(() => {
      i++;
      if (i <= STEPS.length) {
        setStepIndex(i); // advance one step (or past end to clear "current")
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 350);
  };

  // Derive UI state by replaying steps 0..stepIndex: which cell is current, which are sunk, island count
  const { current, sunk, islandCount, isScan } = useMemo(() => {
    const sunk = new Set<string>();
    let islandCount = 0;
    let current: { r: number; c: number } | null = null;
    let isScan = false;

    for (let i = 0; i <= stepIndex && i < STEPS.length; i++) {
      const step = STEPS[i];
      if (step.type === "scan") {
        current = { r: step.r, c: step.c };
        isScan = true;
      } else if (step.type === "island") {
        islandCount = step.count;
        current = { r: step.r, c: step.c };
        isScan = false;
      } else if (step.type === "dfs") {
        sunk.add(`${step.r},${step.c}`);
        current = { r: step.r, c: step.c };
        isScan = false;
      }
    }
    if (stepIndex >= STEPS.length) {
      current = null; // animation finished, no highlight
    }
    return { current, sunk, islandCount, isScan };
  }, [stepIndex]);

  const getCellState = (r: number, c: number) => {
    const key = `${r},${c}`;
    const isSunk = sunk.has(key);
    const isCurrent = current?.r === r && current?.c === c;
    const isLand = DEMO_GRID[r][c] === "1"; // use original grid for display (1/0)
    return { isLand, isSunk, isCurrent, isWater: !isLand };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">Number of Islands (DFS)</span>
        <button
          type="button"
          onClick={runDfs}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          Run
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-muted-foreground">
          Islands found: <strong className="text-foreground">{stepIndex < 0 ? "—" : islandCount}</strong>
        </span>
        {current && (
          <span className="text-xs text-muted-foreground font-mono">
            {isScan ? "Scanning" : "DFS"}({current.r},{current.c})
          </span>
        )}
      </div>

      {/* Grid: each cell shows 1/0 from original grid; styling reflects current / sunk / land / water */}
      <div
        className="inline-grid gap-1 mb-4"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 2rem))`,
          gridTemplateRows: `repeat(${ROWS}, 2rem)`,
        }}
      >
        {DEMO_GRID.map((row, r) =>
          row.map((cell, c) => {
            const { isLand, isSunk, isCurrent, isWater } = getCellState(r, c);
            return (
              <div
                key={`${r}-${c}`}
                className={`inline-flex items-center justify-center rounded border-2 font-mono text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isSunk
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : isLand
                        ? "border-border bg-muted text-foreground"
                        : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}
                title={`(${r},${c}) ${cell === "1" ? "land" : "water"}${isSunk ? " (sunk)" : ""}${isCurrent ? " (current)" : ""}`}
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
