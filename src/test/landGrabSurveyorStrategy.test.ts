import { describe, it, expect } from "vitest";
import {
  BOT_STRATEGIES,
  createBotMemory,
  strategyFor,
} from "@/features/landGrab/botStrategy";
import {
  createSurveyorMemory,
  estimateEnclosedArea,
  isFrontierAdjacent,
  nearestOwnedDistance,
  nearestRivalHeadDistance,
  surveyor,
} from "@/features/landGrab/surveyorStrategy";
import { SURVEYOR_PROFILE_FIELDS } from "@/features/landGrab/botProfile";
import { createEmptyGrid, type CellState } from "@/features/landGrab/grid";
import {
  createInitialGameState,
  stepGame,
  type PlayerConfig,
} from "@/features/landGrab/simulation";

function gridWith(rows: number, cols: number, cells: Record<string, CellState>): CellState[][] {
  const grid = createEmptyGrid(rows, cols);
  for (const [rc, cell] of Object.entries(cells)) {
    const [r, c] = rc.split(",").map(Number);
    grid[r][c] = cell;
  }
  return grid;
}

describe("nearestOwnedDistance", () => {
  const grid = gridWith(6, 6, {
    "2,2": { kind: "territory", playerId: "p1" },
    "0,5": { kind: "territory", playerId: "p2" },
  });

  it("is 0 on an owned cell", () => {
    expect(nearestOwnedDistance(grid, "p1", { row: 2, col: 2 })).toBe(0);
  });

  it("counts 4-connected steps out to the nearest owned cell", () => {
    expect(nearestOwnedDistance(grid, "p1", { row: 2, col: 3 })).toBe(1);
    expect(nearestOwnedDistance(grid, "p1", { row: 4, col: 2 })).toBe(2);
    expect(nearestOwnedDistance(grid, "p1", { row: 0, col: 0 })).toBe(4);
  });

  it("ignores other players' territory", () => {
    expect(nearestOwnedDistance(grid, "p1", { row: 0, col: 5 })).toBe(5); // routes to p1's cell, not p2's
  });

  it("returns Infinity past the radius cap or off the board", () => {
    expect(nearestOwnedDistance(grid, "p1", { row: 0, col: 0 }, 3)).toBe(Infinity);
    expect(nearestOwnedDistance(grid, "p1", { row: -1, col: 0 })).toBe(Infinity);
    expect(nearestOwnedDistance(grid, "nobody", { row: 0, col: 0 })).toBe(Infinity);
  });
});

describe("isFrontierAdjacent", () => {
  const grid = gridWith(6, 6, {
    "2,2": { kind: "territory", playerId: "p1" },
    "4,4": { kind: "territory", playerId: "p2" },
    "0,0": { kind: "trail", playerId: "p1" },
  });

  it("is true for neutral water touching our own territory", () => {
    expect(isFrontierAdjacent(grid, "p1", { row: 2, col: 3 })).toBe(true);
    expect(isFrontierAdjacent(grid, "p1", { row: 1, col: 2 })).toBe(true);
  });

  it("is false in open water", () => {
    expect(isFrontierAdjacent(grid, "p1", { row: 0, col: 3 })).toBe(false);
  });

  it("is false when only a rival's territory is adjacent", () => {
    expect(isFrontierAdjacent(grid, "p1", { row: 4, col: 3 })).toBe(false);
  });

  it("is false for a non-neutral cell", () => {
    expect(isFrontierAdjacent(grid, "p1", { row: 2, col: 2 })).toBe(false); // our territory
    expect(isFrontierAdjacent(grid, "p1", { row: 0, col: 0 })).toBe(false); // our trail
  });
});

describe("estimateEnclosedArea", () => {
  it("is 1 for an empty wake", () => {
    expect(estimateEnclosedArea([], { row: 3, col: 3 })).toBe(1);
  });

  it("is the bounding-box area spanned by the wake plus the head", () => {
    const trail = [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 2, col: 3 },
    ];
    // rows 1..3, cols 1..3 → 3 x 3
    expect(estimateEnclosedArea(trail, { row: 3, col: 3 })).toBe(9);
  });
});

