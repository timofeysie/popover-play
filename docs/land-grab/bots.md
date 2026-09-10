# Land Grab — Bots

How the computer-controlled boats in `src/features/landGrab/LandGrabDemo.tsx` choose
their moves. This is a companion to the [`### Bots`](../land-grab.md#bots) summary in
the main plan — same behaviour, more detail.

> **Archetypes now split.** A default match is **one Rambler (Yellow) vs. two Surveyors
> (Red, Green) vs. the human**. The Rambler is the original greedy roamer described
> throughout the first half of this doc; the Surveyor is the deliberate territory
> farmer in [Archetype: the Surveyor](#archetype-the-surveyor-the-gradual-looping-bot-red--green).
> Both run through the same one-call-per-tick registry — see
> [Bot types](#bot-types-solution-architecting).

## Table of contents

- [TL;DR](#tldr)
- [The three bots](#the-three-bots)
- [The Rambler brain: `decideBotFacing`](#the-rambler-brain-decidebotfacing)
- [The scoring function](#the-scoring-function)
- [Behavioural phases](#behavioural-phases)
- [Tie-breaking and randomness](#tie-breaking-and-randomness)
- [What the bots deliberately don't do](#what-the-bots-deliberately-dont-do)
- [Bot types: solution architecting](#bot-types-solution-architecting)
- [Tuning them live in the demo](#tuning-them-live-in-the-demo)
- [Tuning knobs](#tuning-knobs)

## TL;DR

Every living bot picks a move the same way: each tick it scores the (up to four)
directions it could turn with a greedy one-cell lookahead and takes the
highest-scoring one — no pathfinding, no model of the other players. `decideBotFacing`
(`src/features/landGrab/simulation.ts`) is now a one-line dispatch to the bot's
**archetype**, registered in `botStrategy.ts`:

- **Rambler** (Yellow Bot) — the original brain, described in the sections below. Sails
  out laying wake; once its trail reaches `homesickTrailLength` (9) cells it turns
  "homesick" and beelines back to its own territory to close the loop and bank a modest
  capture, then repeats. Crossing its own wake does nothing — the loop only closes on
  home turf.
- **Surveyor** (Red & Green Bots) — a deliberate territory farmer. Hugs the frontier of
  its own land one cell out, sweeps a strip within `maxTrailExposure` of owned ground,
  then folds it back in once the wake hits `targetTrailLength` or a rival gets close.
  Bigger, chunkier captures than the Rambler with far less exposed wake. See
  [Archetype: the Surveyor](#archetype-the-surveyor-the-gradual-looping-bot-red--green).

## The three bots

Defined by `PLAYER_CONFIGS` in `LandGrabDemo.tsx`. All four players (you + three bots)
obey identical game rules; `isBot` only decides *who picks the moves*, and `botType`
decides *which archetype* picks them (`undefined` → `"rambler"`).

| id | Label | Colour | Archetype | Start corner (default 16×24 board) |
| --- | --- | --- | --- | --- |
| `bot-red` | Red Bot | `#f87171` | `surveyor` | bottom-right — `(12, 19)` |
| `bot-yellow` | Yellow Bot | `#facc15` | `rambler` | top-right — `(3, 19)` |
| `bot-green` | Green Bot | `#4ade80` | `surveyor` | bottom-left — `(12, 4)` |

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

## The Rambler brain: `decideBotFacing`

> This section and the two after it ([The scoring function](#the-scoring-function),
> [Behavioural phases](#behavioural-phases)) describe the **Rambler** archetype —
> Yellow Bot, and the default when `botType` is unset. `decideBotFacing` in
> `simulation.ts` is now just `strategyFor(player.botType).decide(state, player,
> player.botMemory)`; the code below lives in `botStrategy.ts` as `ramblerDecide`.
> The Surveyor's procedure is in
> [Archetype: the Surveyor](#archetype-the-surveyor-the-gradual-looping-bot-red--green).

```ts
function ramblerDecide(state: GameState, player: PlayerState): Direction
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

A **Rambler**'s life cycles through two states, gated purely on trail length (the
**Surveyor** has its own `extend` / `return` cycle — see
[its archetype section](#archetype-the-surveyor-the-gradual-looping-bot-red--green)):

| Phase | Condition | Behaviour |
| --- | --- | --- |
| **Explore** | `trail.length < 9` | Wander toward neutral water, jittered, with a 0.01-weight pull back toward home. Still *avoids* its own wake (`-20`) so the trail doesn't tangle into itself. |
| **Homesick** | `trail.length >= 9` | Ignore neutral/claimed distinctions. Score each move as `-Manhattan(next, home)` → a straight beeline for the base, crossing its own wake freely along the way. Stepping onto its own **territory** while a trail is out adds `closeLoopReward` (`+1`) — that dive back onto home turf is what closes the loop and banks the capture. |

So the loop a Rambler draws is: strike out ~9 cells into open water, then beeline home
and close the loop by re-entering its own territory. Captures are small and
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

Scoped to the **Rambler**. The AI is intentionally minimal: **no model of the other
players**, **no lookahead past one cell**. The Surveyor chips at the first three of
these — a hard exposure cap, a "don't step next to a rival head" guard, and an early
return when a rival closes — but still has no real offence and no multi-cell search. In
particular the Rambler has:

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

## Bot types: solution architecting

> **Status:** Phases 2 and 3 have landed — see [Rollout plan](#rollout-plan). The
> `BotStrategy` interface, the `BOT_STRATEGIES` registry, the `decideBotFacing`
> dispatcher and the per-bot `botMemory` bag live in
> `src/features/landGrab/botStrategy.ts`; `"rambler"` (today's roamer, moved there
> verbatim) and `"surveyor"` (`surveyorStrategy.ts`, the gradual-looping farmer) are
> both registered. Red and Green run `"surveyor"`; Yellow stays `"rambler"`. Still
> outstanding: **Phase 4**, the Profiles panel showing the archetype name per card and
> rendering only that archetype's `fields` (today it renders every
> [`BOT_PROFILE_FIELDS`](#tuning-knobs) slider on every driven card, so the four
> Surveyor knobs are not yet tunable live — they sit at their `DEFAULT_BOT_PROFILE`
> values).

### Why one brain is no longer enough

The capture rules changed underneath the bot AI:

- **Loops only close on your own colour.** Crossing your own wake is now a no-op, so a
  capture is a deliberate round trip: strike out, then get *all the way back* onto
  owned land. Small, frequent, near-home loops are cheap; large deliberate enclosures
  are where the board is actually won.
- **Cutting a rival's trail is a full capture + bridge.** The victim's wake, your wake,
  and every cell the victim owned all flip to your colour in one connected blob, and
  the victim must respawn. Offence is now enormously valuable — and being caught with a
  long exposed wake is now fatal, not just wasteful.
- **The match ends.** A player who owns the whole board, or is the last boat afloat with
  nowhere for the dead to respawn, wins and the sim freezes (`GameState.winnerId`).
  "Roam forever banking tiny loops" no longer converges on a win.

The current bot — see [the Rambler](#archetype-the-rambler-todays-bot-yellow-keeps-it)
— copes but plateaus: it never consolidates a big region, never re-uses its own bridge,
never hunts a trail, and wanders through contested water trailing an exposed wake that a
human (or a future offensive bot) can cut for a landslide. We want a **small set of
archetypes with explicit, different goals** so that:

1. matches have texture (a farmer, a raider, a baseline roamer behave visibly differently);
2. the capture-fill and split-resolution code gets exercised by more varied play than
   one greedy scorer produces;
3. the human has something to actually play against.

### Design constraints the archetypes must respect

Whatever the structure, keep the properties that make the current bot layer testable and
cheap:

- **One decision call per living bot per tick**, signature stays
  `(state, player) => Direction`. No multi-tick planning that can't be re-derived from
  the current `GameState`.
- **Pure w.r.t. the sim.** A bot reads `GameState` and its own `PlayerState`; it must not
  mutate either. `stepGame` writes the result into `player.queuedFacing`.
- **Greedy one-cell lookahead is still the default.** An archetype may add a *cheap*
  objective (a couple of scalars in scratch memory) but not a search.
- **Profiles stay live-editable** from the panel, applied on the next tick, no restart.
- **Deterministic apart from `Math.random()` and board state**, so unit tests can target
  any new pure helpers directly (the way `src/test/` covers grid/capture/split today).
- **Back-compatible.** `PlayerConfig` with no type behaves exactly as now; existing tests
  and stored game records are untouched.

### Approaches to supporting multiple bot types

Three ways to let bots differ, roughly in order of increasing structure:

| # | Approach | Shape | Pros | Cons |
| --- | --- | --- | --- | --- |
| 1 | **Type tag + `switch`** | `PlayerConfig.botType`; `decideBotFacing` branches on it, sharing the candidate-list / argmax skeleton. | Smallest diff. One file. | `decideBotFacing` grows without bound; per-type knobs and defaults get tangled; hard to test one archetype in isolation. |
| 2 | **Strategy registry** *(recommended)* | `BOT_STRATEGIES: Record<BotType, BotStrategy>`; `decideBotFacing` becomes a 3-line dispatcher. Each strategy is its own module with its own `decide`, profile-field subset, and defaults. | Clean separation; each archetype unit-tested alone; per-archetype knob schema; adding one is additive. | A little ceremony up front (the interface + a registry file). |
| 3 | **Goal stack / behaviour tree per bot** | Each bot holds an ordered list of goals (`SurviveGoal`, `ExtendGoal`, `CloseLoopGoal`…) evaluated each tick. | Maximum flexibility; composable. | Overkill for 3–4 archetypes; a scheduler and goal-arbitration layer to maintain; harder to reason about ties. |

**Recommendation: approach 2.** Proposed interface:

```ts
// botStrategy.ts
export type BotType = "rambler" | "surveyor"; // add "privateer", "blockader"… later

export interface BotStrategy {
  type: BotType;
  label: string;                       // shown in the Profiles panel header
  /** Pure. Same contract decideBotFacing has today. `memory` is this bot's scratch bag. */
  decide(state: GameState, player: PlayerState, memory: BotMemory): Direction;
  /** Which BotProfile fields this archetype actually reads — drives the panel sliders. */
  fields: BotProfileField[];
  defaultProfile: BotProfile;
}

export const BOT_STRATEGIES: Record<BotType, BotStrategy> = { rambler, surveyor };
```

`decideBotFacing` then collapses to:

```ts
function decideBotFacing(state: GameState, player: PlayerState): Direction {
  const strategy = BOT_STRATEGIES[player.botType ?? "rambler"];
  return strategy.decide(state, player, botMemoryFor(player));
}
```

### Where per-bot planning state lives

The Rambler is stateless — everything it needs (`trail.length`, `head`, `home`) is on
`PlayerState` already. The Surveyor wants a scrap of memory ("am I extending or
returning, and around which edge?"). Options:

- **`PlayerState.botMemory?: BotMemory`** — a small typed bag, `{}` at spawn, cleared on
  respawn in `respawnPlayer`. Serialises with the state; visible to tests. Preferred.
- A module-level `WeakMap<PlayerState, BotMemory>` in the strategy layer — keeps the bag
  out of the sim type, but `stepGame` clones `PlayerState` every tick (`{ ...p }`), so
  the key identity is lost. Rejected for that reason.

Keep `BotMemory` a discriminated union keyed by `BotType` so each strategy owns its
shape and the others can ignore it.

### Profile knobs across archetypes

`BotProfile` today is a flat struct of seven numbers, all of which the Rambler reads.
New archetypes need new knobs (`maxTrailExposure`, `frontierHugBonus`, …) but shouldn't
show sliders they don't use.

- **Short term:** keep `BotProfile` one flat superset; add the new fields with sane
  defaults; let each `BotStrategy.fields` list the subset the panel renders for that
  bot. `DEFAULT_BOT_PROFILE` stays the union so nothing goes `undefined`.
- **If it gets unwieldy:** split into `{ core: {...}, rambler?: {...}, surveyor?: {...} }`.
  Not worth it at two archetypes.

### Archetype: the Rambler (today's bot; Yellow keeps it)

| | |
| --- | --- |
| **Goal** | Never sit still. Keep a wake out; bank a small loop whenever one is cheap to close. |
| **Mechanism** | The two-phase greedy scorer documented above — [explore](#behavioural-phases) (jittered wander toward neutral water, faint pull home) until `trail.length >= homesickTrailLength`, then [homesick](#behavioural-phases) (Manhattan beeline home, `closeLoopReward` for stepping back onto own territory). |
| **Emergent play** | A cloud of small, frequent captures hugging its start corner. Paths differ run-to-run from `jitter`. |
| **Strengths** | Cheap, robust, never deadlocks (the homesick beeline is a guaranteed-progress recovery). Good **control/baseline** to measure other archetypes against, and a fair warm-up opponent for the human. |
| **Weaknesses under the new rules** | No consolidation (never encloses a big pocket). No offence — walks past cuttable trails. No defence — trails an exposed wake through contested water. Never exploits its own bridges. Tends to *plateau* in cell count rather than push toward a board win. |
| **Assignment** | **Yellow Bot only**, going forward. `botType: "rambler"`, and the default when `botType` is omitted, so every existing `PlayerConfig` and test keeps its current behaviour. |

### Archetype: the Surveyor (the gradual-looping bot; Red & Green)

The "concentrate on building safe loops to gradually expand their territory" bot.
Built in Phase 3: `src/features/landGrab/surveyorStrategy.ts`, covered by
`src/test/landGrabSurveyorStrategy.test.ts`.

| | |
| --- | --- |
| **Goal** | Grow **one contiguous blob** outward from home by repeatedly closing the *largest loop it can safely close right now*, keeping its wake short and close to owned land so it's rarely cuttable. |
| **Core idea** | Distance is measured to the **nearest owned cell**, not to `home`. The bot hugs the frontier of its own territory one cell out, sweeps a strip, then folds it in. Bigger, chunkier captures than the Rambler; much less exposure. |
| **Emergent play** | Slowly thickening blob spreading out from the start corner. First loops are tiny (the base is the only owned land), each one extends the frontier a little further out. |

**Decision procedure** (`surveyorDecide`) — still greedy one-cell lookahead, plus a
two-value objective mutated in place on `botMemory`:

1. **Objective:** `memory = { type: "surveyor", phase: "extend" | "return", hugSide: Direction | null }`.
   Rebuilt by `createSurveyorMemory()` on spawn and every respawn. `hugSide` is the
   direction owned land lies from the head (cheap 4-way `nearestOwnedDistance` probe),
   recorded each extend tick so the sweep curls instead of drawing a tendril.
2. **Phase arbitration (with hysteresis):** `trail.length === 0` forces `"extend"` (fresh
   leg after a bank/respawn). From `"extend"`, flip to `"return"` when a rival head is
   within `rivalAvoidRadius` **or** the wake is both `>= targetTrailLength` long and its
   bounding box (`estimateEnclosedArea`) is `>= targetTrailLength` — the area gate keeps
   it from folding in a thin degenerate finger. Once `"return"` it stays there until the
   loop banks and `trail` empties.
3. **Exposure guard (hard, extend only):** a move scores `offBoardPenalty`-low if the
   resulting head would be more than `maxTrailExposure` cells from the nearest owned cell
   (bounded BFS), or if it steps 4-adjacent to a living rival head. The Rambler ignores
   both.
4. **Frontier hug (soft):** `+frontierHugBonus` when the target cell is neutral and
   touches own territory — the loop then encloses a thick strip. Plus `+neutralBonus` for
   unclaimed water and a `CURL_BONUS` (`0.5`) nudge toward `hugSide`, a faint
   `-ownedDist * homePull` pull back toward safe land, and `Math.random() * jitter` so
   two Surveyors don't lock-step.
5. **Return leg:** the Rambler's homesick beeline verbatim — score each move
   `-Manhattan(next, home)`, with `closeLoopReward - distance` for stepping onto own
   territory while a trail is out (that dive banks the loop).
6. **Deadlock fallbacks (Surveyor degrading to Rambler recovery, not a separate path):**
   if `trail.length >= 2 * targetTrailLength` the return leg is forced regardless of
   phase; and if on an extend tick *every* candidate scores `<= earlyLoopPenalty` (frontier
   unreachable — boxed in by own wake), it flips to `"return"` and re-scores rather than
   wiggle in place.

**Pure helpers** (exported from `surveyorStrategy.ts`, each unit-tested directly like the
grid/split helpers):

- `nearestOwnedDistance(grid, playerId, cell, maxRadius?)` — bounded 4-connected BFS step
  distance to the closest cell `playerId` owns as territory; `Infinity` past the cap or
  off-board.
- `isFrontierAdjacent(grid, playerId, cell)` — is `cell` neutral **and** 4-adjacent to
  own territory?
- `estimateEnclosedArea(trail, head)` — bounding-box area of the wake plus head; a rough
  "is this loop worth closing" signal only (the real fill is still `resolveCapture`).
- `nearestRivalHeadDistance(state, player)` — Manhattan distance to the closest *other
  living* player's head; `Infinity` if alone.

**Knobs** — four fields added to the flat `BotProfile` (`SURVEYOR_EXTRA_FIELDS`), with
`SURVEYOR_PROFILE_FIELDS` = those four plus every Rambler field except
`homesickTrailLength`. Panel wiring to show only this subset on Surveyor cards is
Phase 4; until then the four sit at their `DEFAULT_BOT_PROFILE` values:

| Field | Default | Effect |
| --- | --- | --- |
| `maxTrailExposure` | `4` | Hard cap on how far the head may get from owned land while extending. Lower → safer, slower growth. |
| `targetTrailLength` | `14` | Wake length (and min bounding-box area) that triggers the return leg. Higher → bigger loops, more risk. |
| `frontierHugBonus` | `3` | Pull toward staying one cell outside own territory. |
| `rivalAvoidRadius` | `3` | Bail to the return leg if a rival head gets this close (Manhattan). |

**Failure modes handled:** boundary `extend`/`return` oscillation (phase only flips on a
clearly-met trigger and latches until the loop banks); never closing because the area
threshold can't be reached (the two deadlock fallbacks in step 6); self-boxing from a bad
curl (`CURL_BONUS` is a sub-`jitter` tie-breaker, and `hugSide` is recomputed every
extend tick).

**Assignment:** **Red Bot** and **Green Bot** → `botType: "surveyor"` in
`PLAYER_CONFIGS`. Yellow is explicitly `botType: "rambler"`, so a default match is "one
roamer vs. two farmers vs. the human".

### Rollout plan

1. **This doc** — agree the archetype list and the `BotStrategy` interface. ✅
2. **Registry refactor, behaviour-neutral.** ✅ Landed. New `botStrategy.ts` holds
   `BotType`, `BotMemory`, the `BotStrategy` interface, `BOT_STRATEGIES` (only `rambler`,
   whose `decide` is the old `decideBotFacing` moved verbatim), `createBotMemory` and
   `strategyFor`. The direction tables (`DELTA` / `OPPOSITE` / `ALL_DIRECTIONS`) moved to
   a dep-free `geometry.ts` so `botStrategy.ts` needs only *type* imports from
   `simulation.ts` — no runtime cycle. `simulation.ts`: `decideBotFacing` is now a
   one-line dispatch to `strategyFor(player.botType).decide(...)`; `PlayerConfig` gained
   optional `botType?: BotType`; `PlayerState` gained `botType` + `botMemory`, seeded in
   `createInitialGameState` and rebuilt in `respawnPlayer`. All prior unit + e2e tests
   pass unedited; `src/test/landGrabBotStrategy.test.ts` covers the new wiring.
3. **Implement `surveyor`.** ✅ Landed. New `surveyorStrategy.ts` (the `BotStrategy` plus
   `SurveyorMemory`, `createSurveyorMemory`, and the four exported pure helpers);
   `botStrategy.ts` widened `BotType`/`BotMemory` and registered `surveyor`;
   `createBotMemory` became a `switch`. `BotProfile` gained the four knobs (union default
   in `DEFAULT_BOT_PROFILE`), with `SURVEYOR_EXTRA_FIELDS` / `SURVEYOR_PROFILE_FIELDS` in
   `botProfile.ts`. `PLAYER_CONFIGS`: Red and Green `botType: "surveyor"`, Yellow explicit
   `"rambler"`. `src/test/landGrabSurveyorStrategy.test.ts` covers the helpers and the
   wiring; all prior unit + e2e tests pass unedited. `BotProfilePanel` still renders every
   `BOT_PROFILE_FIELDS` slider on every driven card — narrowing it to
   `strategyFor(botType).fields` is Phase 4.
4. **Panel support.** Profiles panel shows the archetype name per card and renders only
   that archetype's `fields` (`SURVEYOR_PROFILE_FIELDS` for a Surveyor). Optional: a
   per-bot archetype dropdown so a match can be set to 3× Surveyor, etc.
5. **Later archetypes** (below), once the registry has proven out.

**Game records:** `LandGrabPlayerRecord` could gain `botType` (schema bump to `2`, old
rows still load and just lack the field). Still deferred — the current records viewer is
display-only and doesn't surface archetype.

### Later archetypes (sketch)

Not planned for this pass — listed so the registry interface is designed with room for
them.

| Archetype | Goal | One-line mechanism | Exercises |
| --- | --- | --- | --- |
| **Privateer** | Offence. Win by cutting, not enclosing. | Score toward the nearest rival wake; intercept its projected next cell; only loop home when no cut is reachable. | Trail-cut capture + bridge, third-party split resolution. |
| **Blockader** | Defence / denial. | Hug and wall off a choke so rivals can't expand past it; tiny loops, never far from home. | Long thin territory strips, split resolution when a strip is cut. |
| **Opportunist** | Meta. | Run Surveyor, but switch to Privateer scoring for a few ticks whenever a rival wake is short-and-close. | Strategy switching, `botMemory` phase changes. |

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

Per-player, on `PlayerState.profile` (`src/features/landGrab/botProfile.ts`). Both
archetypes share one flat `BotProfile`; each `BotStrategy.fields` lists the subset its
scorer reads (`BOT_PROFILE_FIELDS` for the Rambler, `SURVEYOR_PROFILE_FIELDS` for the
Surveyor). The panel renders `BOT_PROFILE_FIELDS` on every driven card today; Phase 4
switches it to the per-archetype subset.

**Rambler fields** (also read by the Surveyor except `homesickTrailLength`):

| `BotProfile` field | Default | Effect |
| --- | --- | --- |
| `homesickTrailLength` | `9` | Rambler only. Trail length at which it flips from explore to beeline-home. Higher → bigger, riskier loops. |
| `neutralBonus` | `2` | Preference for unclaimed water over owned cells while exploring/extending. Must stay above `jitter` or neutral-seeking stops being reliable. |
| `jitter` | `0.5` | Upper bound of the random wander added to each explore/extend-mode score. `0` → bots trace near-identical paths from symmetric corners. |
| `homePull` | `0.01` | Weight of the pull back toward home/owned land while exploring/extending (× distance). Raise it to keep the bot hugging its corner. |
| `closeLoopReward` | `1` | Bonus for diving back onto your own **territory** once homesick/returning — the move that closes the loop and banks the capture. |
| `earlyLoopPenalty` | `-20` | Penalty for steering back across your own wake while exploring/extending. More negative → the trail stays untangled. |
| `offBoardPenalty` | `-1000` | Penalty for steering into the (non-lethal) board edge; the Surveyor also reuses it for its hard exposure/rival guards. Only needs to rank below any real move. |

**Surveyor-only fields** (`SURVEYOR_EXTRA_FIELDS`; not yet on a panel slider — sit at the
defaults below):

| `BotProfile` field | Default | Effect |
| --- | --- | --- |
| `maxTrailExposure` | `4` | Hard cap on how far the head may get from owned land while extending. Lower → safer, slower growth. |
| `targetTrailLength` | `14` | Wake length (and min bounding-box area) that triggers the fold-back / return leg. Higher → bigger loops, more exposure. |
| `frontierHugBonus` | `3` | Pull toward keeping the head one cell outside own territory, so the closed loop encloses a thick strip. |
| `rivalAvoidRadius` | `3` | Bail straight to the return leg once a rival head gets this close (Manhattan). |

Match- and presentation-level:

| Knob | Default | Where | Effect |
| --- | --- | --- | --- |
| `rules.respawnDelayTicks` | `12` | `GameState` (panel slider) | Ticks a dead player waits before it's eligible to respawn (still needs a clear 3×3). |
| `TICK_MS` | `160` | `simulation.ts` constant | Sim tick length. |
| speed | `1×` | demo only (`time.timeScale`) | How fast ticks fire; not part of the simulation. |
