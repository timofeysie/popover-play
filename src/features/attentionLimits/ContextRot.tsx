import { GlossaryCard } from "./GlossaryCard";
import { ContextRotChart } from "./ContextRotChart";

export function ContextRot() {
  return (
    <GlossaryCard
      term="Context Rot"
      tagline="Degradation is a slope, not a cliff at the token limit."
      provenance="mechanism"
      chart={<ContextRotChart />}
      mitigation={
        <>
          <p>
            <b>Reset or summarize between unrelated tasks, don't just carry
            everything forward.</b> An unrelated task's full history and tool
            output entering a new one is{" "}
            <span className="text-code-string">attention dilution</span> by
            another name — extra tokens that don't help the model do the new
            task better, just spend down the same fixed budget on something
            irrelevant to it.
          </p>
          <p>
            <b>Summarize accumulated exploration instead of leaving it in
            full.</b> Dead-end searches and superseded plans don't need to
            stay verbatim once a task settles — compress them down to the
            decisions that came out of them, and restate anything nuanced
            enough that it might not survive the compression.
          </p>
          <p>
            <b>Offload open-ended exploration instead of accumulating it
            inline.</b> A broad survey or a speculative investigation
            generates a lot of tokens that, once read, mostly aren't needed
            again — running that kind of work somewhere its raw output
            doesn't have to sit in the main context, so only its conclusion
            comes back, keeps rot from accumulating in the first place.
          </p>
          <p>
            Do this periodically rather than waiting for a hard failure: rot
            is gradual, not a cliff at the token limit — the same slope{" "}
            <span className="text-code-tag">the dumb zone</span> is naming a
            specific point on — so the fix is a deliberate, recurring habit,
            not a one-time cleanup once something breaks.
          </p>
        </>
      }
    >
      <p>
        A real, measurable effect (see e.g. Chroma's long-context evals) —
        but degradation doesn't only appear once you approach a model's
        maximum context length. It happens incrementally at{" "}
        <b>every</b> increase in context length.
      </p>
      <p>
        A model advertising a 1M-token window can already show rot at{" "}
        <b>50K tokens</b>. A bigger window raises the ceiling; it doesn't flatten
        the slope underneath it.
      </p>
    </GlossaryCard>
  );
}
