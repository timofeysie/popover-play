# Land Grab — Bots

How the computer-controlled boats in `src/features/landGrab/LandGrabDemo.tsx` choose
their moves. This is a companion to the [`### Bots`](../land-grab.md#bots) summary in
the main plan — same behaviour, more detail.

## Table of contents

- [TL;DR](#tldr)
- [The three bots](#the-three-bots)
- [One shared brain: `decideBotFacing`](#one-shared-brain-decidebotfacing)
- [The scoring function](#the-scoring-function)
- [Behavioural phases](#behavioural-phases)
- [Tie-breaking and randomness](#tie-breaking-and-randomness)
- [What the bots deliberately don't do](#what-the-bots-deliberately-dont-do)
- [Tuning them live in the demo](#tuning-them-live-in-the-demo)
- [Tuning knobs](#tuning-knobs)

## TL;DR

There is **one bot AI**, not three. Red, Yellow, and Green all run the identical
function `decideBotFacing` (`src/features/landGrab/simulation.ts`); they differ only in
colour, label, and which corner they start in. Each tick a bot scores the (up to four)
directions it could turn and takes the highest-scoring one. The score is a greedy
one-cell lookahead — no pathfinding, no model of the other players. Net effect: a bot
sails out into open water laying wake, and once its trail reaches
`BOT_HOMESICK_TRAIL_LENGTH` (9) cells it turns "homesick" and beelines back to its own
territory to close the loop and bank a modest capture, then repeats. Sailing back
across its own wake does nothing on its own — the loop only closes on home turf.

## The three bots

Defined by `PLAYER_CONFIGS` in `LandGrabDemo.tsx`. All four players (you + three bots)
obey identical game rules; `isBot` only decides *who picks the moves*.

| id | Label | Colour | Start corner (default 16×24 board) |
| --- | --- | --- | --- |
| `bot-red` | Red Bot | `#f87171` | bottom-right — `(12, 19)` |
| `bot-yellow` | Yellow Bot | `#facc15` | top-right — `(3, 19)` |
| `bot-green` | Green Bot | `#4ade80` | bottom-left — `(12, 4)` |

(You, `#38bdf8`, take the top-left corner `(3, 4)`.) Corners come from `startingSpots`
in `simulation.ts`, inset from the edges by `max(2, floor(rows/5))` rows and
`max(2, floor(cols/5))` cols.

Every player also carries a **`profile`** (`BotProfile`, from `botProfile.ts`) — the
seven numbers `decideBotFacing` scores moves against. Bots use it directly; a human's
profile only matters once **autopilot** is switched on for them. All four start on a
clone of `DEFAULT_BOT_PROFILE`; the demo's Profiles panel edits each one independently
and live (see [Tuning them live](#tuning-them-live-in-the-demo)).

Bot-specific lifecycle details:

- **Bots start on tick 1.** `hasStarted` is initialised to `config.isBot || autopilot`,
  so bots (and an autopiloted human) move immediately while a manual boat sits on its
  base until the first keypress. Same after a respawn.
- Each tick `stepGame` calls `decideBotFacing` for every living bot and writes the
  result straight into `player.queuedFacing`, overwriting whatever was there. So the
  input-buffering rules that matter for a human ("only the most recent queued turn is
  kept") are moot for bots — they re-decide from scratch every tick.

## One shared brain: `decideBotFacing`

```ts
function decideBotFacing(state: GameState, player: PlayerState): Direction
```

Called from `stepGame` against a `scratchState` (the grid *after* respawns have been
placed for this tick). Procedure:

1. **Build the candidate list.** All four directions, minus a straight 180° reversal —
   unless the trail is empty, in which case reversing is allowed.
   `candidates = ALL_DIRECTIONS.filter(d => d !== OPPOSITE[facing] || trail.length === 0)`.
2. **Set the `homesick` flag:** `player.trail.length >= p.homesickTrailLength` (default 9),
   where `p = player.profile`.
3. **Score every candidate** with the nested `score(dir)` (below).
4. **Take the max.** The loop uses a strict `>` seeded at `-Infinity`, so on an exact
   tie the earliest candidate in `["up", "down", "left", "right"]` order wins. Fallback
   if `candidates` is somehow empty: keep the current `facing`.

## The scoring function

Every literal below is a field of `player.profile` (`p`); the parenthesised number is
the `DEFAULT_BOT_PROFILE` value.

```ts
function score(dir: Direction): number {
  const p = player.profile;
  const next = { row: player.head.row + DELTA[dir].row, col: player.head.col + DELTA[dir].col };

  // Off the board: the edge is a wall (the mover just holds position), so this is
  // only a wasted tick — ranked far below any real move but above suicide.
  if (!inBounds(state, next)) return p.offBoardPenalty;                 // -1000

  const cell = state.grid[next.row][next.col];
  const distanceToHome = Math.abs(next.row - player.home.row) + Math.abs(next.col - player.home.col);

  // Our own wake: crossing it no longer banks anything — the loop closes only
  // back on our own territory. Homesick → it's just clear path home; exploring →
  // steer away so the trail doesn't tangle into itself.
  if (cell.kind === "trail" && cell.playerId === player.id)
    return homesick ? -distanceToHome : p.earlyLoopPenalty;            // -20

  if (homesick) {
    // Diving onto our own colour with a trail still out IS the capture.
    const banking = cell.kind === "territory" && cell.playerId === player.id && player.trail.length > 0;
    return banking ? p.closeLoopReward - distanceToHome : -distanceToHome; // +1 bonus
  }

  const preferUnclaimed = cell.kind === "neutral" ? p.neutralBonus : 0; // 2
  return preferUnclaimed - distanceToHome * p.homePull + Math.random() * p.jitter; // 0.01, 0.5
}
```

Reading the exploration-mode score (`neutralBonus - distanceToHome * homePull + random*jitter`),
at defaults:

- **Neutral cells always beat non-neutral ones.** The `neutralBonus` gap is `2`; the
  random jitter maxes out at `0.5`, so it can never flip that ordering — *unless you raise
  `jitter` above `neutralBonus` in the panel*, at which point neutral-seeking stops being
  reliable.
- **Among cells of the same kind, the choice is essentially random.** The jitter (0–0.5)
  dwarfs the distance-to-home term (`homePull` = 0.01), which only acts as a faint
  tie-breaker nudging the bot back toward base. The jitter is there so the three bots
  don't move in lockstep.
- Own territory, enemy territory, and enemy trail all score the same (`preferUnclaimed = 0`) —
  the bot draws no distinction between them.

## Behavioural phases

A bot's life cycles through two states, gated purely on trail length:

| Phase | Condition | Behaviour |
| --- | --- | --- |
| **Explore** | `trail.length < 9` | Wander toward neutral water, jittered, with a 0.01-weight pull back toward home. Still *avoids* its own wake (`-20`) so the trail doesn't tangle into itself. |
| **Homesick** | `trail.length >= 9` | Ignore neutral/claimed distinctions. Score each move as `-Manhattan(next, home)` → a straight beeline for the base, crossing its own wake freely along the way. Stepping onto its own **territory** while a trail is out adds `closeLoopReward` (`+1`) — that dive back onto home turf is what closes the loop and banks the capture. |

So the loop the bots draw is: strike out ~9 cells into open water, then beeline home
and close the loop by re-entering their own territory. Captures are small and
frequent rather than large and risky — matching the "simplest useful bot" described in
the plan's [Open questions](../land-grab.md#open-questions).

## Tie-breaking and randomness

- **Non-deterministic.** `Math.random()` is called in every exploration-mode score and
  is not seeded, so a bot's path differs run to run even from an identical board. (The
  unit tests in `src/test/` cover the pure grid/capture/split logic, not bot paths, so
  this doesn't make the suite flaky.)
- **Homesick mode is deterministic** apart from the board state: scores are small
  integers, and exact ties resolve by `up > down > left > right` candidate order.
- The `-1000` (off-board) and `-20` (explore-mode self-cross) sentinels are only ever
  chosen when *every* candidate is that bad — e.g. boxed into a corner by its own trail.

## What the bots deliberately don't do

The AI is intentionally minimal. It has **no model of the other players** and **no
lookahead past one cell**. In particular:

- **No offence.** It never steers toward an opponent's trail to cut them, even though a
  cut captures both wakes and every cell that player owned into one connected bridge and
  sinks them. Enemy trail scores the same as any other non-neutral cell.
- **No evasion.** It doesn't dodge opponents' heads or trails, and doesn't avoid driving
  through enemy territory (which is legal — you plow trail straight through it).
- **No self-trap avoidance** beyond the single adjacent cell. A bot can wander its own
  wake into a shape it then has to break out of; the homesick beeline is the only
  recovery mechanism.
- **No capture-area optimisation.** Once homesick it takes the shortest path back, not
  the path that would enclose the most ground.
- **No collision prediction.** Move resolution is order-dependent (`state.playerOrder`),
  and the bot doesn't account for where anyone else will be after this tick.

This is by design — Phase 0 only needs bots good enough to exercise the capture-fill and
split-resolution algorithms, not to be challenging opponents.

## Tuning them live in the demo

The Land Grab page has a **Pause** button (also <kbd>Space</kbd>) and a **Step** button
(also <kbd>.</kbd>) that advances exactly one tick while paused, plus a speed selector
(0.25×–4×, via `this.time.timeScale`). None of these touch the simulation — they only
gate how often `stepGame` runs.

The **Profiles** button opens a panel with one card per player:

- **You** — a read-only list of the fixed human rules (buffered input, no 180° reversal,
  start gate), plus an **Autopilot** checkbox. Tick it and your boat is driven by
  `decideBotFacing` with its own editable profile (`PlayerState.autopilot`,
  `PlayerConfig.autopilot`) — the way to watch a fair four-bot match, or to A/B a profile
  against the three defaults.
- **Each bot** — a slider per `BotProfile` field (below). Edits apply on the **next
  tick**, no restart: the Phaser tick loop copies the React-owned `profiles` /
  `autopilot` / `rules` onto the live `GameState` before each `stepGame`. Per-card
  **Reset** restores `DEFAULT_BOT_PROFILE`; **Reset all** also restores the match rules.

A match-level **Respawn delay** slider (`GameState.rules.respawnDelayTicks`, default 12)
sits at the top of the panel.

## Tuning knobs

Per-player, on `PlayerState.profile` (`src/features/landGrab/botProfile.ts`,
`BOT_PROFILE_FIELDS` drives the sliders):

| `BotProfile` field | Default | Effect |
| --- | --- | --- |
| `homesickTrailLength` | `9` | Trail length at which the bot flips from explore to beeline-home. Higher → bigger, riskier loops. |
| `neutralBonus` | `2` | Preference for unclaimed water over owned cells while exploring. Must stay above `jitter` or neutral-seeking stops being reliable. |
| `jitter` | `0.5` | Upper bound of the random wander added to each explore-mode score. `0` → all bots trace near-identical paths from symmetric corners. |
| `homePull` | `0.01` | Weight of the pull back toward home while exploring (× Manhattan distance). Raise it to keep the bot hugging its corner. |
| `closeLoopReward` | `1` | Bonus for diving back onto your own **territory** once homesick — the move that closes the loop and banks the capture. |
| `earlyLoopPenalty` | `-20` | Penalty for steering back across your own wake while exploring. More negative → the trail stays untangled. |
| `offBoardPenalty` | `-1000` | Penalty for steering into the (non-lethal) board edge. Only needs to rank below any real move. |

Match- and presentation-level:

| Knob | Default | Where | Effect |
| --- | --- | --- | --- |
| `rules.respawnDelayTicks` | `12` | `GameState` (panel slider) | Ticks a dead player waits before it's eligible to respawn (still needs a clear 3×3). |
| `TICK_MS` | `160` | `simulation.ts` constant | Sim tick length. |
| speed | `1×` | demo only (`time.timeScale`) | How fast ticks fire; not part of the simulation. |
