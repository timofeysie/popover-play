import { TICK_MS, type GameRules, type GameState } from "./simulation";
import type { BotProfile } from "./botProfile";

/**
 * A finished match, frozen into a plain JSON-serialisable object. There's no
 * backend yet, so `saveGameRecord` just appends this to a capped list in
 * `localStorage`; swapping in a real API later only means replacing the two
 * storage helpers.
 */
export interface LandGrabGameRecord {
  /** Bump if the shape below changes so old rows can be filtered out on read. */
  schemaVersion: 1;
  /** ISO-8601, when the match was recorded. */
  endedAt: string;
  winner: LandGrabPlayerRecord;
  players: LandGrabPlayerRecord[];
  /** Ticks elapsed from the initial board to the deciding move. */
  ticks: number;
  /** `ticks * TICK_MS` — simulated match length, not wall-clock time. */
  durationMs: number;
  board: { rows: number; cols: number; totalCells: number };
  rules: GameRules;
}

export interface LandGrabPlayerRecord {
  id: string;
  label: string;
  /** `#rrggbb`. */
  color: string;
  isBot: boolean;
  autopilot: boolean;
  ownedCount: number;
  /** Share of the board this player held at the end, 0..1. */
  ownedFraction: number;
  /** Rival trails this player cut (each seizing that player's land). */
  captures: number;
  alive: boolean;
  /** The decision parameters this player was running when the match ended. */
  profile: BotProfile;
}

export const GAME_RECORDS_STORAGE_KEY = "landgrab:game-records";
export const MAX_STORED_GAME_RECORDS = 50;

function hexColor(color: number): string {
  return `#${(color & 0xffffff).toString(16).padStart(6, "0")}`;
}

function toPlayerRecord(
  player: GameState["players"][string],
  totalCells: number,
): LandGrabPlayerRecord {
  return {
    id: player.id,
    label: player.label,
    color: hexColor(player.color),
    isBot: player.isBot,
    autopilot: player.autopilot,
    ownedCount: player.ownedCount,
    ownedFraction: totalCells > 0 ? player.ownedCount / totalCells : 0,
    captures: player.captures,
    alive: player.alive,
    profile: { ...player.profile },
  };
}

/**
 * Turn a decided `GameState` (its `winnerId` set) into a storable record.
 * Throws if the match isn't actually over, so callers can't record a draw.
 */
export function buildGameRecord(state: GameState, endedAt: Date = new Date()): LandGrabGameRecord {
  const winner = state.winnerId ? state.players[state.winnerId] : undefined;
  if (!winner) throw new Error("buildGameRecord: game state has no winner yet");

  const totalCells = state.rowCount * state.colCount;
  const players = state.playerOrder
    .map((id) => state.players[id])
    .filter(Boolean)
    .map((player) => toPlayerRecord(player, totalCells));

  return {
    schemaVersion: 1,
    endedAt: endedAt.toISOString(),
    winner: toPlayerRecord(winner, totalCells),
    players,
    ticks: state.tick,
    durationMs: state.tick * TICK_MS,
    board: { rows: state.rowCount, cols: state.colCount, totalCells },
    rules: { ...state.rules },
  };
}

/** All stored records, newest first. Returns `[]` if storage is unavailable or corrupt. */
export function loadGameRecords(): LandGrabGameRecord[] {
  try {
    const raw = window.localStorage.getItem(GAME_RECORDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is LandGrabGameRecord => row?.schemaVersion === 1);
  } catch {
    return [];
  }
}

/** Prepend `record` to the stored list, cap it, and persist. Silently no-ops if storage is unavailable. */
export function saveGameRecord(record: LandGrabGameRecord): LandGrabGameRecord[] {
  const next = [record, ...loadGameRecords()].slice(0, MAX_STORED_GAME_RECORDS);
  try {
    window.localStorage.setItem(GAME_RECORDS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private-mode / quota / no-DOM — the match still ends, it just isn't logged.
  }
  return next;
}

/** Drop every stored record. Silently no-ops if storage is unavailable. */
export function clearGameRecords(): void {
  try {
    window.localStorage.removeItem(GAME_RECORDS_STORAGE_KEY);
  } catch {
    // Private-mode / no-DOM — nothing to clear.
  }
}
