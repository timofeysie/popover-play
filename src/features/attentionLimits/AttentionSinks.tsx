import { GlossaryCard } from "./GlossaryCard";
import { AttentionSinksChart } from "./AttentionSinksChart";

export function AttentionSinks() {
  return (
    <GlossaryCard
      term="Attention Sinks"
      tagline="The first tokens get outsized attention — regardless of content."
      provenance="established"
    >
      <AttentionSinksChart />
      <p>
        Initial tokens in a sequence absorb disproportionate attention mass no
        matter what they actually say. Documented in Xiao et al.,{" "}
        <i>"Efficient Streaming Language Models with Attention Sinks"</i>{" "}
        (2023/StreamingLLM), where it's used to justify never evicting the
        first few tokens from a streaming KV cache.
      </p>
      <p>
        Practical effect: instructions placed at the <b>top</b> of a long
        prompt or config file get followed more reliably simply because of
        position — they're sitting on the sink — not because they were written
        more clearly.
      </p>
    </GlossaryCard>
  );
}
