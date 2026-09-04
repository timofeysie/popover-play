import { GlossaryCard } from "./GlossaryCard";
import { AttentionDilutionChart } from "./AttentionDilutionChart";

export function AttentionDilution() {
  return (
    <GlossaryCard
      term="Attention Dilution"
      tagline="Attention is a zero-sum budget, not an elastic one."
      provenance="mechanism"
      chart={<AttentionDilutionChart />}
      mitigation={
        <>
          <p>
            <b>Reduce total tokens and instructions — don't just reorganize
            them.</b> Since the attention budget is fixed and sums to 1, the
            only real lever is spending less of it in the first place:
            shorter prompts, fewer standing rules, less boilerplate.
          </p>
          <p>
            <b>Prune whenever you add.</b> When a new instruction goes into a
            prompt or <code>CLAUDE.md</code>, look for a stale or redundant
            one to remove at the same time — treat the file's size as a
            budget, not a running log.
          </p>
          <p>
            <b>Prefer fewer, higher-level rules over many granular ones.</b>{" "}
            One broad instruction ("always validate user input") competes for
            the same budget as five narrow ones, but only spends one line of
            it.
          </p>
          <p>
            This is the mechanism underneath{" "}
            <span className="text-code-tag">threshold decay</span>'s
            instruction-count cliff and{" "}
            <span className="text-code-keyword">attention sinks</span>'
            advice to keep the run-up to a priority instruction short — both
            are attention dilution showing up under a different name.
          </p>
        </>
      }
    >
      <p>
        Softmax attention weights are positive and always sum to <b>1</b>.
        Adding tokens to a prompt doesn't add attention capacity — it splits
        the same fixed budget across more competitors. This is structural,
        not a training bug: you can't add context without diluting attention
        to the context that's already there.
      </p>
      <p>
        Every line in an <code className="font-mono text-code-keyword">AGENTS.md</code>
        {" "}or <code className="font-mono text-code-keyword">CLAUDE.md</code> competes with
        every other line for the same finite share of the model's focus.
      </p>
    </GlossaryCard>
  );
}
