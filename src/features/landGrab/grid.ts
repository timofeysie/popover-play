import type { Vec2 } from "./types";

export type CellState =
  | { kind: "neutral" }
  | { kind: "territory"; playerId: string }
  | { kind: "trail"; playerId: string };

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

  function floodFromBorder(row: number, col: number): void {
    // Base case: off the grid, already visited, or the closing player's own boundary
    if (row < 0 || row >= rowCount || col < 0 || col >= colCount) return;
    if (reachable[row][col] || isPlayerBoundary(grid[row][col], playerId)) return;
    reachable[row][col] = true;
    floodFromBorder(row - 1, col);
    floodFromBorder(row + 1, col);
    floodFromBorder(row, col - 1);
    floodFromBorder(row, col + 1);
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
