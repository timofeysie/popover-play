import type { Vec2 } from "./types";

export type CellState =
  | { kind: "neutral" }
  | { kind: "territory"; playerId: string }
  | {
      kind: "trail";
      playerId: string;
      /**
       * Set when this trail was laid across a still-standing rival's land rather
       * than open ground — the rival hasn't actually lost the cell yet. It's
       * still theirs (see `countOwnedCells`) unless the layer's run finishes by
       * closing a loop or landing a capture; if the layer is cut down first, the
       * cell reverts here instead of following the rest of their wake. See
       * `docs/land-grab/*` for the capture-loop rules this backs.
       */
      capturedFrom?: string;
    };

export function createEmptyGrid(rowCount: number, colCount: number): CellState[][] {
  return Array.from({ length: rowCount }, () =>
    Array.from({ length: colCount }, (): CellState => ({ kind: "neutral" }))
  );
}

function isPlayerBoundary(cell: CellState, playerId: string): boolean {
  return (cell.kind === "trail" || cell.kind === "territory") && cell.playerId === playerId;
}

/**
 * Capture fill for a closed loop.
 *
 * Same base-case-then-recurse shape as `depthFirstSearch(row, col)` in
 * docs/problems/Number-of-Islands.md, but seeded from the grid border instead
 * of a land cell, and "visited" means "reachable open water" instead of "sunk
 * land". Anything the flood can't reach — and that isn't the closing
 * player's own trail/territory — was enclosed by the loop, so it becomes that
 * player's territory. This can swallow an opponent's untouched land if it was
 * fully inside the loop, matching how a capture in this genre can "cut off" a
 * chunk of enemy territory without ever stepping on it.
 */
export function resolveCapture(grid: CellState[][], playerId: string): CellState[][] {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  const reachable: boolean[][] = Array.from({ length: rowCount }, () => new Array(colCount).fill(false));

  // Iterative (explicit stack) so a large board's open water doesn't blow the JS call stack —
  // this can visit tens of thousands of cells on the "large map" board size.
  function floodFromBorder(startRow: number, startCol: number): void {
    const stack: Array<[number, number]> = [[startRow, startCol]];
    while (stack.length > 0) {
      const [row, col] = stack.pop()!;
      // Skip: off the grid, already visited, or the closing player's own boundary
      if (row < 0 || row >= rowCount || col < 0 || col >= colCount) continue;
      if (reachable[row][col] || isPlayerBoundary(grid[row][col], playerId)) continue;
      reachable[row][col] = true;
      stack.push([row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]);
    }
  }

  for (let col = 0; col < colCount; col++) {
    floodFromBorder(0, col);
    floodFromBorder(rowCount - 1, col);
  }
  for (let row = 0; row < rowCount; row++) {
    floodFromBorder(row, 0);
    floodFromBorder(row, colCount - 1);
  }

  return grid.map((rowCells, row) =>
    rowCells.map((cell, col): CellState => {
      if (isPlayerBoundary(cell, playerId)) return { kind: "territory", playerId };
      if (!reachable[row][col]) return { kind: "territory", playerId };
      return cell;
    })
  );
}

export function countOwnedCells(grid: CellState[][], playerId: string): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.kind === "territory" && cell.playerId === playerId) count++;
      // A rival's trail merely crossing this cell hasn't taken it yet — it's
      // still ours until their run closes a loop or lands a capture.
      else if (cell.kind === "trail" && cell.capturedFrom === playerId) count++;
    }
  }
  return count;
}

export function placeBase(grid: CellState[][], center: Vec2, playerId: string, radius = 1): CellState[][] {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  const next = grid.map((row) => row.slice());
  for (let row = center.row - radius; row <= center.row + radius; row++) {
    if (row < 0 || row >= rowCount) continue;
    for (let col = center.col - radius; col <= center.col + radius; col++) {
      if (col < 0 || col >= colCount) continue;
      next[row][col] = { kind: "territory", playerId };
    }
  }
  return next;
}

/** True if every cell in the (2*radius+1)-square centered on `center` is neutral. */
export function isAreaFree(grid: CellState[][], center: Vec2, radius = 1): boolean {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  for (let row = center.row - radius; row <= center.row + radius; row++) {
    if (row < 0 || row >= rowCount) return false;
    for (let col = center.col - radius; col <= center.col + radius; col++) {
      if (col < 0 || col >= colCount) return false;
      if (grid[row][col].kind !== "neutral") return false;
    }
  }
  return true;
}

/** Finds an open square to drop a fresh base, scanning outward from a preferred spot. */
export function findOpenSpawn(grid: CellState[][], preferred: Vec2, radius = 1): Vec2 {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  if (isAreaFree(grid, preferred, radius)) return preferred;

  const maxSearchRadius = Math.max(rowCount, colCount);
  for (let ring = 1; ring <= maxSearchRadius; ring++) {
    for (let dRow = -ring; dRow <= ring; dRow++) {
      for (let dCol = -ring; dCol <= ring; dCol++) {
        if (Math.max(Math.abs(dRow), Math.abs(dCol)) !== ring) continue;
        const candidate: Vec2 = { row: preferred.row + dRow, col: preferred.col + dCol };
        if (candidate.row < 0 || candidate.row >= rowCount || candidate.col < 0 || candidate.col >= colCount) continue;
        if (isAreaFree(grid, candidate, radius)) return candidate;
      }
    }
  }
  // Grid is completely full — fall back to the preferred spot; the caller will overwrite whatever is there.
  return preferred;
}
