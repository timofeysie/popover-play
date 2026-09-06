import type { CellState } from "./grid";
import type { Vec2 } from "./types";

/**
 * Split/cut resolution: the `numIslands` scan from
 * docs/problems/Number-of-Islands.md, restricted to one player's owned
 * cells. When an opponent's capture loop swallows the middle of this
 * player's territory, what's left can fall into more than one connected
 * component — same "scan every cell, DFS-sink each new component you find"
 * outer loop as the doc's `numIslands`, just counting this player's land
 * instead of every `'1'`.
 *
 * The component containing `home` is kept; every other component is
 * something the capture cut off from the player's base, and reverts to
 * neutral ground (fair game for anyone to claim).
 */
export function resolveTerritorySplit(grid: CellState[][], playerId: string, home: Vec2): CellState[][] {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  const visited: boolean[][] = Array.from({ length: rowCount }, () => new Array(colCount).fill(false));

  function isOwned(row: number, col: number): boolean {
    if (row < 0 || row >= rowCount || col < 0 || col >= colCount) return false;
    const cell = grid[row][col];
    return cell.kind === "territory" && cell.playerId === playerId;
  }

  function collectComponent(startRow: number, startCol: number): Vec2[] {
    const component: Vec2[] = [];
    const stack: Vec2[] = [{ row: startRow, col: startCol }];
    while (stack.length > 0) {
      const { row, col } = stack.pop()!;
      // Base case: out of bounds, already visited, or not this player's land
      if (row < 0 || row >= rowCount || col < 0 || col >= colCount) continue;
      if (visited[row][col] || !isOwned(row, col)) continue;
      visited[row][col] = true;
      component.push({ row, col });
      stack.push({ row: row - 1, col }, { row: row + 1, col }, { row, col: col - 1 }, { row, col: col + 1 });
    }
    return component;
  }

  const componentsToDrop: Vec2[][] = [];
  let foundHomeComponent = false;

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      if (!isOwned(row, col) || visited[row][col]) continue;
      const component = collectComponent(row, col);
      const containsHome = component.some((cell) => cell.row === home.row && cell.col === home.col);
      if (containsHome) {
        foundHomeComponent = true;
      } else {
        componentsToDrop.push(component);
      }
    }
  }

  if (!foundHomeComponent || componentsToDrop.length === 0) return grid;

  const next = grid.map((row) => row.slice());
  for (const component of componentsToDrop) {
    for (const { row, col } of component) {
      next[row][col] = { kind: "neutral" };
    }
  }
  return next;
}
