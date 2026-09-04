import { GlossaryCard } from "./GlossaryCard";
import { TheDumbZoneChart } from "./TheDumbZoneChart";

export function TheDumbZone() {
  return (
    <GlossaryCard
      term="The Dumb Zone"
      tagline="Past ~40% of the context window, things start to slip."
      provenance="coinage"
      chart={<TheDumbZoneChart />}
      mitigation={
        <>
          <p>
            <b>Monitor how much of the context window a session has actually
            used, not just whether it feels off.</b> By the time drift is
            noticeable, a session is typically already well past the point
            where starting fresh would have been cheaper — usage against the
            window is a leading indicator, not something you can eyeball from
            behavior alone.
          </p>
          <p>
            <b>Treat the ~40% mark as the point to actively manage, not the
            point to panic.</b> That's well before the window is "full" — it's
            the threshold where degradation starts, so it's the useful
            trigger for resetting or summarizing a session, not a hard
            ceiling to race up against.
          </p>
          <p>
            <b>A bigger context window raises the ceiling; it doesn't flatten
            the slope.</b> A large window doesn't excuse skipping this —{" "}
            <span className="text-code-string">context rot</span> shows up
            incrementally at every length increase, including well inside a
            large window, so the 40% guidance still applies regardless of
            the window's advertised size.
          </p>
          <p>
            This is the same structural cost as{" "}
            <span className="text-code-string">attention dilution</span>,
            just applied at the level of a whole session instead of a single
            prompt: the fix is spending less of the budget in the first
            place, here by resetting or summarizing before accumulated
            context does the damage rather than by pruning a static file.
          </p>
        </>
      }
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
