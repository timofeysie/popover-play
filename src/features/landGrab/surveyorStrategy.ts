import { DEFAULT_BOT_PROFILE, SURVEYOR_PROFILE_FIELDS } from "./botProfile";
import { ALL_DIRECTIONS, DELTA, OPPOSITE } from "./geometry";
import type { CellState } from "./grid";
import type { BotStrategy } from "./botStrategy";
import type { GameState, PlayerState } from "./simulation";
import type { Direction, Vec2 } from "./types";

/**
 * The Surveyor — Phase 3 of the rollout in `docs/land-grab/bots.md`.
 *
 * A deliberate territory farmer, in contrast to the Rambler's greedy roaming. It
 * grows one contiguous blob outward from home by repeatedly closing the largest
 * loop it can safely close *right now*, keeping its wake short and hugging the
 * frontier of its own land so it's rarely cuttable.
 *
 * Still a greedy one-cell lookahead — the only extra state is a two-value
 * objective in `botMemory` (`phase` + `hugSide`). This file imports only *types*
 * from `botStrategy.ts` / `simulation.ts`, so there's no runtime cycle.
 */
export interface SurveyorMemory {
  type: "surveyor";
  /** `"extend"` lays a wake along the frontier; `"return"` beelines home to bank it. */
  phase: "extend" | "return";
  /** Which way owned land lies from the head — the direction to curl so the loop stays chunky. */
  hugSide: Direction | null;
}

/** A fresh Surveyor scratch bag; called on spawn and every respawn. */
export function createSurveyorMemory(): SurveyorMemory {
  return { type: "surveyor", phase: "extend", hugSide: null };
}

/** Tiny nudge toward `hugSide` so the extend leg curls rather than drawing a straight tendril. */
const CURL_BONUS = 0.5;

function inBounds(rowCount: number, colCount: number, cell: Vec2): boolean {
  return cell.row >= 0 && cell.row < rowCount && cell.col >= 0 && cell.col < colCount;
}

function isOwned(grid: CellState[][], playerId: string, cell: Vec2): boolean {
  const g = grid[cell.row]?.[cell.col];
  return !!g && g.kind === "territory" && g.playerId === playerId;
}

/**
 * 4-connected step distance from `cell` to the nearest cell `playerId` owns as
 * territory. Bounded: gives up after `maxRadius` rings and returns `Infinity`.
 * `cell` itself is distance 0 when it's already owned.
 */
