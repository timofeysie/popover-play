# Context management

The limits described in [Threshold Decay and Other Instruction Limits](/attention-limits) — threshold decay, attention dilution, attention sinks, lost-in-the-middle, the Dumb Zone, context rot — aren't bugs you can prompt your way around — they're structural consequences of how softmax attention works (fixed attention mass split across every token, quadratic pairwise cost as the sequence grows). That means the fix isn't "phrase it more carefully so the model prioritizes correctly" — it's controlling what goes into context in the first place, since nothing you say inside an already-overloaded context reliably escapes the effects on it. The sections below map each mechanism from that doc to a concrete practice for working with Claude Code, plus how the same principles carry over to Cursor.

## Cheat-sheet

- `/context` see the number of tokens in the current context
- `/clear` start a new context
- `/compact` manually compresses your long conversation history into a focused summary to free up tokens in your context window
- `resume` pick up where you left of with a previous context session


## Keep CLAUDE.md and prompts short

Attention dilution is zero-sum: every rule you add competes with every other rule for the same fixed attention budget, including the ones you actually care about. A 40-line `CLAUDE.md` doesn't just risk rule #38 being ignored — it also weakens compliance with rule #2.

- **Cut rules that are implied by the code itself.** If the linter already enforces something, or the pattern is obvious from reading two files in the codebase, it doesn't need a line in `CLAUDE.md` — that's attention spent on something derivable, not something that needs to be told.
- **Prefer one precise rule over three overlapping ones.** "Always use TypeScript and never use `var` and prefer `const` over `let`" reads as three competing instructions; "use modern TypeScript idioms" is one.
- **When a rule stops mattering, delete it** rather than letting the file only grow — a stale rule still costs attention budget even though it no longer does anything useful.

## Put what matters first, reinforce it at the end

Attention sinks mean the first tokens in a sequence get disproportionate weight regardless of content, and lost-in-the-middle means the middle of a long prompt is the least reliable place for anything to land. Combined, they describe a U-shaped reliability curve over position, not over importance.

- **Lead `CLAUDE.md` and system prompts with the rules you'd be angriest to see violated**, not with setup/context. Position is doing real work here — the same sentence is followed more reliably at the top of the file than three paragraphs in.
- **Reinforce anything critical near the end of a long prompt, not just the start** — this is "the repetition hack": a second copy of the instruction, placed after the bulk of the context, gets full attention over everything that precedes it. Don't rely on having said something once at the top of a long session.
- **Treat the middle of a long document as the place instructions go to die.** If a rule can only fit mid-document, expect it to be followed inconsistently — that's a signal to either move it or shorten what surrounds it, not to word it more emphatically.

## Watch usage and reset before the Dumb Zone

Past roughly 40% of a context window's capacity, compliance and coherence start drifting — not because the window is full, but because token-to-token attention scales quadratically, so every added token makes every other token marginally harder to attend to. `/context` shows exactly where a session sits against that line:

```
❯ /context
  Context Usage
  ⛁ ⛁ ⛁ ⛀ ⛀ ⛁ ⛁ ⛁ ⛀ ⛶   Sonnet 5
    67.1k/967k tokens (7%) <-- % of context window
  Estimated usage by category
  ⛁ System prompt: 9.5k tokens (1.0%)
  ⛁ System tools: 19.7k tokens (2.0%)
  ⛁ Memory files: 1.8k tokens (0.2%)
  ⛁ Skills: 2.2k tokens (0.2%)
  ⛁ Messages: 33.9k tokens (3.5%)
  ⛶ Free space: 866.9k (89.6%)
  ⛝ Autocompact buffer: 33k tokens (3.4%)
```

In the above details, the *67.1k/967k tokens (7%)* line is the one that maps to the doc's "40% of context window" — 967k (labeled "Auto-compact window") is the denominator Claude Code uses for that top-line percentage, so it's the same "context window capacity" the Dumb Zone finding refers to.

- **Check `/context` on long or exploratory sessions**, not just when something starts feeling off — by the time drift is noticeable, you're already well past the point where a fresh session would've been cheaper.
- **Treat 40% usage as the point to actively manage, not the point to panic.** That's well before "the window is full" — it's the threshold where degradation starts, so it's the useful trigger for `/compact` or `/clear`, not the hard ceiling.
- **A bigger context window raises the ceiling; it doesn't flatten the slope.** Don't treat a 1M-token window as license to skip management — context rot shows up incrementally at every length increase, including well inside a large window.

## Use `/clear` and `/compact` deliberately, between tasks

Context rot is gradual, not a cliff at the limit — so the fix is periodic, deliberate resets rather than waiting for a hard failure.

