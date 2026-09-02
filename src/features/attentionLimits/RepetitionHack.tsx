import { ChevronRight, Lightbulb } from "lucide-react";

export function RepetitionHack() {
  return (
    <details className="group/hint rounded-lg border border-dashed border-primary/40 bg-primary/5 overflow-hidden">
      <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-primary hover:bg-primary/10 transition-colors [&::-webkit-details-marker]:hidden">
        <ChevronRight
          className="w-4 h-4 shrink-0 transition-transform group-open/hint:rotate-90"
          aria-hidden
        />
        <Lightbulb className="w-4 h-4 shrink-0" aria-hidden />
        <span className="font-medium text-foreground">
          Hint — The Repetition Hack
        </span>
      </summary>
      <div className="px-4 pb-4 pt-3 text-sm text-foreground/90 leading-relaxed border-t border-primary/20">
        <p>
          A practical workaround: repeat the instruction block <b>after</b> the
          bulk of the context, not only before it.
        </p>
        <p className="mt-2">
          The second copy sits closer to the end of the prompt, where it can
          attend back over everything that came before — including the context
          it's meant to apply to — instead of getting diluted by everything that
          follows it.
        </p>
      </div>
    </details>
  );
}
