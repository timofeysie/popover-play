import { countOwnedCells, createEmptyGrid, findOpenSpawn, isAreaFree, placeBase, resolveCapture, type CellState } from "./grid";
import { resolveTerritorySplit } from "./splitResolution";
import { cloneProfile, DEFAULT_BOT_PROFILE, type BotProfile } from "./botProfile";
import type { Direction, Vec2 } from "./types";

export const BASE_RADIUS = 1;
export const RESPAWN_DELAY_TICKS = 12;
/** @deprecated per-bot now: see `BotProfile.homesickTrailLength`. Kept as the default. */
export const BOT_HOMESICK_TRAIL_LENGTH = DEFAULT_BOT_PROFILE.homesickTrailLength;
export const TICK_MS = 160;

/** Match-level knobs that aren't tied to a single player. */
export interface GameRules {
  respawnDelayTicks: number;
}

export const DEFAULT_GAME_RULES: GameRules = {
  respawnDelayTicks: RESPAWN_DELAY_TICKS,
};

export interface PlayerConfig {
  id: string;
  label: string;
  color: number;
  isBot: boolean;
  /** Starting decision parameters; defaults to `DEFAULT_BOT_PROFILE` when omitted. */
  profile?: BotProfile;
  /** Drive a non-bot player with `decideBotFacing` from tick 1. */
  autopilot?: boolean;
}

export interface PlayerState extends PlayerConfig {
  alive: boolean;
  home: Vec2;
  head: Vec2;
  facing: Direction;
  queuedFacing: Direction | null;
  trail: Vec2[];
  ownedCount: number;
  respawnAt: number | null;
  kills: number;
  /** Bots move every tick from the start; a human sits still at home until their first key press. */
  hasStarted: boolean;
  /** The decision parameters this player's moves are scored against (used when a bot or on autopilot). */
  profile: BotProfile;
  /** True for bots, or a human whose autopilot toggle is on. */
  autopilot: boolean;
}

export interface GameState {
  rowCount: number;
  colCount: number;
  grid: CellState[][];
  players: Record<string, PlayerState>;
  playerOrder: string[];
  tick: number;
  rules: GameRules;
}

const DELTA: Record<Direction, Vec2> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

const OPPOSITE: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };

const ALL_DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

/** Evenly spread starting corners for up to 4 players; anything past that falls back to a scanned spawn. */
function startingSpots(rowCount: number, colCount: number, count: number): Vec2[] {
  const marginRow = Math.max(BASE_RADIUS + 1, Math.floor(rowCount / 5));
  const marginCol = Math.max(BASE_RADIUS + 1, Math.floor(colCount / 5));
  const corners: Vec2[] = [
    { row: marginRow, col: marginCol },
    { row: rowCount - 1 - marginRow, col: colCount - 1 - marginCol },
    { row: marginRow, col: colCount - 1 - marginCol },
    { row: rowCount - 1 - marginRow, col: marginCol },
  ];
  return corners.slice(0, count);
}

export function createInitialGameState(
  rowCount: number,
  colCount: number,
  configs: PlayerConfig[],
  rules?: Partial<GameRules>,
): GameState {
  let grid = createEmptyGrid(rowCount, colCount);
  const spots = startingSpots(rowCount, colCount, configs.length);
  const players: Record<string, PlayerState> = {};
  const playerOrder = configs.map((c) => c.id);

  configs.forEach((config, index) => {
    const home = spots[index] ?? findOpenSpawn(grid, { row: Math.floor(rowCount / 2), col: Math.floor(colCount / 2) });
    grid = placeBase(grid, home, config.id, BASE_RADIUS);
    const autopilot = config.autopilot ?? false;
    players[config.id] = {
      ...config,
      profile: cloneProfile(config.profile ?? DEFAULT_BOT_PROFILE),
      autopilot,
      alive: true,
      home,
      head: home,
      facing: "up",
      queuedFacing: null,
      trail: [],
      ownedCount: 0,
      respawnAt: null,
      kills: 0,
      hasStarted: config.isBot || autopilot,
    };
  });

  for (const player of Object.values(players)) {
    player.ownedCount = countOwnedCells(grid, player.id);
  }

  return {
    rowCount,
    colCount,
    grid,
    players,
    playerOrder,
    tick: 0,
    rules: { ...DEFAULT_GAME_RULES, ...rules },
  };
}

export function setPlayerFacing(state: GameState, playerId: string, direction: Direction): void {
  const player = state.players[playerId];
  if (!player || !player.alive) return;
  // No reversing straight into the trail you just laid
  if (direction === OPPOSITE[player.facing] && player.trail.length > 0) return;
  player.queuedFacing = direction;
  player.hasStarted = true;
}

function eliminate(grid: CellState[][], player: PlayerState, tick: number, respawnDelay: number): CellState[][] {
  let next = grid;
  if (player.trail.length > 0) {
    next = grid.map((row) => row.slice());
    for (const { row, col } of player.trail) {
      const cell = next[row][col];
      if (cell.kind === "trail" && cell.playerId === player.id) next[row][col] = { kind: "neutral" };
    }
  }
  player.alive = false;
  player.trail = [];
  player.respawnAt = tick + respawnDelay;
  return next;
}

function respawnPlayer(grid: CellState[][], player: PlayerState, spawn: Vec2): CellState[][] {
  const next = placeBase(grid, spawn, player.id, BASE_RADIUS);
  player.home = spawn;
  player.head = spawn;
  player.facing = "up";
  player.queuedFacing = null;
  player.alive = true;
  player.respawnAt = null;
  player.hasStarted = player.isBot || player.autopilot;
  return next;
}

