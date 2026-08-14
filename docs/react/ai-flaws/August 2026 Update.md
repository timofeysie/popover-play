# August 2026 Update

Revisiting the [source article](https://medium.com/@jainkarishma76/ai-generated-frontend-code-problems-4102c23602e9) from January 15, 2026, six months on.

## Caveat

My own training data is frozen at a January 2026 cutoff, so I can't cite specific model releases between then and now. What follows is structural reasoning about *why* each flaw exists — not a claim that some specific newer model has already fixed it.

## Provenance

For later reference, this update was written by:

- **Model:** Claude Sonnet 5 (model ID `claude-sonnet-5`), Anthropic. Knowledge cutoff: January 2026.
- **Harness:** Claude Code (CLI agent), running in this repo (`popover-play`) with read/write file access, Bash, and other local tools — i.e. an *agentic* coding session, not a single-shot chat completion. Worth noting given the "agentic vs. chat-based generation" distinction drawn below.
- **Session date:** August 15, 2026 (per the environment's `currentDate`), six months after the source article.
- **Note on later re-reads:** if you're revisiting this note further down the line, the model/harness details above describe *this specific update*, not whatever model or tool produced any later edits to this file.

## The split that actually matters

The flaws in this folder fall into two categories that age very differently as models improve.

1. Context-driven flaws — won't go away.
2. Capability-driven flaws — can improve. 

## Context-driven flaws 

**Won't go away just because the model gets smarter** — these are consequences of what the model can *see*, not what it can *reason about*:

- **Architectural design drift** (Code Quality doc) — a model can't follow "your existing `useFetch`/`apiClient` conventions" if those conventions are never in its context. This scales with context window and tool access (codebase search, CLAUDE.md-style project instructions), not raw capability.
- **Lack of context / over-fetching** (Performance doc) — same root cause: the model only sees the immediate prompt, not the calling component that only renders 4 items.
- **Missing resilience** — timeouts, retries, error boundaries. Models optimize for the literal request; ask for "a fetch call" and you get a fetch call. This is a spec/prompting gap, not something scaling the model fixes.

## Capability-driven flaws

**Should genuinely shrink as models improve** — closer to real capability/training-data gaps:

- **Outdated idiomatic React patterns** (`useEffect` for derived state, `useRef` misused for UI state) — classic patterns that show up because of training-data statistics (a lot of old Stack Overflow-era React in the corpus). More recent, better-curated training data measurably reduces this.
- **Re-implementing `react-hook-form` or Zustand by hand** instead of reaching for the right library — better planning/reasoning plus longer context (seeing what's already in `package.json`) helps directly.
- **Duplicated utility functions** — mitigated less by "smarter" and more by *agentic* tool use (grepping the repo before writing new code), which is now standard in coding agents but wasn't the default mode the source article was critiquing.

## What's actually stale about the note

"AI excels at boilerplate, humans must review" still holds as a floor, but it implicitly assumes one-shot chat generation from a prompt. It's worth re-splitting the flaw list by **generation mode**:

- **Chat-based, single-shot completion** (what the article critiques) — most of these flaws still apply close to directly.
- **Agentic coding** (a tool that reads the repo, runs tests/lint, greps for conventions, iterates) — several of the "context" and "duplication" flaws are structurally addressed by the tooling loop, largely independent of which underlying model is doing the generating.

## Recommendation

Keep the flaw list — it's a solid review checklist regardless of how good models get, since even a strong model produces these bugs when under-specified. Consider tagging each flaw as a *model* problem vs. a *context/tooling* problem — that's the axis that's actually moving, and it changes what "fixing" it even means.

## Loose end

`Security and Usability.md` in this folder is currently empty — worth filling in or removing so it isn't a dead reference.
