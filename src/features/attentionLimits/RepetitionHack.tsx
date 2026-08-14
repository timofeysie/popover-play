import { GlossaryCard } from "./GlossaryCard";

export function RepetitionHack() {
  return (
    <GlossaryCard
      term="The Repetition Hack"
      tagline="Say it again, after the context — not just before it."
      provenance="mitigation"
    >
      <p>
        A practical workaround for{" "}
        <span className="text-code-string">lost in the middle</span>: repeat the
        instruction block <b>after</b> the bulk of the context, not only
        before it.
      </p>
      <p>
        The second copy sits closer to the end of the prompt, where it can
        attend back over everything that came before — including the context
        it's meant to apply to — instead of getting diluted by everything that
        follows it.
      </p>
    </GlossaryCard>
  );
}