function inBounds(state: GameState, cell: Vec2): boolean {
  return cell.row >= 0 && cell.row < state.rowCount && cell.col >= 0 && cell.col < state.colCount;
}

function decideBotFacing(state: GameState, player: PlayerState): Direction {
  const p = player.profile;
  const candidates = ALL_DIRECTIONS.filter((d) => d !== OPPOSITE[player.facing] || player.trail.length === 0);
  const homesick = player.trail.length >= p.homesickTrailLength;

  function score(dir: Direction): number {
    const next = { row: player.head.row + DELTA[dir].row, col: player.head.col + DELTA[dir].col };
    // Board edge is just a wall now (the mover holds position), so it's merely
    // wasteful, not fatal — rank it well below any real move but above suicide.
    if (!inBounds(state, next)) return p.offBoardPenalty;
    const cell = state.grid[next.row][next.col];
    // Crossing our own trail now closes the loop and banks the capture instead
    // of killing us — worth it once the trail is long, wasteful when it's short.
    if (cell.kind === "trail" && cell.playerId === player.id) return homesick ? p.closeLoopReward : p.earlyLoopPenalty;
    const distanceToHome = Math.abs(next.row - player.home.row) + Math.abs(next.col - player.home.col);
    if (homesick) return -distanceToHome;
    const preferUnclaimed = cell.kind === "neutral" ? p.neutralBonus : 0;
    return preferUnclaimed - distanceToHome * p.homePull + Math.random() * p.jitter;
  }

  let best: Direction = candidates[0] ?? player.facing;
  let bestScore = -Infinity;
  for (const dir of candidates) {
    const s = score(dir);
    if (s > bestScore) {
      bestScore = s;
      best = dir;
    }
  }
  return best;
}

export function stepGame(state: GameState): GameState {
  let grid = state.grid;
  const rules = state.rules ?? DEFAULT_GAME_RULES;
  const players: Record<string, PlayerState> = {};
  for (const [id, p] of Object.entries(state.players)) players[id] = { ...p, trail: [...p.trail] };

  const nextTick = state.tick + 1;
  let eliminationOccurred = false;

  for (const player of Object.values(players)) {
    if (player.alive || player.respawnAt === null || player.respawnAt > state.tick) continue;
    // Hold the player out until the board actually has a clear 3x3 pocket for a
    // fresh base; otherwise leave respawnAt as-is and try again next tick.
    const spawn = findOpenSpawn(grid, player.home, BASE_RADIUS);
    if (!isAreaFree(grid, spawn, BASE_RADIUS)) continue;
    grid = respawnPlayer(grid, player, spawn);
  }

  const scratchState: GameState = { ...state, grid, players };
  for (const player of Object.values(players)) {
    if (player.alive && (player.isBot || player.autopilot)) {
      // Autopilot skips the human start gate — a driven boat moves from tick 1.
      player.hasStarted = true;
      player.queuedFacing = decideBotFacing(scratchState, player);
    }
  }

  for (const id of state.playerOrder) {
    const player = players[id];
    if (!player.alive || !player.hasStarted) continue;

    const facing = player.queuedFacing ?? player.facing;
    player.facing = facing;
    player.queuedFacing = null;

    const next: Vec2 = { row: player.head.row + DELTA[facing].row, col: player.head.col + DELTA[facing].col };

    if (!inBounds(state, next)) {
      // The board edge is a wall, not a cliff: hold position for this tick. The
      // player's facing now points into the wall, so a human keeps sitting here
      // until they steer somewhere that stays on the board; a bot re-picks a
      // direction on the next tick.
      continue;
    }

    let targetCell = grid[next.row][next.col];

    // Running into your own live trail is not a death — it pinches the loop
    // closed. Anyone else's trail is still an elimination.
    const closingOnOwnTrail = targetCell.kind === "trail" && targetCell.playerId === player.id;

    if (targetCell.kind === "trail" && targetCell.playerId !== player.id) {
      const victim = players[targetCell.playerId];
      grid = eliminate(grid, victim, nextTick, rules.respawnDelayTicks);
      player.kills += 1;
      eliminationOccurred = true;
      targetCell = grid[next.row][next.col]; // now neutral
    }

    const reenteringOwnLand = targetCell.kind === "territory" && targetCell.playerId === player.id;

    if (player.trail.length > 0 && (closingOnOwnTrail || reenteringOwnLand)) {
      grid = resolveCapture(grid, player.id);
      player.trail = [];
      player.head = next;
      for (const otherId of state.playerOrder) {
        if (otherId === player.id) continue;
        const other = players[otherId];
        grid = resolveTerritorySplit(grid, other.id, [other.head, other.home]);
      }
    } else if (reenteringOwnLand) {
      player.head = next;
    } else {
      const row = grid[next.row].slice();
      row[next.col] = { kind: "trail", playerId: player.id };
      grid = grid.slice();
      grid[next.row] = row;
      player.trail.push(next);
      player.head = next;
    }
  }

  if (eliminationOccurred) {
    // A kill wipes the victim's trail back to neutral. If that trail had been
    // plowed straight through another player's territory (enemy land is fair
    // game to trail across), those cells are now a neutral channel that can
    // leave part of that territory cut off from its base — the same split a
    // capture causes, and never otherwise resolved because no loop closed.
    for (const id of state.playerOrder) {
      const other = players[id];
      grid = resolveTerritorySplit(grid, other.id, [other.head, other.home]);
    }
  }

  for (const player of Object.values(players)) {
    player.ownedCount = countOwnedCells(grid, player.id);
  }

  return { rowCount: state.rowCount, colCount: state.colCount, grid, players, playerOrder: state.playerOrder, tick: nextTick, rules };
}
