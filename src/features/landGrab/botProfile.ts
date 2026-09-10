/**
 * A bot's decision parameters — everything `decideBotFacing` (in `simulation.ts`)
 * reads when it scores the four candidate directions each tick. One of these hangs
 * off every `PlayerState`; bots use it directly, and a human does too once their
 * profile has `autopilot` switched on.
 *
 * The demo's Profiles panel edits these live: a change lands on the next tick, no
 * restart needed. See `docs/land-grab/bots.md` for how the scorer uses each field.
 */
export interface BotProfile {
  /** Trail length at which the bot stops exploring and beelines for home. */
  homesickTrailLength: number;
  /** Score for a move that leaves the board — a non-lethal wall, just a wasted tick. */
  offBoardPenalty: number;
  /** Score for crossing your own wake while still exploring — keeps the trail from tangling into itself. */
  earlyLoopPenalty: number;
  /** Bonus for diving back onto your own territory once homesick — this closes the loop and banks the capture. */
  closeLoopReward: number;
  /** Bonus added when the target cell is unclaimed neutral water (explore mode only). */
  neutralBonus: number;
  /** Weight of the pull back toward home while exploring, multiplied by Manhattan distance. */
  homePull: number;
  /** Upper bound of the random jitter (0..jitter) added to every explore-mode score. */
  jitter: number;
}

export const DEFAULT_BOT_PROFILE: BotProfile = {
  homesickTrailLength: 9,
  offBoardPenalty: -1000,
  earlyLoopPenalty: -20,
  closeLoopReward: 1,
  neutralBonus: 2,
  homePull: 0.01,
  jitter: 0.5,
};

export function cloneProfile(profile: BotProfile): BotProfile {
  return { ...profile };
}

export interface BotProfileField {
  key: keyof BotProfile;
  label: string;
  min: number;
  max: number;
  step: number;
  /** One-line explanation of what moving this slider does. */
  hint: string;
}

/** Drives the sliders in the Profiles panel; order here is the display order. */
export const BOT_PROFILE_FIELDS: BotProfileField[] = [
  {
    key: "homesickTrailLength",
    label: "Homesick trail length",
    min: 2,
    max: 40,
    step: 1,
    hint: "Wake length at which the bot quits exploring and heads straight home. Higher → bigger, riskier loops.",
  },
  {
    key: "neutralBonus",
    label: "Neutral-cell bonus",
    min: 0,
    max: 10,
    step: 0.5,
    hint: "How strongly the bot prefers unclaimed water over already-owned cells while exploring. Must stay above the jitter to be reliable.",
  },
  {
    key: "jitter",
    label: "Random jitter",
    min: 0,
    max: 5,
    step: 0.1,
    hint: "Randomness added to each explore-mode score. 0 makes the bots trace near-identical paths from symmetric corners.",
  },
  {
    key: "homePull",
    label: "Home pull",
    min: 0,
    max: 1,
    step: 0.01,
    hint: "Bias back toward the home base while exploring (× Manhattan distance). Raise it to keep the bot hugging its corner.",
  },
  {
    key: "closeLoopReward",
    label: "Close-loop reward",
    min: -5,
    max: 20,
    step: 0.5,
    hint: "Pull toward diving back onto your own territory once homesick — this is what closes the loop and banks the capture.",
  },
  {
    key: "earlyLoopPenalty",
    label: "Early-loop penalty",
    min: -100,
    max: 0,
    step: 1,
    hint: "Penalty for steering back across your own wake while exploring. More negative → the trail stays untangled.",
  },
  {
    key: "offBoardPenalty",
    label: "Off-board penalty",
    min: -2000,
    max: 0,
    step: 10,
    hint: "Penalty for steering into the board edge. The edge is a non-lethal wall, so this only needs to rank below any real move.",
  },
];