export function nearestOwnedDistance(
  grid: CellState[][],
  playerId: string,
  cell: Vec2,
  maxRadius = 16,
): number {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  if (!inBounds(rowCount, colCount, cell)) return Infinity;
  if (isOwned(grid, playerId, cell)) return 0;

  const seen = new Set<string>([`${cell.row},${cell.col}`]);
  let frontier: Vec2[] = [cell];
  for (let dist = 1; dist <= maxRadius; dist++) {
    const next: Vec2[] = [];
    for (const cur of frontier) {
      for (const dir of ALL_DIRECTIONS) {
        const n = { row: cur.row + DELTA[dir].row, col: cur.col + DELTA[dir].col };
        if (!inBounds(rowCount, colCount, n)) continue;
        const key = `${n.row},${n.col}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (isOwned(grid, playerId, n)) return dist;
        next.push(n);
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }
  return Infinity;
}

/** True when `cell` is neutral water 4-adjacent to a cell `playerId` owns as territory. */
export function isFrontierAdjacent(grid: CellState[][], playerId: string, cell: Vec2): boolean {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  if (!inBounds(rowCount, colCount, cell)) return false;
  if (grid[cell.row][cell.col].kind !== "neutral") return false;
  for (const dir of ALL_DIRECTIONS) {
    const n = { row: cell.row + DELTA[dir].row, col: cell.col + DELTA[dir].col };
    if (inBounds(rowCount, colCount, n) && isOwned(grid, playerId, n)) return true;
  }
  return false;
}

/**
 * Rough size of the region a loop closed right now would enclose: the
 * bounding-box area spanned by the current wake plus the head. Used only for the
 * "is this loop worth closing yet" decision — the real fill is `resolveCapture`.
 */
export function estimateEnclosedArea(trail: Vec2[], head: Vec2): number {
  let minRow = head.row;
  let maxRow = head.row;
  let minCol = head.col;
  let maxCol = head.col;
  for (const c of trail) {
    if (c.row < minRow) minRow = c.row;
    if (c.row > maxRow) maxRow = c.row;
    if (c.col < minCol) minCol = c.col;
    if (c.col > maxCol) maxCol = c.col;
  }
  return (maxRow - minRow + 1) * (maxCol - minCol + 1);
}

/** Manhattan distance from `player`'s head to the nearest other living player's head; `Infinity` if alone. */
export function nearestRivalHeadDistance(state: GameState, player: PlayerState): number {
  let best = Infinity;
  for (const id of state.playerOrder) {
    if (id === player.id) continue;
    const rival = state.players[id];
    if (!rival || !rival.alive) continue;
    const d = Math.abs(rival.head.row - player.head.row) + Math.abs(rival.head.col - player.head.col);
    if (d < best) best = d;
  }
  return best;
}

function isAdjacentToRivalHead(state: GameState, player: PlayerState, cell: Vec2): boolean {
  for (const id of state.playerOrder) {
    if (id === player.id) continue;
    const rival = state.players[id];
    if (!rival || !rival.alive) continue;
    const d = Math.abs(rival.head.row - cell.row) + Math.abs(rival.head.col - cell.col);
    if (d <= 1) return true;
  }
  return false;
}

/** Which cardinal direction owned land lies in from `cell`, by a short nearest-owned probe; `null` if none near. */
function ownedSideOf(grid: CellState[][], playerId: string, cell: Vec2): Direction | null {
  let best: Direction | null = null;
  let bestDist = Infinity;
  for (const dir of ALL_DIRECTIONS) {
    const n = { row: cell.row + DELTA[dir].row, col: cell.col + DELTA[dir].col };
    const d = nearestOwnedDistance(grid, playerId, n, 8);
    if (d < bestDist) {
      bestDist = d;
      best = dir;
    }
  }
  return Number.isFinite(bestDist) ? best : null;
}

function surveyorDecide(state: GameState, player: PlayerState, memory: SurveyorMemory): Direction {
  const p = player.profile;
  const grid = state.grid;
  const trailLen = player.trail.length;
  const candidates = ALL_DIRECTIONS.filter((d) => d !== OPPOSITE[player.facing] || trailLen === 0);

  // --- phase arbitration, with hysteresis so it doesn't flip on the boundary ---
  if (trailLen === 0) memory.phase = "extend"; // fresh leg after a bank or respawn
  const rivalClose = nearestRivalHeadDistance(state, player) <= p.rivalAvoidRadius;
  const loopWorthClosing =
    trailLen >= p.targetTrailLength &&
    estimateEnclosedArea(player.trail, player.head) >= p.targetTrailLength;
  if (memory.phase === "extend" && (rivalClose || loopWorthClosing)) memory.phase = "return";

  // Boxed in and still not closed → degrade to a plain homesick beeline so the
  // bot can never freeze. This is the Surveyor falling back to Rambler-style
  // recovery, not a separate code path.
  const deadlocked = trailLen >= 2 * p.targetTrailLength;

  // Track which way owned land lies, so the extend leg curls to enclose area.
  if (memory.phase === "extend" && !deadlocked) {
    memory.hugSide = ownedSideOf(grid, player.id, player.head) ?? memory.hugSide;
  }

  function scoreFor(dir: Direction, returning: boolean): number {
    const next = { row: player.head.row + DELTA[dir].row, col: player.head.col + DELTA[dir].col };
    if (!inBounds(state.rowCount, state.colCount, next)) return p.offBoardPenalty;

    const cell = grid[next.row][next.col];
    const distanceToHome = Math.abs(next.row - player.home.row) + Math.abs(next.col - player.home.col);

    // Our own wake never banks anything now. Returning → clear path home;
    // extending → steer clear so the wake doesn't tangle into itself.
    if (cell.kind === "trail" && cell.playerId === player.id) {
      return returning ? -distanceToHome : p.earlyLoopPenalty;
    }

    if (returning) {
      const banking = cell.kind === "territory" && cell.playerId === player.id && trailLen > 0;
      return banking ? p.closeLoopReward - distanceToHome : -distanceToHome;
    }

    // --- extend leg ---
    const ownedDist = nearestOwnedDistance(grid, player.id, next, p.maxTrailExposure + 2);
    // Hard guards the Rambler doesn't have: keep the head near owned land, and
    // never stray onto a cell touching a rival head.
    if (ownedDist > p.maxTrailExposure) return p.offBoardPenalty;
    if (isAdjacentToRivalHead(state, player, next)) return p.offBoardPenalty;
    // Diving straight back onto our own colour mid-leg wastes the loop.
    if (cell.kind === "territory" && cell.playerId === player.id) return p.earlyLoopPenalty;

    let s = 0;
    if (isFrontierAdjacent(grid, player.id, next)) s += p.frontierHugBonus; // stay one cell out
    if (cell.kind === "neutral") s += p.neutralBonus; // prefer unclaimed water
    if (memory.hugSide && dir === memory.hugSide) s += CURL_BONUS; // curl to enclose area
    s -= ownedDist * p.homePull; // faint pull back toward safe land
    s += Math.random() * p.jitter; // so two Surveyors don't lock-step
    return s;
  }

  function pickBest(returning: boolean): { dir: Direction; score: number } {
    let dir: Direction = candidates[0] ?? player.facing;
    let score = -Infinity;
    for (const d of candidates) {
      const s = scoreFor(d, returning);
      if (s > score) {
        score = s;
        dir = d;
      }
    }
    return { dir, score };
  }

  const returning = memory.phase === "return" || deadlocked;
  let result = pickBest(returning);
  // Frontier unreachable — every extend move is a self-cross or worse. Give up on
  // this leg and beeline home rather than wiggle in place forever.
  if (!returning && result.score <= p.earlyLoopPenalty) {
    memory.phase = "return";
    result = pickBest(true);
  }
  return result.dir;
}

export const surveyor: BotStrategy = {
  type: "surveyor",
  label: "Surveyor",
  decide: (state, player, memory) => surveyorDecide(state, player, memory as SurveyorMemory),
  fields: SURVEYOR_PROFILE_FIELDS,
  defaultProfile: DEFAULT_BOT_PROFILE,
};
