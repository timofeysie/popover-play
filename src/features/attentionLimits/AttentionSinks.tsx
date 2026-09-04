import { GlossaryCard } from "./GlossaryCard";
import { AttentionSinksChart } from "./AttentionSinksChart";

export function AttentionSinks() {
  return (
    <GlossaryCard
      term="Attention Sinks"
      tagline="The first tokens get outsized attention — regardless of content."
      provenance="established"
      chart={<AttentionSinksChart />}
      mitigation={
        <>
          <p>
            <b>Spend the sink on what matters most.</b> The first tokens get
            outsized attention regardless of content, so don't waste that
            position on preamble or boilerplate — put your single
            highest-priority instruction there and let the sink carry it for
            free.
          </p>
          <p>
            <b>Keep the run-up to it short.</b> Every filler token placed
            before your priority instruction is{" "}
            <span className="text-code-string">attention dilution</span>{" "}
            spending down the same fixed budget, and it pushes that
            instruction further from the sink.
          </p>
          <p>
            <b>The sink doesn't cover the rest of the document.</b> It only
            boosts the first few tokens — instructions further down still
            fall through{" "}
            <span className="text-code-keyword">lost in the middle</span>,
            and the whole prompt is still subject to{" "}
            <span className="text-code-tag">threshold decay</span>'s cliff
            once instruction count climbs. For anything critical that can't
            be first, pair position with{" "}
            <span className="text-primary">the repetition hack</span>.
          </p>
        </>
      }
    >
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
