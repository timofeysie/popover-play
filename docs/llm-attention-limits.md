# Threshold Decay and Other Instruction/Context Limits

Source: [Your AGENTS.md is a Liability](https://paddo.dev/blog/your-agents-md-is-a-liability/).

Core claim: instruction-following and context use don't degrade gracefully as you add more rules/context to a prompt — they hold steady, then fall off a cliff. Below is a cleaned-up glossary of the terms the article uses, plus notes on which are established ML terminology vs. blog-coined framing, and whether this is transformer-specific.

## The core finding

- Frontier models top out around **68% compliance with 500 instructions** in a single prompt.
- **Threshold decay:** near-perfect compliance holds until a tipping point, then drops sharply. Reasoning models stayed reliable through roughly 100–250 instructions before falling off.
- As instruction density increases, failures shift character: from **modification** errors (rule followed, but wrong) to **omission** errors (rule not followed at all — "it doesn't see it").
- Each keyword/rule effectively counts as one competing instruction — so "add a clarifying phrase" isn't free, it's more load.

## What actually counts as "one instruction"?

Unlike tokens — which have a precise, computable definition (run a prompt through a
tokenizer, get an exact count) — "instruction" isn't a standardized unit in ML
research. The article's own hint is "each keyword counts as one instruction," but
that line alone isn't enough to reconstruct an exact counting method, and there's no
equivalent of a token counter you can run against a prompt to get an authoritative
instruction count. Counting instructions in your own prompt means picking one
convention and applying it consistently:

- **Manual count of discrete directives** — each "always X" / "never Y" / bullet-point
  rule, by eye. Faithful to the intent, but subjective at the boundaries (is "always
  use TypeScript and never use `var`" one instruction or two?).
- **Structural/keyword heuristics** — count bullet points, numbered items, or lines
  matching directive language (must/always/never/should/don't). Mechanical and
  repeatable, closest to what the article's "each keyword" line implies, but the exact
  keyword list isn't specified in the source.
- **LLM-assisted enumeration** — ask a model to list every distinct directive in the
  document, then count the list. Fast, but inherits whatever granularity judgment that
  model happens to make.
- **Token count as a rough proxy** — token counts are exact, so dividing by an assumed
  average tokens-per-instruction (~15–25 for typical prose rules) gives a ballpark, at
  the cost of circularity.

This also means "instructions" and "tokens" aren't interchangeable units. The
attention-level effects below (dilution, lost-in-the-middle, context rot) operate on
tokens — the actual granularity a transformer processes. "Instruction count" is a
coarser, higher-level proxy: two prompts with the same instruction count can have very
different token counts depending on phrasing and verbosity, so the reported
100–250-instruction cliff maps to a different token count depending on how tersely
those instructions are written.

## Why it happens — the mechanisms

- **Attention dilution:** softmax attention weights are positive and sum to 1 — a zero-sum allocation. More tokens in context means less attention budget per token. This is structural, not a training bug: every line added to a prompt/AGENTS.md competes with every other line for the same fixed attention mass.
- **Attention sinks:** the first tokens in a sequence get disproportionate attention regardless of their actual content. Practical effect: instructions placed at the *top* of a long prompt/AGENTS.md are followed more reliably simply because of position, not importance.
- **Lost in the middle:** attention is highest at the start and end of a prompt, weakest in the middle — so instructions buried mid-document are the most likely to be dropped.
- **The Dumb Zone:** past roughly 40% of context-window capacity, models start drifting, hallucinating, and forgetting their own earlier instructions. Root cause is the same structural one: token-to-token attention relationships scale quadratically with sequence length, so every added token makes every other token marginally harder to attend to.
- **Context rot:** degradation isn't a cliff that only appears near the context limit — it happens incrementally at every length increase. A 1M-token-window model can already show rot at 50K tokens; a bigger window raises the ceiling, it doesn't remove the slope.
- **The repetition hack (mitigation):** repeating the instruction block *after* the bulk of the context (not just before it) gives that second copy full attention over everything preceding it — the workaround people use to fight "lost in the middle."

## Is this transformer-specific? What's it called in ML circles?

Splitting the terms by provenance:

- **Established academic/ML terms:**
  - *"Lost in the middle"* — from Liu et al., *"Lost in the Middle: How Language Models Use Long Contexts"* (2023) — a real, citable finding on U-shaped attention over position.
  - *"Attention sinks"* — from Xiao et al., *"Efficient Streaming Language Models with Attention Sinks"* (2023/StreamingLLM) — documented phenomenon where initial tokens (often just the BOS token) absorb disproportionate attention mass, useful for streaming-cache eviction strategies.
  - Both of these are specifically about **softmax self-attention in transformers** — they follow directly from how the attention mechanism normalizes weights across a sequence. Not a generic "AI" issue; it's architecture-specific.
- **Real mechanism, blog-level naming:**
  - *"Attention dilution"* is an accurate plain-language description of a real structural property of softmax attention (weights summing to 1, quadratic pairwise cost) — but it's not the standard term you'd find in a paper; researchers usually just discuss it as attention-weight normalization / quadratic attention cost.
  - *"Context rot"* is a similar case — a real, measurable effect (e.g. Chroma's long-context evals), but "context rot" itself is popularized blog/industry terminology rather than an academic term of art.
- **Article-specific coinage:** *"Threshold decay"*, *"the Dumb Zone,"* and *"the repetition hack"* read as this article's own descriptive labels for the composite effect of the above, applied specifically to instruction-following in coding-agent config files (AGENTS.md/CLAUDE.md). Useful shorthand, but don't expect to find "threshold decay" in a paper — search for "instruction-following degradation" or "long-context instruction compliance" instead.

On "attention network" / "saliency network": worth separating two different fields here. In **neuroscience**, the "salience network" is a real, specific brain network (anterior insula + dorsal ACC) that governs attention-switching between internal/external stimuli — genuinely studied, but it's a biological analogy, not the mechanism at work in a transformer. In **ML**, "attention mechanism" is the standard term, and the sub-phenomena above (sinks, dilution, positional bias) are what's actually being studied — this is squarely a data-science/ML-research topic, not literally the same neuroscience network despite the shared vocabulary.

**Bottom line:** yes, this is fundamentally a transformer/softmax-attention artifact — not a generic property of "AI" or reasoning systems in general. A non-transformer architecture with different memory/retrieval mechanics wouldn't necessarily exhibit the same quadratic-cost, position-biased decay.

## Why this matters here

Directly relevant to how `CLAUDE.md` in this repo (and any `AGENTS.md`-style project file) should be written:
- Keep it short — every additional rule dilutes attention to every other rule, including the ones you care about most.
- Put the most important instructions **first**, and reinforce critical ones near the **end** — the middle is the least reliable position.
- Don't rely on rule #47 in a long list being followed; if it's not near the top or the bottom, budget for it being silently dropped (omission, not misapplication).
