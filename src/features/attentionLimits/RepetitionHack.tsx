import { Lightbulb } from "lucide-react";

export function RepetitionHack() {
  return (
    <div className="mt-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">
          Hint — The Repetition Hack
        </h4>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">
        A practical workaround: repeat the instruction block <b>after</b> the
        bulk of the context, not only before it.
      </p>
      <p className="text-sm text-foreground/90 leading-relaxed mt-2">
        The second copy sits closer to the end of the prompt, where it can
        attend back over everything that came before — including the context
        it's meant to apply to — instead of getting diluted by everything that
        follows it.
      </p>
    </div>
  );
}
