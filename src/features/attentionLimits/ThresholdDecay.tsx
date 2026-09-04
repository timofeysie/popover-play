import { GlossaryCard } from "./GlossaryCard";
import { ThresholdDecayChart } from "./ThresholdDecayChart";

export function ThresholdDecay() {
  return (
    <GlossaryCard
      term="Threshold Decay"
      tagline="Near-perfect compliance, then a cliff — not a slope."
      provenance="coinage"
      chart={<ThresholdDecayChart />}
      mitigation={
        <>
          <p>
            <b>Budget instruction count, not just token count.</b>{" "}
            Instruction-following compliance held reliable through roughly
            100–250 instructions in the source study — treat that range as a
            hard ceiling for a single prompt or config file, not a soft
            guideline.
          </p>
          <p>
            <b>Cut before you add.</b> When a new instruction goes into a
            prompt or <code>CLAUDE.md</code>, remove a stale or redundant one
            at the same time — this is{" "}
            <span className="text-code-string">attention dilution</span>{" "}
            applied to authoring, see its mitigation notes for why pruning
            matters as much as adding.
          </p>
          <p>
            <b>Front-load and reinforce, don't bury.</b> Put the instructions
            you most need followed at the very top — that's{" "}
            <span className="text-code-keyword">attention sinks</span> working
            in your favor — and repeat critical ones again near the end using{" "}
            <span className="text-primary">the repetition hack</span>: the
            middle of a long document is exactly where{" "}
            <span className="text-code-keyword">lost in the middle</span>{" "}
            causes omission errors to concentrate.
          </p>
          <p>
            <b>Prefer fewer, higher-level principles</b> over many granular
            rules — one broad instruction competes for attention better than
            five narrow ones.
          </p>
          <p>
            <b>Test instruction-following compliance instead of assuming
            it.</b> Omission failures are silent, so periodically audit
            whether rules past the "safe zone" are still being honored.
          </p>
        </>
      }
    >
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