- **`/clear` between unrelated tasks.** Carrying an unrelated task's full tool output and back-and-forth into a new task adds tokens that only dilute attention on the new task — it doesn't help the model do the new thing better.
- **`/compact` when a task is ongoing but the session has accumulated a lot of exploratory back-and-forth** (dead-end searches, superseded plans) that no longer needs to be re-read in full to continue.
- **Don't compact away decisions still in play.** Compaction summarizes; if a nuance mattered enough to drive a later decision, make sure it survives the summary (state it explicitly again) rather than trusting it stayed legible through compression.

## Offload exploration instead of accumulating it

Every tool call's output — a large grep result, a long file read, a research tangent — becomes tokens sitting in the main context for the rest of the session, whether or not it turns out to matter. That's context rot accumulating by hand, one tool call at a time.

- **Delegate open-ended research or multi-step exploration to a subagent** rather than running it inline. A subagent's raw tool output stays out of the main thread; only its summary comes back — the same information, at a fraction of the token cost to the session that has to keep attending to everything else.
- **Fork for "I don't need this output again" work** — a broad codebase survey, a speculative investigation — so the noise never enters the main context in the first place, instead of entering it and then hoping compaction cleans it up later.
- **Reserve the main thread's context for what the session actually needs to keep reasoning about** — decisions made, constraints established, code actually changed — not the full transcript of how you got there.

## Fewer, sharper instructions over exhaustive rule lists

Frontier models top out around 68% compliance at 500 instructions in a single prompt, and reliability falls off a cliff well before that — reasoning models start degrading past roughly 100–250. Each additional keyword or clause is one more competing instruction, so precision beats coverage.

- **Ask for the constraint that matters for this task, not every constraint that might ever apply.** A prompt trying to pre-empt every possible edge case is the same failure mode as an overlong `CLAUDE.md` — more rules, less compliance with each one.
- **Split unrelated instructions across turns instead of stacking them in one prompt.** A single message asking for a feature, a refactor, and a style change simultaneously is three-plus instructions competing for the same budget; sequencing them lets each get full attention on its own turn.
- **If a rule keeps getting silently dropped, that's an omission error, not a wording problem** — per the source finding, high instruction density shifts failures from "followed incorrectly" to "not seen at all." Removing competing instructions fixes that more reliably than rephrasing the dropped one.

## The same principles, in Cursor

The mechanisms don't change by editor — they're properties of the underlying model, not of Claude Code specifically — but Cursor exposes different levers for controlling what lands in context, so the practical advice above maps onto different features.

- **Split `.cursor/rules/*.mdc` into small, scoped files instead of one long rules file.** Each rule file's `globs`/`description` frontmatter controls whether it's attached at all for a given request — a rule scoped to `*.test.ts` never dilutes attention on a request that touches no test files, which a single monolithic rules file can't do. `alwaysApply: true` should be reserved for the handful of rules you'd put at the top of a `CLAUDE.md` — everything else should be scoped so it only enters context when relevant.
- **Prefer `@file`/`@folder`/`@docs` over `@codebase` when you already know what's relevant.** `@codebase`'s semantic search pulls in whatever it judges relevant, which is convenient but adds tokens you didn't choose and can't easily audit for dilution; naming the specific files puts you back in control of what competes for attention, the same way scoping a subagent's task does in Claude Code.
- **Start a new chat/composer session per task, the same way `/clear` resets a Claude Code session.** A long-running chat thread keeps every prior turn's context attached indefinitely — Cursor doesn't auto-compact it for you the way Claude Code's `/compact` does, so an old chat re-used across unrelated tasks accumulates rot with no built-in reset.
- **There's no `/context`-style token meter to check, so use turn count and topic drift as the proxy.** Once a chat thread has wandered across several unrelated changes or grown long enough that you're scrolling to find earlier decisions, treat that as the signal a Claude Code session would give you numerically — it's the same 40%-of-window territory, just without the readout.
- **Put the rule you'd be angriest to see violated in the shortest, highest-priority rule file** (or as an `alwaysApply` rule), not buried in a long onboarding-style rules doc — attention sinks and lost-in-the-middle apply to whatever gets assembled into the model's context regardless of which editor assembled it.

## Why this beats fighting it after the fact

- **It's proactive, not reactive.** Once a context is already diluted, no amount of "please pay attention to X" reliably recovers the lost compliance — the fix is upstream, in what got added to context in the first place.
- **It composes with everything else in this repo's `/notes`.** The [lint rules](/notes/lint-rules) and mitigation strategies elsewhere in `/notes` already tell Claude what to do; context management is what keeps those instructions actually visible instead of buried past the point where they get read.
- **It scales with session length**, where prompt wording alone doesn't — a well-placed rule in a 5-message session and a 500-message session need different handling, and only session-level management (clearing, compacting, delegating) adapts to that.