describe("nearestRivalHeadDistance", () => {
  it("is the Manhattan distance to the closest living rival head", () => {
    const state = createInitialGameState(12, 12, [
      { id: "a", label: "A", color: 1, isBot: true, botType: "surveyor" },
      { id: "b", label: "B", color: 2, isBot: true },
      { id: "c", label: "C", color: 3, isBot: true },
    ]);
    state.players.a.head = { row: 0, col: 0 };
    state.players.b.head = { row: 0, col: 3 };
    state.players.c.head = { row: 5, col: 5 };
    expect(nearestRivalHeadDistance(state, state.players.a)).toBe(3);
  });

  it("skips dead rivals and returns Infinity when alone", () => {
    const state = createInitialGameState(12, 12, [
      { id: "a", label: "A", color: 1, isBot: true, botType: "surveyor" },
      { id: "b", label: "B", color: 2, isBot: true },
    ]);
    state.players.a.head = { row: 0, col: 0 };
    state.players.b.head = { row: 0, col: 2 };
    expect(nearestRivalHeadDistance(state, state.players.a)).toBe(2);
    state.players.b.alive = false;
    expect(nearestRivalHeadDistance(state, state.players.a)).toBe(Infinity);
  });
});

describe("surveyor registry wiring", () => {
  it("is registered under its type with a human-readable label", () => {
    expect(BOT_STRATEGIES.surveyor).toBe(surveyor);
    expect(surveyor.type).toBe("surveyor");
    expect(surveyor.label).toBe("Surveyor");
    expect(strategyFor("surveyor")).toBe(surveyor);
  });

  it("renders its own field subset — the four knobs, minus the rambler's homesick length", () => {
    expect(surveyor.fields).toBe(SURVEYOR_PROFILE_FIELDS);
    const keys = surveyor.fields.map((f) => f.key);
    expect(keys).toEqual(
      expect.arrayContaining(["maxTrailExposure", "targetTrailLength", "frontierHugBonus", "rivalAvoidRadius"]),
    );
    expect(keys).not.toContain("homesickTrailLength");
  });

  it("createBotMemory returns a fresh, tagged surveyor bag", () => {
    expect(createBotMemory("surveyor")).toEqual({ type: "surveyor", phase: "extend", hugSide: null });
    expect(createSurveyorMemory()).not.toBe(createSurveyorMemory());
  });
});

describe("surveyor through the simulation", () => {
  it("stamps the botType and a surveyor memory bag onto the player", () => {
    const state = createInitialGameState(14, 14, [
      { id: "you", label: "You", color: 1, isBot: false },
      { id: "bot", label: "Bot", color: 2, isBot: true, botType: "surveyor" },
    ]);
    expect(state.players.bot.botType).toBe("surveyor");
    expect(state.players.bot.botMemory).toEqual({ type: "surveyor", phase: "extend", hugSide: null });
  });

  it("drives the bot each tick, keeps it alive, and grows its territory", () => {
    const configs: PlayerConfig[] = [
      { id: "surv", label: "Surveyor", color: 1, isBot: true, botType: "surveyor" },
      { id: "roam", label: "Rambler", color: 2, isBot: true, botType: "rambler" },
    ];
    let state = createInitialGameState(16, 16, configs, { respawnDelayTicks: 4 });
    const startOwned = state.players.surv.ownedCount;
    const seenHeads = new Set<string>();

    for (let i = 0; i < 300 && !state.winnerId; i++) {
      state = stepGame(state);
      seenHeads.add(`${state.players.surv.head.row},${state.players.surv.head.col}`);
    }

    expect(seenHeads.size).toBeGreaterThan(8); // moved around on its own
    expect(state.players.surv.ownedCount).toBeGreaterThan(startOwned); // closed at least one loop
    expect(["extend", "return"]).toContain(
      (state.players.surv.botMemory as { phase: string }).phase,
    );
    for (const p of Object.values(state.players)) {
      expect(Number.isFinite(p.ownedCount)).toBe(true);
    }
  });

  it("never freezes a boxed-in surveyor — the return-leg fallback always makes progress", () => {
    // Tiny board, tight exposure: the surveyor cannot reach a 14-long wake, so it
    // must fall back to a homesick beeline rather than wiggle forever.
    const state0 = createInitialGameState(9, 9, [
      { id: "surv", label: "Surveyor", color: 1, isBot: true, botType: "surveyor" },
    ]);
    let state = state0;
    const seenHeads = new Set<string>();
    for (let i = 0; i < 120 && !state.winnerId; i++) {
      state = stepGame(state);
      seenHeads.add(`${state.players.surv.head.row},${state.players.surv.head.col}`);
    }
    // A frozen bot would revisit the same 1–2 cells; a progressing one roams.
    expect(seenHeads.size).toBeGreaterThan(6);
  });
});
