import type { CellState } from "./grid";
import type { CaptureEvent, GameState, PlayerState } from "./simulation";
import { applyCaptureEvents, appendHeadHistory, clearDeadChains, type ChainMap } from "./chainTrail";
import type { Direction, Vec2 } from "./types";

/**
 * An in-memory recording of one match, kept for post-game replay and for
 * debugging the capture / territory-split algorithm.
 *
 * This is deliberately *not* persisted: `gameRecord.ts` owns the small, capped
 * summary that goes to `localStorage`, and a full frame log is far too big for
 * that. A `ReplayLog` only lives as long as the tab that produced it.
 *
 * Frame 0 carries the whole opening grid; every later frame carries only the
 * cells that changed since the frame before it, so a long match on a big board
 * still comes to a few MB at most. `frameGridAt` rebuilds any frame's full grid
 * by replaying the deltas from frame 0 forward.
 */

/** Per-player state captured at the end of one tick — the debugging payload. */
export interface ReplayPlayerFrame {
  head: Vec2;
  /** The direction actually applied this tick. */
  facing: Direction;
  /** Live wake cells, in the order they were laid. */
  trail: Vec2[];
  alive: boolean;
  ownedCount: number;
  /** Tick this player becomes eligible to respawn, or `null` if alive / not waiting. */
  respawnAt: number | null;
}

export interface ReplayCellChange {
  row: number;
  col: number;
  cell: CellState;
}

export interface ReplayFrame {
  tick: number;
  /** Cells that differ from the previous frame. Frame 0 lists every cell. */
  cellChanges: ReplayCellChange[];
  players: Record<string, ReplayPlayerFrame>;
  /** The winner id once the match is decided on this frame, else `null`. */
  winnerId: string | null;
  /** Eliminations on this tick — empty on most frames. Display-only, see `CaptureEvent`. */
  captureEvents: CaptureEvent[];
}

/** Static, once-per-match display info so the replay renderer needs no live state. */
export interface ReplayPlayerMeta {
  label: string;
  /** Packed `0xRRGGBB`, same as `PlayerState.color`. */
  color: number;
  isBot: boolean;
}

export interface ReplayLog {
  rowCount: number;
  colCount: number;
  playerOrder: string[];
  playerMeta: Record<string, ReplayPlayerMeta>;
  frames: ReplayFrame[];
  /** True once `MAX_REPLAY_TICKS` was reached and later ticks were dropped. */
  truncated: boolean;
  /**
   * Running reconstruction of the latest recorded frame's grid, used only while
   * recording to diff the next tick. It is rebuildable from `frames` via
   * `frameGridAt`, so it can be dropped before serialising the log.
   */
  runningGrid: CellState[][];
}

/**
 * Hard ceiling on recorded ticks. A match almost always ends well before this;
 * the cap only guards a runaway game (or a huge full-screen board) from growing
 * the log without bound. Past it, recording simply stops — earlier frames are
 * kept, never overwritten, so the frame where something first went wrong
 * survives.
 */
export const MAX_REPLAY_TICKS = 3000;

function cloneCell(cell: CellState): CellState {
  return cell.kind === "neutral"
    ? { kind: "neutral" }
    : { kind: cell.kind, playerId: cell.playerId };
}

function sameCell(a: CellState, b: CellState): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind !== "neutral" && b.kind !== "neutral") return a.playerId === b.playerId;
  return true;
}

function playerFrame(player: PlayerState): ReplayPlayerFrame {
  return {
    head: { ...player.head },
    facing: player.facing,
    trail: player.trail.map((cell) => ({ ...cell })),
    alive: player.alive,
    ownedCount: player.ownedCount,
    respawnAt: player.respawnAt,
  };
}

function playersFrame(state: GameState): Record<string, ReplayPlayerFrame> {
  const out: Record<string, ReplayPlayerFrame> = {};
  for (const id of state.playerOrder) {
    const player = state.players[id];
    if (player) out[id] = playerFrame(player);
  }
  return out;
}

