# Land Grab — Replays

A frame-by-frame recording of the match in progress, kept so you can scrub back
through a finished game and debug the capture / territory-split algorithm. The
code is `src/features/landGrab/replayLog.ts` (the data model + the pure
record/reconstruct helpers), `src/features/landGrab/LandGrabReplay.tsx` (the
canvas viewer), and the wiring in `src/features/landGrab/LandGrabDemo.tsx` (start
a log per match, feed it each tick, freeze it at game over).

This is a companion to [Match Records](./records.md). The two are separate
systems: a **record** is the one-row summary of a finished match that persists in
`localStorage`; a **replay** is the full tick-by-tick history that only lives in
memory.

## Where it's stored

Nowhere. A `ReplayLog` is held in a `useRef` while the match runs and copied into
React state (`replay`) when the match is decided. It is never written to
`localStorage` — a full frame log is far too big, and `gameRecord.ts` already
owns the durable summary. Close the tab and the replay is gone.

`replay` is deliberately **kept across restarts** so the "Replay" button and the
game-over dialog's "Watch replay" stay useful after the board resets; the next
finished match overwrites it.

Only the fully-interactive demo records. The `hideControls` preview card on the
dashboard runs the same simulation but `replayLogRef` stays `null`, so it does no
recording.

## The frame model

`ReplayLog.frames` is one entry per tick, starting at tick 0.

- **Frame 0** carries the entire opening grid — every cell listed in
  `cellChanges` — plus each player's starting state.
- **Every later frame is a delta**: only the cells whose `kind` or `playerId`
  changed since the previous frame. A boat moving through its own territory
  records *zero* cell changes; a capture loop resolving records a burst of them.
  This keeps a long match on a big full-screen board to a few MB.

`frameGridAt(log, i)` rebuilds the full grid shown at frame `i` by starting from
an empty grid and replaying every frame's `cellChanges` from 0 up to `i`. The
index is clamped into range.

### The tick cap

`MAX_REPLAY_TICKS` (3000) is a safety ceiling on a runaway game. Once
`frames.length` reaches it, `recordFrame` sets `log.truncated = true` and
**stops** — earlier frames are kept, never overwritten, so the frame where
something first went wrong always survives. A normal match ends in a few hundred
ticks and never comes near the cap; the viewer shows a "capped" note if it does.

## `ReplayLog` shape

| Field | Meaning |
| --- | --- |
| `rowCount`, `colCount` | Board dimensions for this match (constant for its lifetime). |
| `playerOrder` | Player ids in turn order, copied from `GameState`. |
| `playerMeta` | `{ [id]: { label, color, isBot } }` — static display info captured once so the viewer needs no live state. `color` is packed `0xRRGGBB`, same as `PlayerState.color`. |
| `frames` | One `ReplayFrame` per recorded tick, oldest first. |
| `truncated` | `true` once `MAX_REPLAY_TICKS` was hit and later ticks were dropped. |
| `runningGrid` | Scratch reconstruction of the latest frame's grid, used only while recording to diff the next tick. Rebuildable from `frames`, so it can be dropped before serialising. |

### `ReplayFrame`

| Field | Meaning |
| --- | --- |
| `tick` | The simulation tick this frame captures. |
| `cellChanges` | `{ row, col, cell }[]` — cells that differ from the previous frame. Frame 0 lists every cell. |
| `players` | `{ [id]: ReplayPlayerFrame }` for every player in `playerOrder`. |
| `winnerId` | The winner's id once the match is decided on this frame, else `null`. |

### `ReplayPlayerFrame`

| Field | Meaning |
| --- | --- |
| `head` | The boat's head cell at the end of this tick. |
| `facing` | The direction actually applied this tick — the resolved move, not the queued one. |
| `trail` | Live wake cells, in the order they were laid. |
| `alive` | Whether the boat was afloat at the end of this tick. |
| `ownedCount` | Territory cells held at the end of this tick. |
| `respawnAt` | Tick this player becomes eligible to respawn, or `null` if alive / not waiting. |

## How recording is wired

In `LandGrabDemo.tsx`:

1. **Start** — the effect that builds the Phaser game calls
   `createReplayLog(initialState)` and stores it in `replayLogRef`
   (`null` when `hideControls`). Frame 0 is recorded here.
2. **Each tick** — the scene's `onTick(state)` callback calls
   `recordFrame(replayLogRef.current, state)` before anything else, so the
   deciding tick is captured. `recordFrame` no-ops if the incoming `tick` isn't
   newer than the last frame, which covers the frozen post-game state being
   re-delivered every tick.
3. **Game over** — in the same `winnerId` branch that writes the match record,
   `setReplay(replayLogRef.current)` freezes the log into state. After `winnerId`
   is set `stepGame` returns the same frozen object every tick, so no more frames
   are appended and the state/ref aliasing is safe.

## The viewer (`LandGrabReplay`)

A pure viewer over one `ReplayLog` — it never touches the live simulation, so
it's safe to mount while a fresh match runs.

- **Board** — a `<canvas>` redrawn on every frame change, mirroring
  `LandGrabScene.draw()` exactly (dark ground, territory at 0.9 alpha, trail at
  0.4, grid lines, a white head marker ringed in the player's colour). No second
  Phaser instance. Cell size defaults to a fit that keeps the board ~520px wide.
- **Transport** — Play/Pause, single-step ◀▶, a 0.5–4× speed select (playback
  advances one frame per `TICK_MS / speed`), and a frame scrubber. Any manual
  step or scrub pauses playback.
- **Per-player row** — colour dot, label, `ownedCount`, and the current
  `facing` (or `sunk`) at the shown frame — the debugging payload. A note under
  it names the winner on the frame the match is decided.

It is reachable two ways: the "Replay" toggle in the controls row (disabled until
a match has finished) and the "Watch replay" action in the game-over dialog
(which also cancels the windowed-mode 5-second auto-restart).

## Later: true algorithm re-execution

This replay renders *recorded* frames. It does not re-run `stepGame`, so you
can't set a breakpoint in the capture code and step the real algorithm through a
recorded match. Two things block that today:

- **Randomness** — `botStrategy.ts` and `surveyorStrategy.ts` both add
  `Math.random() * jitter` to their move scores, so re-running from the opening
  state produces a different match. A seeded PRNG stored on `GameState` would fix
  this.
- **Human input** — the human's moves come from keydown events, not from
  `stepGame`. A `facingOverrides` param on `stepGame` (id → forced direction)
  would let a replay feed recorded facings back in.

With both, a replay could be just `{ seed, configs, humanFacings }` — small
enough to persist next to the match record — and "fork from tick N" and
seed-plus-input regression fixtures become possible. Out of scope for the
snapshot recorder documented here.

## Tests

`src/test/landGrabReplayLog.test.ts` covers the pure module: frame 0 captures the
full grid and player meta, `recordFrame` appends deltas rather than whole boards,
`frameGridAt` reconstructs the exact live `state.grid` at every recorded frame, a
repeated call for the same tick is ignored, and recording stops at
`MAX_REPLAY_TICKS` without overwriting. The canvas viewer isn't unit-tested
(jsdom has no real 2D context).
