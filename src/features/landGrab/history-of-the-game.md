# History of the Land Grab Genre

Land Grab's core loop — draw a trail outside your territory, close the loop to claim
the enclosed area, get eliminated if anyone cuts your trail first — isn't new. It's a
45-year-old arcade idea that keeps getting re-skinned as hardware and networks change.
This is a brief tour of that lineage, for context on why the DFS/BFS solution from
[`docs/problems/Number-of-Islands.md`](../../../docs/problems/Number-of-Islands.md)
mapped onto a game so cleanly: this genre has always been a flood-fill/connected-
components problem wearing a game's clothing.

## The arcade originator: Qix (1981)

**Qix**, released by Taito, is the usual starting point for this family tree. The
player moves a marker along the edges of a rectangular field and drags a line ("Stix")
out into open space; completing the line seals off a section of the field, which fills
in as claimed territory. Two threats punish slowness: the **Qix** itself, an erratic,
color-shifting line-shape that destroys you if it touches your unfinished line, and
**Sparx**, sentries that patrol the field's claimed/unclaimed boundary looking for an
unfinished line to cut. Clear a set percentage of the field to advance. Nearly every
mechanic in this doc — claim-by-enclosure, death-by-having-your-line-cut, a
percentage-of-board win condition — traces back to this one game.

## Clones and reinventions (1980s–90s)

- **Xonix** (1984) — a widely bootlegged game of Soviet/Eastern Bloc origin (its
  authorship is murky; it circulated on countless unofficial ports) that put its own
  spin on Qix: instead of one erratic shape, there's a ball bouncing around the
  *unclaimed* outer area and a worm-like enemy wandering the *unclaimed* inner area.
  Claiming territory shrinks the enemies' roaming room rather than requiring a hard
  percentage. Xonix was enormously influential in Eastern Europe and spawned its own
  wave of shareware clones independent of Taito's lineage.
- **Volfied** (Taito, 1989) — Taito's own follow-up, reskinning the Qix formula as a
  sci-fi shooter: a ship claims sections of an alien planet's surface while shooting
  roaming enemies instead of just dodging them.
- **Gals Panic** (Kaneko, 1990) and its many sequels — reused the exact Qix mechanic as
  a "reveal the picture" game: claiming area uncovers an image underneath instead of
  just scoring points. Commercially notable (including a run of adult-content
  variants) and part of why the genre stayed alive in Japanese arcades through the 90s.
- **JezzBall** (bundled in Microsoft Entertainment Pack 3, 1992) — the mechanic most
  people from the Windows 95/98 era actually grew up with. Rather than drawing an
  arbitrary loop, you fire straight walls across the field to pen bouncing balls into
  progressively smaller rooms; touching a ball mid-draw destroys the wall instead of
  killing you outright. Same "enclose territory, timing is everything" DNA, simplified
  to two wall directions.
- **Rampart** (Atari Games, 1990) is often mentioned alongside these but is only a
  cousin, not a direct ancestor — you build and defend castle walls with artillery
  rounds between phases, no line-drawing/cutting mechanic. Worth knowing as a
  contemporary "claim and defend territory" game from the same arcade era.

## The io-game/hyper-casual revival (2016–2018)

After **Agar.io** (2015) and **Slither.io** (2016) proved real-time multiplayer browser
games could go viral, several developers rebuilt the Qix/Xonix enclosure mechanic as
head-to-head PvP instead of a single-player-vs-the-board puzzle:

- **Splix.io** — a browser `.io` game with continuous grid movement, a visible trail
  the moment you leave your own territory, and elimination if any other player's head
  touches your trail — functionally Xonix's "cut the trail" idea made explicitly
  multiplayer.
- **Paper.io** / **Paper.io 2** — the mobile hit that brought this mechanic to a mass
  audience during the 2017–2018 hyper-casual boom (published under Voodoo's
  hyper-casual label), first as single-player-vs-bots, later adding real multiplayer.
  This is the game Land Grab is most directly modeled on, and the one namechecked in
  the [design doc](../../../docs/land-grab.md).
- **Territorial.io** — a related but distinct branch: large-scale, many-player
  territorial conquest by attrition rather than trail-drawing, closer to a real-time
  Risk than to Qix, but sharing the "claim contiguous grid cells" core.

Paper.io's popularity in turn spawned a long tail of near-identical clones across app
stores — a genre cycle (arcade original → home clones → mobile mass-market clone) this
family of games has now been through twice.

## The throughline

Every generation of this genre is solving the same problem: **given a boundary someone
just drew, which cells are enclosed?** That's a flood fill from the outside in, exactly
`floodFromBorder` in [`grid.ts`](./grid.ts) — and "did cutting through the middle of my
territory split it into pieces?" is `numIslands` again, restricted to one player's
cells, exactly [`splitResolution.ts`](./splitResolution.ts). The graphics and the
threat model changed six times over 45 years; the graph algorithm underneath didn't.
