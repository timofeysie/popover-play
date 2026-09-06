import { describe, it, expect } from "vitest";
import { createEmptyGrid, type CellState } from "@/features/landGrab/grid";
import { resolveTerritorySplit } from "@/features/landGrab/splitResolution";

function territory(playerId: string): CellState {
  return { kind: "territory", playerId };
}

describe("resolveTerritorySplit (numIslands-style cut resolution)", () => {
  it("strips a component disconnected from home, keeping the home component intact", () => {
    const grid = createEmptyGrid(7, 7);
    // Home blob, connected component containing (0,0)
    grid[0][0] = territory("p1");
    grid[0][1] = territory("p1");
    // A separate, disconnected blob elsewhere on the board
    grid[5][5] = territory("p1");
    grid[5][6] = territory("p1");

    const next = resolveTerritorySplit(grid, "p1", { row: 0, col: 0 });

    expect(next[0][0]).toEqual(territory("p1"));
    expect(next[0][1]).toEqual(territory("p1"));
    expect(next[5][5]).toEqual({ kind: "neutral" });
    expect(next[5][6]).toEqual({ kind: "neutral" });
  });

  it("is a no-op when all owned cells are already one connected component", () => {
    const grid = createEmptyGrid(5, 5);
    grid[2][2] = territory("p1");
    grid[2][3] = territory("p1");
    grid[3][3] = territory("p1");

    const next = resolveTerritorySplit(grid, "p1", { row: 2, col: 2 });

    expect(next).toBe(grid); // same reference: nothing to drop, so no copy is made
  });

  it("leaves everything alone if the home cell itself is no longer owned", () => {
    const grid = createEmptyGrid(5, 5);
    // p1's home cell was fully swallowed by someone else's capture; only a stray fragment remains
    grid[4][4] = territory("p1");

    const next = resolveTerritorySplit(grid, "p1", { row: 0, col: 0 });

    expect(next[4][4]).toEqual(territory("p1"));
  });

  it("does not touch other players' cells even while stripping p1's disconnected fragment", () => {
    const grid = createEmptyGrid(5, 5);
    grid[0][0] = territory("p1");
    grid[4][4] = territory("p1"); // disconnected fragment, should be stripped
    grid[4][3] = territory("p2"); // untouched, belongs to someone else entirely

    const next = resolveTerritorySplit(grid, "p1", { row: 0, col: 0 });

    expect(next[4][4]).toEqual({ kind: "neutral" });
    expect(next[4][3]).toEqual(territory("p2"));
  });
});
