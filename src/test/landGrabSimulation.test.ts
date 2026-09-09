import { describe, it, expect } from "vitest";
import { createInitialGameState, setPlayerFacing, stepGame, type PlayerConfig } from "@/features/landGrab/simulation";
import type { CellState } from "@/features/landGrab/grid";
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

  it("running into your own trail closes the loop instead of eliminating you", () => {
    let state = createInitialGameState(7, 7, [HUMAN]);
    // Home base is rows 1-3 / cols 1-3. Trace a trail out of it and back onto
    // an earlier trail cell at (2,4) to pinch the loop shut.
    const path: Direction[] = ["right", "right", "right", "up", "up", "left", "down", "down"];
    for (const direction of path) {
      setPlayerFacing(state, "p1", direction);
      state = stepGame(state);
    }

    const player = state.players.p1;
    expect(player.alive).toBe(true);
    expect(player.respawnAt).toBeNull();
    expect(player.trail).toEqual([]); // loop closed, trail consumed
    expect(player.head).toEqual({ row: 2, col: 4 });
    expect(player.ownedCount).toBe(15); // 9 base + 6 trail cells turned territory
    expect(state.grid[0][5]).toEqual({ kind: "territory", playerId: "p1" });
  });

  it("walking into the board edge holds the player still instead of eliminating them", () => {
    let state = createInitialGameState(5, 5, [HUMAN]);
    // Home lands at (2,2) on a 5x5 board; two steps up reaches the top row (0,2).
    for (let i = 0; i < 5; i++) {
      setPlayerFacing(state, "p1", "up");
      state = stepGame(state);
    }
    expect(state.players.p1.alive).toBe(true);
    expect(state.players.p1.respawnAt).toBeNull();
    expect(state.players.p1.head).toEqual({ row: 0, col: 2 });

    // Steering away from the wall lets them move again.
    setPlayerFacing(state, "p1", "right");
    state = stepGame(state);
    expect(state.players.p1.head).toEqual({ row: 0, col: 3 });
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

describe("stepGame — respawn needs a clear 3x3", () => {
  it("holds a dead player out until an empty 3x3 pocket opens up", () => {
    const bots: PlayerConfig[] = [
      { id: "p1", label: "One", color: 0x38bdf8, isBot: true },
      { id: "p2", label: "Two", color: 0xf87171, isBot: true },
    ];
    let state = createInitialGameState(7, 7, bots);

    // Flood the board with p1 territory (no open 3x3 anywhere) and drop p2 into
    // a dead state whose respawn timer is already due.
    state = {
      ...state,
      grid: state.grid.map((row) => row.map((): typeof row[number] => ({ kind: "territory", playerId: "p1" }))),
      players: {
        ...state.players,
        p2: { ...state.players.p2, alive: false, trail: [], respawnAt: state.tick },
      },
    };

    state = stepGame(state);
    expect(state.players.p2.alive).toBe(false);
    expect(state.players.p2.respawnAt).not.toBeNull();

    // Open a 3x3 pocket in the corner; the next tick can now place the base.
    const opened = state.grid.map((row) => row.slice());
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col <= 2; col++) opened[row][col] = { kind: "neutral" };
    }
    state = { ...state, grid: opened };

    state = stepGame(state);
    expect(state.players.p2.alive).toBe(true);
    expect(state.players.p2.respawnAt).toBeNull();
  });
});

describe("stepGame — a kill that severs plowed-through territory", () => {
  it("reverts the part of a player's land a dead rival's trail had cut off", () => {
    const configs: PlayerConfig[] = [
      { id: "p1", label: "You", color: 0x38bdf8, isBot: false },
      { id: "p2", label: "Rival", color: 0xf87171, isBot: true },
    ];
    let state = createInitialGameState(7, 7, configs);

    // p1 owns a single horizontal strip anchored at its home (3,0); p2 has
    // plowed a vertical trail straight down column 3, overwriting the middle of
    // that strip. Row 3 is now two territory chunks (cols 0-2 and cols 4-6)
    // bridged only by p2's fragile trail cell.
    const grid = state.grid.map((row) => row.map((): CellState => ({ kind: "neutral" })));
    for (let col = 0; col <= 6; col++) {
      if (col !== 3) grid[3][col] = { kind: "territory", playerId: "p1" };
    }
    const rivalTrail = [
      { row: 2, col: 3 },
      { row: 3, col: 3 },
      { row: 4, col: 3 },
    ];
    for (const { row, col } of rivalTrail) grid[row][col] = { kind: "trail", playerId: "p2" };

    state = {
      ...state,
      grid,
      players: {
        ...state.players,
        p1: { ...state.players.p1, home: { row: 3, col: 0 }, head: { row: 3, col: 2 }, trail: [], hasStarted: true },
        p2: { ...state.players.p2, home: { row: 6, col: 6 }, head: { row: 2, col: 3 }, trail: rivalTrail },
      },
    };

    // p1 steps onto p2's trail: p2 is eliminated, its trail wiped to neutral,
    // and the cols 4-6 chunk is now cut off from p1's home.
    setPlayerFacing(state, "p1", "right");
    state = stepGame(state);

    expect(state.players.p2.alive).toBe(false);
    expect(state.grid[3][0]).toEqual({ kind: "territory", playerId: "p1" });
    expect(state.grid[3][2]).toEqual({ kind: "territory", playerId: "p1" });
    expect(state.grid[3][4]).toEqual({ kind: "neutral" });
    expect(state.grid[3][5]).toEqual({ kind: "neutral" });
    expect(state.grid[3][6]).toEqual({ kind: "neutral" });
  });
});

describe("stepGame — autopilot", () => {
  it("drives a non-bot player from tick 1 with no key press", () => {
    const configs: PlayerConfig[] = [{ id: "p1", label: "You", color: 0x38bdf8, isBot: false, autopilot: true }];
    let state = createInitialGameState(9, 9, configs);
    const start = state.players.p1.head;
    expect(state.players.p1.hasStarted).toBe(true);

    state = stepGame(state);
    expect(state.players.p1.head).not.toEqual(start); // moved on its own, no input
  });
});

describe("stepGame — custom rules", () => {
  it("threads respawnDelayTicks through create + step", () => {
    const state = createInitialGameState(7, 7, [HUMAN], { respawnDelayTicks: 3 });
    expect(state.rules.respawnDelayTicks).toBe(3);
    expect(stepGame(state).rules.respawnDelayTicks).toBe(3);
  });

  it("schedules a respawn using respawnDelayTicks, not the default", () => {
    const configs: PlayerConfig[] = [
      { id: "p1", label: "You", color: 0x38bdf8, isBot: false },
      { id: "p2", label: "Rival", color: 0xf87171, isBot: true },
    ];
    let state = createInitialGameState(7, 7, configs, { respawnDelayTicks: 2 });
    const grid = state.grid.map((row) => row.slice());
    grid[0][1] = { kind: "trail", playerId: "p2" };
    state = {
      ...state,
      grid,
      players: {
        ...state.players,
        p1: { ...state.players.p1, head: { row: 0, col: 0 }, home: { row: 0, col: 0 }, trail: [], hasStarted: true },
        p2: { ...state.players.p2, head: { row: 5, col: 5 }, home: { row: 5, col: 5 }, trail: [{ row: 0, col: 1 }] },
      },
    };

    setPlayerFacing(state, "p1", "right");
    const after = stepGame(state); // tick 0 -> 1; p1 steps onto p2's trail

    expect(after.players.p2.alive).toBe(false);
    expect(after.players.p2.respawnAt).toBe(3); // nextTick (1) + respawnDelayTicks (2)
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
