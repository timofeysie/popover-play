export { LandGrabDemo } from "./LandGrabDemo";
export { createInitialGameState, setPlayerFacing, stepGame, DEFAULT_GAME_RULES } from "./simulation";
export type { GameState, GameRules, PlayerConfig, PlayerState } from "./simulation";
export {
  DEFAULT_BOT_PROFILE,
  BOT_PROFILE_FIELDS,
  SURVEYOR_EXTRA_FIELDS,
  SURVEYOR_PROFILE_FIELDS,
  cloneProfile,
} from "./botProfile";
export type { BotProfile, BotProfileField } from "./botProfile";
export { BOT_STRATEGIES, DEFAULT_BOT_TYPE, createBotMemory, strategyFor } from "./botStrategy";
export type { BotType, BotMemory, BotStrategy } from "./botStrategy";
export {
  createSurveyorMemory,
  nearestOwnedDistance,
  isFrontierAdjacent,
  estimateEnclosedArea,
  nearestRivalHeadDistance,
} from "./surveyorStrategy";
export type { SurveyorMemory } from "./surveyorStrategy";
export {
  buildGameRecord,
  saveGameRecord,
  loadGameRecords,
  clearGameRecords,
  GAME_RECORDS_STORAGE_KEY,
  MAX_STORED_GAME_RECORDS,
} from "./gameRecord";
export type { LandGrabGameRecord, LandGrabPlayerRecord } from "./gameRecord";
export { MatchRecordsPanel } from "./MatchRecordsPanel";
export {
  loadUserProfile,
  saveUserProfile,
  resolveUsername,
  DEFAULT_USERNAME,
  MAX_USERNAME_LENGTH,
  USER_PROFILE_STORAGE_KEY,
} from "./userProfile";
export type { LandGrabUserProfile } from "./userProfile";
export { resolveCapture, createEmptyGrid, countOwnedCells } from "./grid";
export type { CellState } from "./grid";
export { resolveTerritorySplit } from "./splitResolution";
export type { Direction, Vec2 } from "./types";
