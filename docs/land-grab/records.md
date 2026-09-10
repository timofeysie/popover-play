# Land Grab — Match Records

What Land Grab remembers about a finished match, where it lives, and what each
field means. The code is `src/features/landGrab/gameRecord.ts` (the data model +
storage helpers) and `src/features/landGrab/MatchRecordsPanel.tsx` (the table that
renders it). Per-player counters are accumulated during the simulation in
`src/features/landGrab/simulation.ts`.

## Where it's stored

There's no backend. When a match is decided, `LandGrabDemo` calls
`buildGameRecord(state)` and `saveGameRecord(record)`, which prepends the record to
a list in `localStorage` under the key **`landgrab:game-records`**, newest first,
capped at **`MAX_STORED_GAME_RECORDS` (50)**. Older rows fall off the end.

Only the fully-interactive demo records. The `hideControls` preview card on the
dashboard runs the same simulation but never writes a record or pops the game-over
dialog.

Swapping in a real API later means replacing `saveGameRecord` / `loadGameRecords` /
`clearGameRecords` and nothing else.

### Schema version

Every row carries `schemaVersion`. `loadGameRecords` keeps only rows whose version
matches the current one and silently drops the rest, so a shape change never has to
migrate old data — it just invalidates it.

- **v1** — original shape. Recorded each player's cell count *at the final tick*
  and rendered that in the standings column.
- **v2** (current) — keeps every v1 field and adds `peakOwnedCount` /
  `peakOwnedFraction` and `timesCaptured` per player. The end-of-match cell count is
  still stored (`ownedCount`), but the standings column now shows the peak instead,
  because the final count for the winner just repeats the "Cells" column and the
  final count for everyone else is usually 0 (they were sunk). v1 rows already in
  `localStorage` are discarded on the first read after upgrading.

Bumping `schemaVersion` in `gameRecord.ts` discards every locally-stored row on the
next read.

## Record shape (`LandGrabGameRecord`)

| Field | Meaning |
| --- | --- |
| `schemaVersion` | `2`. See above. |
| `endedAt` | ISO-8601 timestamp of when the record was written (≈ when the match ended). |
| `winner` | The winning player, as a `LandGrabPlayerRecord` (see below). |
| `players` | Every player, in `playerOrder`, each a `LandGrabPlayerRecord`. Includes the winner again. |
| `ticks` | Simulation ticks from the opening board to the deciding move. |
| `durationMs` | `ticks * TICK_MS` — *simulated* match length, not wall-clock time. |
| `board` | `{ rows, cols, totalCells }` of the board this match was played on. |
| `rules` | The `GameRules` in effect (currently just `respawnDelayTicks`). |

A match is only recorded once it has a winner — either one player holds every cell,
or one player is the last afloat with no room left for the eliminated to respawn.
`buildGameRecord` throws on an undecided state, so draws can't be logged.

## Per-player shape (`LandGrabPlayerRecord`)

| Field | Meaning |
| --- | --- |
| `id`, `label`, `color` | Identity. `label` is the human's chosen username or the bot's fixed name; `color` is `#rrggbb`. |
| `isBot` | True for the computer boats. |
| `autopilot` | True if this player was being driven by the bot brain (always true for bots; true for the human only if they toggled autopilot on). |
| `ownedCount` | Cells held **at the final tick**. For the winner this equals the "Cells" column; for a sunk player it's usually `0`. |
| `ownedFraction` | `ownedCount / board.totalCells`, `0..1`. |
| `peakOwnedCount` | **High-water mark** — the most cells this player held at the end of any single tick during the match. This is what the standings column shows. |
| `peakOwnedFraction` | `peakOwnedCount / board.totalCells`, `0..1`. |
| `captures` | Times **this player cut a rival's trail** and seized their land. |
| `timesCaptured` | Times **a rival cut this player's trail** and sank them — counted whether or not this player went on to win. The mirror of `captures`. |
| `alive` | Whether this player was afloat at the final tick. |
| `profile` | The `BotProfile` decision parameters this player was running when the match ended. |

### How the counters accumulate

All three per-player stats live on `PlayerState` and are carried tick to tick by
`stepGame`:

- **`peakOwnedCount`** — seeded to the opening base size in
  `createInitialGameState`, then after every tick recomputes `ownedCount` and bumps
  the peak if the new count is higher. It never decreases, so losing land to a
  rival's capture loop doesn't lower it.
- **`captures`** — incremented on the aggressor when a trail cut resolves (existing
  behaviour, unchanged).
- **`timesCaptured`** — incremented on the victim in the same trail-cut branch, so
  `sum(captures)` across all players always equals `sum(timesCaptured)`.
  - **Not counted:** a player whose entire territory gets swallowed by someone
    else's capture loop is also sunk (`alive` goes false, respawn scheduled), but
    there's no single "who did it", so this does not add to `timesCaptured`. Only a
    direct trail cut does.

## What the panel shows (`MatchRecordsPanel`)

One row per stored match, newest first:

- **When** — local date + time from `endedAt`.
- **Winner** — colour dot + label.
- **Cells** — the winner's final `ownedCount` and percentage.
- **Captures** — the winner's `captures` (rival trails they cut).
- **Ticks** / **Time** — `ticks` and `mm:ss` of `durationMs`.
- **Board** — `cols`×`rows`.
- **Standings (peak cells · times sunk)** — every player, sorted by
  `peakOwnedCount` descending. Each entry is `label — peakOwnedCount (peak%) peak`,
  followed by `· sunk N×` when `timesCaptured > 0`.

"Refresh" re-reads `localStorage`; "Clear all" removes the key.
