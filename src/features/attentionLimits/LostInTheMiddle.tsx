import { GlossaryCard } from "./GlossaryCard";

export function LostInTheMiddle() {
  return (
    <GlossaryCard
      term="Lost in the Middle"
      tagline="Attention is U-shaped: strong at the edges, weak in the center."
      provenance="established"
    >
      <p>
        From Liu et al., <i>"Lost in the Middle: How Language Models Use Long
        Contexts"</i> (2023) — a well-cited finding that models attend most
        reliably to information at the very start and very end of a prompt,
        and least reliably to information buried in the middle.
      </p>
      <p>
        For a long instruction file, this means the rules most likely to get
        silently dropped aren't the first or last ones you wrote — they're the
        ones in the middle of the list.
      </p>
    </GlossaryCard>
  );
}
