import { GlossaryCard } from "./GlossaryCard";
import { ThresholdDecayChart } from "./ThresholdDecayChart";

export function ThresholdDecay() {
  return (
    <GlossaryCard
      term="Threshold Decay"
      tagline="Near-perfect compliance, then a cliff — not a slope."
      provenance="coinage"
    >
      <ThresholdDecayChart />
      <p>
        Instruction-following doesn't degrade gradually as a prompt grows. It
        holds steady — then drops sharply once a tipping point is crossed.
        Reasoning models in the source study stayed reliable through roughly{" "}
        <b>100–250 instructions</b> before falling off. Frontier models overall
        topped out around <b>68% compliance at 500 instructions</b> in a single
        prompt.
      </p>
      <p>
        As instruction density climbs past that point, the failure mode itself
        changes shape: errors shift from <b>modification</b> (the rule is
        followed, just wrong) to <b>omission</b> (the rule isn't followed at
        all). The model doesn't misread instruction #400 — it doesn't see it.
      </p>
    </GlossaryCard>
  );
}
