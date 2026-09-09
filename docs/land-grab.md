# Land Grab — Plan

A real-time multiplayer territory-capture game (Paper.io-style), built on Phaser 3.
Its real purpose: turn the DFS/BFS/Union-Find solution from
[`docs/problems/Number-of-Islands.md`](problems/Number-of-Islands.md) into the game's
core mechanic instead of a static algorithm demo — flood-fill and connected-component
counting *are* the capture and elimination logic, not just a visualization.

## Table of contents

- [Theme](#theme)
- [Core loop](#core-loop)
- [Implemented rules (Phase 0 demo)](#implemented-rules-phase-0-demo)
- [Algorithm mapping — this is the point of the project](#algorithm-mapping--this-is-the-point-of-the-project)
- [Grid & movement model](#grid--movement-model)
- [Elimination rules](#elimination-rules)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Tech stack](#tech-stack)
- [Where this lives in the repo](#where-this-lives-in-the-repo)
- [Milestones](#milestones)
- [Open questions](#open-questions)

## Theme

Players are boats claiming ocean grid squares as land. You start on a small island
(your base). Sailing off your own territory leaves a wake (trail) behind you; sailing
back onto your own territory closes the loop and everything the loop encircled — trail
included — becomes new land. Touch anyone's wake (including your own) before it closes
and you sink.

Same shape as Paper.io/`land-grab`-style mobile games, but movement is grid-discrete
(4-directional, one cell per tick) rather than continuous, so the whole simulation is
literally the grid graph from the Number of Islands write-up: cells are nodes, edges are
the four orthogonal neighbors.

## Core loop

1. Each player owns a `playerId`, a home/spawn cell, and a set of owned cells (their
   territory — starts as a small connected blob, e.g. a 3×3 block).
2. Each tick, a player moves one cell in their current facing direction (up/down/left/right).
3. Moving onto an **unowned** cell paints it as that player's **trail** and advances.
4. Moving onto a cell that is **already your own territory**, while you have an active
   trail, **closes the loop** → run the capture fill (below), converting the trail plus
   everything it encircled into territory, then clear the trail.
5. Moving onto **any trail cell** (yours or an opponent's) **eliminates** you (see
   [Elimination rules](#elimination-rules)).
6. Score = total owned cell count. Optional match end: time limit or last-player-standing.

## Implemented rules (Phase 0 demo)

This section documents what `src/features/landGrab/` actually does today: a local,
single-machine "you vs. three bots" prototype. Where it differs from the
[Core loop](#core-loop) and [Elimination rules](#elimination-rules) written elsewhere in
this plan, those are the older intent and **this section is the source of truth**.

### Board & players

- Rectangular grid of cells, each `neutral`, `territory(playerId)`, or `trail(playerId)`.
  The demo defaults to **16 rows × 24 columns**. A full-screen toggle rebuilds the board
  large enough to fill the browser window; because the cell count changes, toggling
  **restarts the match**.
- **Four players:** *You* (cyan, keyboard-controlled) plus three bots (red, yellow,
  green). All four obey identical rules — the only difference is who chooses the moves.
- Everyone starts alive with a solid **3×3 territory base** (`BASE_RADIUS = 1`). Bases
  1–4 are placed in the four corners, inset from the edges by
  `max(2, floor(rows / 5))` rows and `max(2, floor(cols / 5))` columns. A hypothetical
  5th+ player falls back to a free 3×3 found by scanning outward from board centre.
- **Score** is your current territory-cell count. The leaderboard lists all players
  sorted by score, highest first (a right-hand panel on viewports ≥ 1400 px, otherwise
  an inline row under the board).

### Turn & movement

- The simulation advances on a fixed tick, `TICK_MS = 160` (~6 ticks/second).
- Each tick, every player that is **alive and has started** moves exactly one cell in its
  facing direction — up, down, left, or right. No diagonals; no voluntarily standing
  still; never more than one cell per tick.
- **Input is buffered.** A key press (you) or a bot's decision sets a *queued* facing
  that takes effect on the next tick. Only the most recent queued turn is kept.
- **No 180° flip onto your own wake.** A reversal straight back the way you came is
  ignored while you have a live trail.
- **Human start gate.** Your boat sits on its base and does not move until your first
  Arrow/WASD press. Bots start moving on tick 1. After a respawn the gate re-arms for
  you (bots resume immediately).
- Direction inputs while you are dead are ignored.

### What happens when you move onto a cell

Resolved player-by-player in a fixed order each tick:

| Target cell | Result |
| --- | --- |
| **Neutral** | Painted as your trail; you advance onto it. |
| **Your own territory**, no live trail | You simply move onto it. |
| **Your own territory**, with a live trail | **Loop closes** → capture fill (below), then advance. |
| **Your own trail** | **Loop closes** — same capture as re-entering your own land. This is *not* a death. (Deviates from classic Paper.io and from [Elimination rules](#elimination-rules) above.) |
| **An opponent's trail** | That opponent is **eliminated** (below); their trail is wiped to neutral; your kill count increments; you advance onto the now-neutral cell, laying trail. |
| **An opponent's territory** | Currently overwritten with your trail — you can plow straight through enemy land, turning each crossed cell into your wake. (The plan wanted this treated as a wall; the demo does not do that yet.) |
| **Off the board edge** | **Not a death.** You hold position for the tick, still facing the wall, so you keep sitting still until you steer to a direction that stays on the board (a bot re-picks next tick). |

### Capture fill & territory splits

When a loop closes:

1. **Capture fill** (`resolveCapture`) — flood from every border cell through anything
   that is not your trail/territory. Your entire trail, plus every cell the flood cannot
   reach, becomes your territory. A pocket of an opponent's land is swallowed whole if
   your loop sealed it off completely.
2. **Split resolution** (`resolveTerritorySplit`, run once for each *other* player) —
   scan that player's remaining territory into connected components and keep exactly
   one; every other fragment reverts to neutral. The keeper is the component holding
   that player's **piece** (their head), falling back to the one holding their home
   base, and — if by now they own neither cell (base captured long ago, currently
   trailing across open ground) — to their largest remaining fragment, so a roaming
   leader isn't wiped by a nick on the far side of the map. This is the `numIslands`
   scan restricted to one player's cells.

Your trail is then cleared and your head sits on the cell you just entered (now your
territory).

### Elimination & respawn

- **Elimination** (stepping onto an opponent's trail): your `alive` flag goes false,
  your in-progress trail reverts to neutral (territory you already owned is untouched),
  and a respawn is scheduled for `RESPAWN_DELAY_TICKS = 12` ticks later.
- **A kill re-runs split resolution for everyone.** Because a trail can be plowed
  straight through enemy land, wiping the dead player's trail back to neutral can
  leave a chunk of some *other* player's territory cut off from their piece with no
  loop ever having closed. So after any elimination the game runs
  `resolveTerritorySplit` for every player, the same pass a capture triggers, and
  any now-orphaned fragment reverts to neutral.
- **Respawn needs a clear 3×3.** When the timer is up, the game looks for a fully-neutral
  3×3 pocket, scanning outward from your old home. If none exists yet you **stay dead**,
  and it re-checks every tick until one opens up (freed by a later capture, split, or
  another player dying). Only then do you get a fresh 3×3 base at that spot, facing up,
  with the human start gate re-armed.

### Bots

Each tick, every living bot scores its candidate directions (all four except a straight
reversal) and takes the best:

- **Off the board** → heavily penalised (it would only waste a tick holding still).
- **Onto its own trail** → attractive once the trail is long enough to be worth banking
  (`BOT_HOMESICK_TRAIL_LENGTH = 9`+ cells), avoided while the trail is short.
- Once the trail reaches 9+ cells the bot turns **homesick** and simply heads for its
  home cell (minimise Manhattan distance).
- Otherwise it prefers unclaimed neutral cells, with a slight pull back toward home and a
  little random jitter so the three bots don't move in lockstep.

Net behaviour: a bot sails out into open water, then after roughly nine cells of wake
heads back to close its loop and bank a modest capture.

Each of the four scoring numbers is a field of a per-player **`BotProfile`**
(`src/features/landGrab/botProfile.ts`); all players start on `DEFAULT_BOT_PROFILE` and
the demo's Profiles panel edits each independently and live. See
[`docs/land-grab/bots.md`](land-grab/bots.md) for the full breakdown, including why a
stationary player at one corner biases the standings.

### Demo controls & display

- **Arrow keys** or **WASD** steer your boat.
- **Restart** starts a fresh match.
- **Pause** (or <kbd>Space</kbd>) freezes the tick loop; **Step** (or <kbd>.</kbd>)
  advances exactly one tick while paused; a **Speed** selector runs the loop at
  0.25×–4×. None of these change the simulation, only how often it steps.
- **Profiles** opens a panel with a card per player: live sliders for every bot's
  `BotProfile` fields plus the match-level respawn delay, per-card and global **Reset**,
  and an **Autopilot** toggle on *You* that hands your boat to the same `decideBotFacing`
  scorer with its own editable profile.
- **Full screen** (in the leaderboard panel) expands the grid to fill the window;
  because the cell count changes, toggling restarts the match. **Esc** exits.

## Algorithm mapping — this is the point of the project

Everything below reuses the exact base-case-and-recurse shape from
`depthFirstSearch(row, col)` in the Number of Islands doc: bounds/state check → mark
visited → recurse on the four neighbors. Only the *seed cells* and *what "visited" means*
change per use.

### 1. Capture fill = "flood from the border" (Surrounded Regions variant)

The islands doc sinks land reachable from a starting `'1'`. Capture fill inverts the
seed: flood-fill from **every grid border cell**, through any cell that is not the
closing player's trail/territory, marking each as "open water." Any cell the flood
*never reaches* is enclosed. Enclosed cells + the trail itself flip to the player's
territory in one pass.

```ts
function floodFromBorder(row: number, col: number, openWater: boolean[][]): void {
  if (row < 0 || row >= rowCount || col < 0 || col >= colCount) return;
  if (openWater[row][col] || isPlayerTrailOrTerritory(row, col)) return;
  openWater[row][col] = true; // "visited" — same role as sinking a '1' to '0'
  floodFromBorder(row - 1, col, openWater);
  floodFromBorder(row + 1, col, openWater);
  floodFromBorder(row, col - 1, openWater);
  floodFromBorder(row, col + 1, openWater);
}
// After running from all border cells: any cell that is neither openWater
// nor already the player's own territory, but is reachable only through the
// region the trail just closed off, becomes new territory.
```

This is run **server-side, once per loop closure** (an event, not every tick), so a
full-grid recursion is affordable even on a fairly large board.

### 2. Number of Islands = split/cut resolution

Paper.io's signature moment: an opponent's trail slices through the *middle* of your
territory, and the piece no longer connected to your base peels off. That's exactly
`numIslands`, restricted to one player's owned cells:

- Scan the player's owned cells; DFS/sink each connected component, same as the doc's
  outer loop + `depthFirstSearch`.
- The component containing the player's **home cell** stays theirs.
- Every other component becomes neutral (or is awarded to whichever opponent's trail
  caused the cut) — same "count connected components, treat everything outside the
  keeper component as lost" logic, just applied to captured land instead of `'1'`s.

Triggered whenever a trail-cut event removes territory cells from the middle of a
player's land (see [Elimination rules](#elimination-rules)) — not every tick.

### 3. BFS = the capture animation

The doc's BFS variant ("explore the island level-by-level with a queue") is used
**client-side only**, purely for presentation: once the server says "these N cells are
newly captured," the client reveals them ring-by-ring outward from the trail using a
queue, so a big capture visibly ripples across the board instead of popping in at once.
Same queue-and-4-neighbors code as the doc's BFS solution, driving a paint animation
instead of a count.

### 4. Union-Find = incremental "am I still connected to home" bookkeeping

Full re-scans (#2) only need to run on cut events. Between cuts, the server can
maintain a Union-Find over each player's owned cells (union neighbors as territory is
captured) to answer "is cell X connected to my home" in near-O(1) without a rescan.
Union-Find can't cheaply *un-merge* on a cut, so a cut still triggers a full DFS rescan
for that player's component — Union-Find is an optimization for the common case
(capturing), not a replacement for #2.

## Grid & movement model

- Grid: fixed size per match (e.g. 60×40 cells), each cell one of
  `neutral | owned(playerId) | trail(playerId)`.
- Movement: 4-directional, one cell per server tick (~150–200ms/tick to start —
  slower than a real-time shooter, fast enough to feel alive; tune after playtesting).
- Direction changes queue for the next tick (classic snake-game input buffering) —
  no 180° reversal onto the trail you just laid.
- No diagonal movement, matching the doc's 4-neighbor model exactly (the doc calls out
  8-connectivity as a variant — deliberately not used here, to keep capture fill and
  cut-detection identical to the reference algorithm).

## Elimination rules

- Moving onto **any** trail cell (yours or an opponent's) → you sink. Your trail clears,
  you respawn after a short delay with a small fresh territory blob elsewhere on the
  board. (Standard Paper.io: self-crossing your own wake kills you too.)
- Moving onto an opponent's trail additionally **destroys their trail** at the crossing
  point onward — the classic "cut the other player's tail" kill. Their in-progress
  capture is voided; any territory they already owned is untouched (no cut-resolution
  needed since a voided trail was never converted to territory).
- Cutting through *existing owned territory* (not a trail) never happens — you can only
  ever walk onto neutral cells (leaves a trail) or your own territory (closes a loop) or
  someone's trail (a kill/death event); walking onto an opponent's *territory* cell is
  disallowed/treated as a wall, so cuts only happen via the trail-crossing rule, not by
  driving through someone's land.

## Architecture

Server-authoritative, matching why the algorithm work has to happen server-side: a
client that computed its own captures could just lie about them.

- **Server** (Node.js, one process per match/room): owns the canonical grid, runs the
  tick loop, resolves moves in a fixed order per tick, runs the capture fill and
  cut-resolution scans, broadcasts state diffs.
- **Client** (Phaser 3 scene inside a React page, same pattern as this repo's other
  feature demos): sends "I'm now facing `<direction>`" on input, renders the grid from
  server snapshots/diffs, runs the BFS reveal animation locally for newly captured
  cells.
- **Transport**: WebSocket (`ws` on the server; native `WebSocket` or `socket.io-client`
  on the client). Snapshot-on-join + delta-per-tick, not full-grid-per-tick, once the
  grid is larger than trivial.
- **Rooms/matchmaking**: start with one fixed room ("the lobby") for the prototype;
  proper matchmaking is a later milestone.

## Data model

```ts
type CellState =
  | { kind: "neutral" }
  | { kind: "territory"; playerId: string }
  | { kind: "trail"; playerId: string };

interface PlayerState {
  id: string;
  homeCell: { row: number; col: number };
  headCell: { row: number; col: number };
  facing: "up" | "down" | "left" | "right";
  queuedFacing?: "up" | "down" | "left" | "right";
  alive: boolean;
  ownedCellCount: number; // score
}

interface MatchState {
  rowCount: number;
  colCount: number;
  grid: CellState[][];
  players: Record<string, PlayerState>;
  tick: number;
}
```

## Tech stack

- **Phaser 3** for rendering/input — a `Phaser.Scene` per match, grid drawn as a
  `Graphics`/tilemap layer, re-painted from state diffs (not a physics-driven scene;
  this is a discrete simulation, Phaser is doing presentation + input capture).
- **React** wrapper page (`src/pages/LandGrab.tsx`) that mounts/unmounts the Phaser game
  instance, matching how every other route in this app is a thin page wrapper around a
  `src/features/<name>` module.
- **Node.js + `ws`** for the authoritative server. Plain `ws` is enough at this scale;
  no need for Colyseus/socket.io unless matchmaking complexity grows later.
- **Pure grid/algorithm functions** (`floodFromBorder`, `numIslands`-style split
  resolution, BFS reveal order) written as plain TypeScript with no Phaser or network
  dependency, shared between server and client-side animation code, and unit-tested the
  same way `computeSteps` is tested elsewhere in this repo (`src/test/`).

## Where this lives in the repo

This repo is a Vite SPA with no backend today — a WebSocket game server doesn't fit the
existing `npm run dev` / static-build model. Recommended split, in phases:

1. **Phase 0 (this repo):** Build the algorithm core and a single-player/local
   "vs. simple bots" prototype entirely client-side, as `src/features/landGrab/`
   following the existing feature-module pattern (pure, tested `floodFromBorder` /
   split-resolution functions in the barrel; a Phaser-in-React demo component consuming
   them). This validates the fun/feel of the capture and cut mechanics before any
   networking exists, and gives the pure logic full unit-test coverage up front.
2. **Phase 1 (new `server/` folder in this repo, run via a separate `npm run dev:server`
   script):** Wrap the same pure functions in an authoritative tick loop + `ws` server,
   swap the client's bots for real WebSocket opponents.
3. **Phase 2 (deploy):** Host the server (Fly.io/Render/Railway are reasonable, low-effort
   options); point the built client at it in production; add matchmaking/rooms, a
   leaderboard, and mobile touch controls (swipe → direction, mirroring Paper.io's mobile
   input).

## Milestones

- [ ] `src/features/landGrab/grid.ts` — pure grid types + `floodFromBorder` capture fill,
      unit tests mirroring `docs/problems/Number-of-Islands.md`'s example grids.
- [ ] `src/features/landGrab/splitResolution.ts` — pure `numIslands`-style scan that,
      given a player's owned cells + home cell, returns which cells to strip on a cut.
- [ ] `src/features/landGrab/LandGrabDemo.tsx` — Phaser scene in React, single player +
      simple bots, driven entirely by the pure functions above.
- [ ] Wire into `src/App.tsx` / `src/pages/Index.tsx` exercises list per this repo's
      "adding a new exercise" steps, so it's reachable from the nav like any other demo.
- [ ] BFS reveal animation for captures (client-side only).
- [ ] `server/` — tick loop + `ws` room hosting the same pure functions, authoritative
      state, snapshot/delta protocol.
- [ ] Swap client bots for real multiplayer once the server exists.
- [ ] Deploy server; matchmaking/rooms; mobile touch controls; leaderboard.

## Open questions

- **Grid size & tick rate** — start at 60×40 / ~150ms tick as a guess; needs playtesting
  to tune for "feels responsive" vs. "server load stays cheap."
- **Bot difficulty for Phase 0** — simplest useful bot is "walk toward the nearest
  unclaimed cell, turn back toward home after N steps"; good enough to validate capture
  fill without needing real AI.
- **Respawn behavior** — fixed slot vs. random open cell; affects fairness late in a
  match when the board is mostly claimed.
- **Hosting choice for Phase 2** — deferred until Phase 0/1 prove the mechanic is fun;
  no need to decide now.

## Status

**Phase 0 is built.** The local "you vs. three bots" prototype exists in
`src/features/landGrab/` (pure grid/simulation logic with unit tests in `src/test/`, plus
the Phaser-in-React demo) and is wired into the nav. See
[Implemented rules (Phase 0 demo)](#implemented-rules-phase-0-demo) for how the game
actually plays today. The plan text above is kept as the original design intent; the
networked phases (authoritative `ws` server, real multiplayer, deploy) are still ahead.
