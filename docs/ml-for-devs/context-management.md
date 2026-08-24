# Context management

The limits described in [Threshold Decay and Other Instruction Limits](/attention-limits) — threshold decay, attention dilution, attention sinks, lost-in-the-middle, the Dumb Zone, context rot — aren't bugs you can prompt your way around — they're structural consequences of how softmax attention works (fixed attention mass split across every token, quadratic pairwise cost as the sequence grows). That means the fix isn't "phrase it more carefully so the model prioritizes correctly" — it's controlling what goes into context in the first place, since nothing you say inside an already-overloaded context reliably escapes the effects on it. The sections below map each mechanism from that doc to a concrete practice for working with Claude Code.

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
                        67.1k/967k tokens (7%)

  Estimated usage by category
  ⛁ System prompt: 9.5k tokens (1.0%)
  ⛁ System tools: 19.7k tokens (2.0%)
  ⛁ Memory files: 1.8k tokens (0.2%)
  ⛁ Skills: 2.2k tokens (0.2%)
  ⛁ Messages: 33.9k tokens (3.5%)
  ⛶ Free space: 866.9k (89.6%)
  ⛝ Autocompact buffer: 33k tokens (3.4%)
```

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

## Why this beats fighting it after the fact

- **It's proactive, not reactive.** Once a context is already diluted, no amount of "please pay attention to X" reliably recovers the lost compliance — the fix is upstream, in what got added to context in the first place.
- **It composes with everything else in this repo's `/notes`.** The [lint rules](/notes/lint-rules) and mitigation strategies elsewhere in `/notes` already tell Claude what to do; context management is what keeps those instructions actually visible instead of buried past the point where they get read.
- **It scales with session length**, where prompt wording alone doesn't — a well-placed rule in a 5-message session and a 500-message session need different handling, and only session-level management (clearing, compacting, delegating) adapts to that.
