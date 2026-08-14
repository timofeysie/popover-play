import { GlossaryCard } from "./GlossaryCard";

export function ContextRot() {
  return (
    <GlossaryCard
      term="Context Rot"
      tagline="Degradation is a slope, not a cliff at the token limit."
      provenance="mechanism"
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
