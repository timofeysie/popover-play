import { describe, it, expect } from "vitest";
import {
  createReplayLog,
  recordFrame,
  frameGridAt,
  MAX_REPLAY_TICKS,
  type ReplayLog,
} from "@/features/landGrab/replayLog";
import {
  createInitialGameState,
  setPlayerFacing,
  stepGame,
  type GameState,
  type PlayerConfig,
} from "@/features/landGrab/simulation";
import type { Direction } from "@/features/landGrab/types";

const HUMAN: PlayerConfig = { id: "p1", label: "You", color: 0x38bdf8, isBot: false };

/** A deterministic single-player run: no bots, so no `Math.random` jitter. */
function runPath(path: Direction[]): { states: GameState[]; log: ReplayLog } {
  let state = createInitialGameState(7, 7, [HUMAN]);
  const log = createReplayLog(state);
  const states: GameState[] = [state];
  for (const direction of path) {
    setPlayerFacing(state, "p1", direction);
    state = stepGame(state);
    recordFrame(log, state);
    states.push(state);
  }
  return { states, log };
}

describe("createReplayLog", () => {
  it("records frame 0 with the full opening grid and player meta", () => {
    const state = createInitialGameState(7, 7, [HUMAN]);
    const log = createReplayLog(state);

    expect(log.rowCount).toBe(7);
    expect(log.colCount).toBe(7);
    expect(log.playerOrder).toEqual(["p1"]);
    expect(log.playerMeta.p1).toEqual({ label: "You", color: 0x38bdf8, isBot: false });
    expect(log.frames).toHaveLength(1);
    expect(log.frames[0].tick).toBe(0);
    expect(log.frames[0].cellChanges).toHaveLength(49); // every cell on frame 0
    expect(log.frames[0].winnerId).toBeNull();
    expect(frameGridAt(log, 0)).toEqual(state.grid);
  });
});

describe("recordFrame", () => {
  it("appends one frame per tick, each a delta rather than the whole board", () => {
    // Leave home territory so trail cells actually get laid.
    const path: Direction[] = ["up", "up", "up", "right", "right", "right"];
    const { log } = runPath(path);

    expect(log.frames).toHaveLength(path.length + 1);
    // Only frame 0 lists every cell; later frames stay small (a move outside
    // owned land flips one cell to trail — a move within it flips none).
    for (const frame of log.frames.slice(1)) {
      expect(frame.cellChanges.length).toBeLessThan(49);
    }
    // ...and the run as a whole does record changes.
    const totalChanges = log.frames.slice(1).reduce((n, f) => n + f.cellChanges.length, 0);
    expect(totalChanges).toBeGreaterThan(0);
  });

  it("reconstructs the exact live grid at every recorded frame", () => {
    // Trace a loop that pinches off a pocket and closes back onto home territory.
    const path: Direction[] = [
      "up", "up", "right", "right", "right",
      "down", "down", "down", "left", "left",
    ];
    const { states, log } = runPath(path);

    for (let i = 0; i < log.frames.length; i++) {
      expect(frameGridAt(log, i)).toEqual(states[i].grid);
    }
  });

  it("captures per-player head, facing, trail and ownedCount", () => {
    const { states, log } = runPath(["up", "up", "right"]);
    const last = log.frames[log.frames.length - 1];
    const player = states[states.length - 1].players.p1;

    expect(last.players.p1.head).toEqual(player.head);
    expect(last.players.p1.facing).toBe(player.facing);
    expect(last.players.p1.trail).toEqual(player.trail);
    expect(last.players.p1.ownedCount).toBe(player.ownedCount);
    expect(last.players.p1.alive).toBe(true);
  });

  it("ignores a repeated call for a tick already recorded", () => {
    const state = createInitialGameState(7, 7, [HUMAN]);
    const log = createReplayLog(state);

    setPlayerFacing(state, "p1", "up");
    const next = stepGame(state);
    recordFrame(log, next);
    recordFrame(log, next); // same tick again — frozen-state re-delivery

    expect(log.frames).toHaveLength(2);
  });

  it("stops recording at MAX_REPLAY_TICKS instead of overwriting", () => {
    const base = createInitialGameState(3, 3, [HUMAN]);
    const log = createReplayLog(base);

    for (let tick = 1; tick <= MAX_REPLAY_TICKS + 50; tick++) {
      recordFrame(log, { ...base, tick, grid: base.grid });
    }

    expect(log.truncated).toBe(true);
    expect(log.frames).toHaveLength(MAX_REPLAY_TICKS);
    expect(log.frames[log.frames.length - 1].tick).toBe(MAX_REPLAY_TICKS - 1);
  });
});

describe("frameGridAt", () => {
  it("clamps an out-of-range index into the recorded frames", () => {
    const { states, log } = runPath(["up", "up"]);
    expect(frameGridAt(log, -5)).toEqual(states[0].grid);
    expect(frameGridAt(log, 999)).toEqual(states[states.length - 1].grid);
  });
});