## Resuming a session

When you quit the Claude Code CLI, you will see somethings like this:

```
Resume this session with:
claude --resume 714b9434-2454-4209-b741-c71180cd1216
```

You can get a list of these sessions with actual human readable titles by entering the `/resume` command.

![The `/resume` command listing past sessions with human-readable titles](/notes/resume-list.png)

This list containst the title, relative time, git branch and size. The size of the session's transcript file on disk: the JSONL log of the whole conversation (every prompt, response, tool call, and tool result). It isn't the live context-window token count, but it's a good proxy for how much history you'd reload by resuming — the *1.9MB* session carries roughly seven times the transcript of the *278.6KB* one. Bytes aren't tokens (the file includes JSON structure and full tool-result payloads that may be truncated or summarized on reload), so read it as a "how heavy is this session" ranking, not a literal token figure.

Resuming is the opposite of `/clear`: `--resume` and `/resume` replay the *entire* prior conversation — every tool result, dead-end search, and superseded plan comes back with it. So the limits from [Threshold Decay and Other Instruction Limits](/attention-limits) apply the moment the session reloads, and a few practices keep resume from quietly dropping you into the Dumb Zone:

- **Only resume to continue the same task.** Resuming for unrelated work drags that session's full transcript into the new task and dilutes attention on it for no benefit — the same anti-pattern as skipping `/clear` between tasks. For genuinely new work, start a fresh session instead of resuming a convenient old one.
- **Check `/context` right after resuming.** You pick up at whatever token count you left off at, plus overhead — if you quit a long session near the 40% line, you resume straight back into it. Resuming is not a reset, so treat the first thing you do as measuring where the reloaded context sits.
- **`/compact` early if the resumed session is already long.** Shed the exploratory back-and-forth before stacking new turns on top, rather than pushing an already-heavy context further past the point where compliance and coherence drift.
- **Restate decisions still in play after a resume or compact.** Compaction summarizes; a nuance that drove an earlier decision can be lost in the compressed summary. Say it again explicitly rather than trusting it stayed legible through the resume.
- **Match the session to the task using the titles, don't just grab the most recent.** The human-readable list exists so you can pick the session you actually mean to continue — resuming the wrong long session loads a large irrelevant context you then have to `/clear` anyway.

## What `/compact` does to the context

`/compact` replaces the conversation history — every message, tool call, and tool result so far — with a single model-generated summary, then carries on from there. The transcript file on disk is left alone (the un-compacted session is still there to `--resume`), but the *live* context the model reasons over from this point forward is that summary plus whatever it re-reads.

Running it on the *LandGrabDemo bot direction logic* session from the resume list above — the one that showed as **1.9MB** on disk — produces this:

![`/context` output for the LandGrabDemo bot direction logic session immediately after running `/compact`](/notes/land-grab-bit-direction-logic-after-compact.png)

The `/compact` block at the top shows what happened: the history collapsed to a summary (`ctrl+o` prints it in full), and the model immediately re-opened the handful of files it still needs — `context-management.md`, `LandGrab.tsx`, `bots.md`, `landGrabSimulation.test.ts`. The `/context` readout underneath shows the effect: **57.6k / 1M tokens (6%)** in total, with **Messages** down to **29k tokens (2.9%)**. What was a 1.9MB transcript is now a working context sitting far below the 40% Dumb Zone line, with room to keep going on the same task.

- **Compaction summarizes; it doesn't losslessly shrink.** Raw file contents, exact tool output, and the phrasing of earlier turns are gone — replaced by the summary's paraphrase. That's why the model re-reads source files right after: anything it still needs at full fidelity has to be pulled back in fresh.
- **Check the summary with `ctrl+o` before continuing.** Confirm the decisions and constraints still in play actually survived it; if a nuance drove a later choice and isn't in the summary, restate it explicitly (the same point as the *Use `/clear` and `/compact` deliberately* section above).
- **`/compact` frees the live window, not the disk.** That session still appears in `/resume` at its full 1.9MB — compaction changes what the *current* session carries forward, so `--resume`-ing the original still reloads the whole un-compacted history.
- **Prefer a deliberate `/compact` at a task boundary over letting auto-compact fire.** Claude Code compacts on its own as you approach the window limit (the *Autocompact buffer* line in `/context`), but that can land mid-edit, in the middle of the model rebuilding its picture of the code from the re-read step. Triggering it yourself between sub-tasks keeps that rebuild at a safe seam.


