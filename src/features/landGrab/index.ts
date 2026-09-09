export { LandGrabDemo } from "./LandGrabDemo";
export { createInitialGameState, setPlayerFacing, stepGame, DEFAULT_GAME_RULES } from "./simulation";
export type { GameState, GameRules, PlayerConfig, PlayerState } from "./simulation";
export { DEFAULT_BOT_PROFILE, BOT_PROFILE_FIELDS, cloneProfile } from "./botProfile";
export type { BotProfile, BotProfileField } from "./botProfile";
export { resolveCapture, createEmptyGrid, countOwnedCells } from "./grid";
export type { CellState } from "./grid";
export { resolveTerritorySplit } from "./splitResolution";
export type { Direction, Vec2 } from "./types";
