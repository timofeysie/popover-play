import { describe, it, expect } from "vitest";
import { createInitialGameState, setPlayerFacing, stepGame, type PlayerConfig } from "@/features/landGrab/simulation";
import type { Direction } from "@/features/landGrab/types";

const HUMAN: PlayerConfig = { id: "p1", label: "You", color: 0x38bdf8, isBot: false };

describe("createInitialGameState", () => {
  it("places a 3x3 base per player and counts it", () => {
    const state = createInitialGameState(7, 7, [HUMAN]);
    expect(state.players.p1.ownedCount).toBe(9);
    expect(state.players.p1.home).toEqual({ row: 2, col: 2 });
    expect(state.players.p1.alive).toBe(true);
  });
});

describe("stepGame — a full capture loop", () => {
  it("walking a loop back into home territory converts the trail plus the enclosed pocket", () => {
    let state = createInitialGameState(7, 7, [HUMAN]);
    expect(state.players.p1.ownedCount).toBe(9);

    // From home (2,2): exit the base, trace a loop that pinches off a 2-cell
    // pocket at (1,4)/(2,4), then re-enter home territory at (3,3) to close it.
    const path: Direction[] = ["up", "up", "right", "right", "right", "down", "down", "down", "left", "left"];
    for (const direction of path) {
      setPlayerFacing(state, "p1", direction);
      state = stepGame(state);
    }

    const player = state.players.p1;
    expect(player.trail).toEqual([]); // loop closed, trail consumed
    expect(player.head).toEqual({ row: 3, col: 3 });
    expect(player.ownedCount).toBe(19); // 9 base + 8 trail cells + 2 enclosed cells
    expect(state.grid[1][4]).toEqual({ kind: "territory", playerId: "p1" });
    expect(state.grid[2][4]).toEqual({ kind: "territory", playerId: "p1" });
  });

  it("walking off the grid eliminates the player and schedules a respawn", () => {
    let state = createInitialGameState(5, 5, [HUMAN]);
    // Home lands at (2,2) on a 5x5 board; three steps up reaches row -1.
    for (let i = 0; i < 3; i++) {
      setPlayerFacing(state, "p1", "up");
      state = stepGame(state);
    }
    expect(state.players.p1.alive).toBe(false);
    expect(state.players.p1.respawnAt).not.toBeNull();
  });
});

describe("stepGame — human start gate", () => {
  it("does not move a human player until they press a direction", () => {
    let state = createInitialGameState(7, 7, [HUMAN]);
    const home = state.players.p1.home;
    for (let i = 0; i < 10; i++) {
      state = stepGame(state);
    }
    expect(state.players.p1.head).toEqual(home);
    expect(state.players.p1.alive).toBe(true);
  });

  it("starts moving as soon as a direction is set", () => {
    let state = createInitialGameState(7, 7, [HUMAN]);
    setPlayerFacing(state, "p1", "right");
    state = stepGame(state);
    expect(state.players.p1.head).toEqual({ row: 2, col: 3 });
  });
});

describe("stepGame — bots", () => {
  it("runs many ticks with only bots on a small board without throwing", () => {
    const bots: PlayerConfig[] = [
      { id: "bot1", label: "Bot 1", color: 0xf87171, isBot: true },
      { id: "bot2", label: "Bot 2", color: 0xfacc15, isBot: true },
    ];
    let state = createInitialGameState(12, 12, bots);
    for (let i = 0; i < 150; i++) {
      state = stepGame(state);
    }
    for (const player of Object.values(state.players)) {
      expect(player.ownedCount).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(player.ownedCount)).toBe(true);
    }
  });
});