/** Start a fresh log from the opening state and record frame 0 (the whole grid). */
export function createReplayLog(state: GameState): ReplayLog {
  const runningGrid = state.grid.map((row) => row.map(cloneCell));
  const cellChanges: ReplayCellChange[] = [];
  for (let row = 0; row < state.rowCount; row++) {
    for (let col = 0; col < state.colCount; col++) {
      cellChanges.push({ row, col, cell: cloneCell(state.grid[row][col]) });
    }
  }

  const playerMeta: Record<string, ReplayPlayerMeta> = {};
  for (const id of state.playerOrder) {
    const player = state.players[id];
    if (player) {
      playerMeta[id] = { label: player.label, color: player.color, isBot: player.isBot };
    }
  }

  return {
    rowCount: state.rowCount,
    colCount: state.colCount,
    playerOrder: [...state.playerOrder],
    playerMeta,
    frames: [
      {
        tick: state.tick,
        cellChanges,
        players: playersFrame(state),
        winnerId: state.winnerId,
        captureEvents: [], // no captures on the opening frame
      },
    ],
    truncated: false,
    runningGrid,
  };
}

/**
 * Append one post-tick frame. A no-op once the log is `truncated`, or when the
 * incoming state isn't newer than the last frame (guards a double call for the
 * same tick — e.g. the frozen state re-delivered every tick after game over).
 */
export function recordFrame(log: ReplayLog, state: GameState): void {
  if (log.truncated) return;

  const lastFrame = log.frames[log.frames.length - 1];
  if (state.tick <= lastFrame.tick) return;

  if (log.frames.length >= MAX_REPLAY_TICKS) {
    log.truncated = true;
    return;
  }

  const cellChanges: ReplayCellChange[] = [];
  for (let row = 0; row < log.rowCount; row++) {
    for (let col = 0; col < log.colCount; col++) {
      const next = state.grid[row][col];
      if (!sameCell(next, log.runningGrid[row][col])) {
        const clone = cloneCell(next);
        cellChanges.push({ row, col, cell: clone });
        log.runningGrid[row][col] = clone;
      }
    }
  }

  log.frames.push({
    tick: state.tick,
    cellChanges,
    players: playersFrame(state),
    winnerId: state.winnerId,
    captureEvents: state.captureEvents,
  });
}

/** Rebuild the full grid shown at frame `index` (clamped into range). */
export function frameGridAt(log: ReplayLog, index: number): CellState[][] {
  const target = Math.max(0, Math.min(index, log.frames.length - 1));
  const grid: CellState[][] = Array.from({ length: log.rowCount }, () =>
    Array.from({ length: log.colCount }, (): CellState => ({ kind: "neutral" })),
  );
  for (let i = 0; i <= target; i++) {
    for (const change of log.frames[i].cellChanges) {
      grid[change.row][change.col] = cloneCell(change.cell);
    }
  }
  return grid;
}

/**
 * Rebuild the captured-avatar chain map as of frame `index` (clamped into
 * range) by replaying every frame's `captureEvents` from frame 0 forward —
 * mirrors `frameGridAt`. Display-only, same as the live game's chain.
 */
export function frameChainsAt(log: ReplayLog, index: number): ChainMap {
  const target = Math.max(0, Math.min(index, log.frames.length - 1));
  let chains: ChainMap = {};
  for (let i = 0; i <= target; i++) {
    const frame = log.frames[i];
    chains = applyCaptureEvents(chains, frame.captureEvents);
    const aliveIds = new Set(Object.keys(frame.players).filter((id) => frame.players[id].alive));
    chains = clearDeadChains(chains, aliveIds);
  }
  return chains;
}

/**
 * Rebuild each player's head-position history from frame 0 through `index`
 * (clamped into range) — the path `chainPositions` places trailing avatars
 * along. Mirrors the live game's per-tick `appendHeadHistory` calls, reset
 * whenever a player is dead on a frame.
 */
export function frameHeadHistoryAt(log: ReplayLog, index: number): Record<string, Vec2[]> {
  const target = Math.max(0, Math.min(index, log.frames.length - 1));
  const history: Record<string, Vec2[]> = {};
  for (let i = 0; i <= target; i++) {
    const frame = log.frames[i];
    for (const id of log.playerOrder) {
      const player = frame.players[id];
      if (!player) continue;
      if (!player.alive) {
        history[id] = [];
        continue;
      }
      history[id] = appendHeadHistory(history[id] ?? [], player.head);
    }
  }
  return history;
}
