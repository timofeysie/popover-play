import { GlossaryCard } from "./GlossaryCard";
import { AttentionDilutionChart } from "./AttentionDilutionChart";

export function AttentionDilution() {
  return (
    <GlossaryCard
      term="Attention Dilution"
      tagline="Attention is a zero-sum budget, not an elastic one."
      provenance="mechanism"
      chart={<AttentionDilutionChart />}
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
