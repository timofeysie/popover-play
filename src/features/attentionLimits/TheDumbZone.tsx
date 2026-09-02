import { GlossaryCard } from "./GlossaryCard";
import { TheDumbZoneChart } from "./TheDumbZoneChart";

export function TheDumbZone() {
  return (
    <GlossaryCard
      term="The Dumb Zone"
      tagline="Past ~40% of the context window, things start to slip."
      provenance="coinage"
      chart={<TheDumbZoneChart />}
    >
      <p>
        Once a prompt passes roughly <b>40% of a model's context-window
        capacity</b>, models tend to start drifting, hallucinating, and
        forgetting their own earlier instructions — well before the window is
        actually full.
      </p>
      <p>
        The root cause is the same structural one as{" "}
        <span className="text-code-string">attention dilution</span>: token-to-token
        attention relationships scale <b>quadratically</b> with sequence
        length, so every additional token makes every other token marginally
        harder to attend to.
      </p>
    </GlossaryCard>
  );
}
