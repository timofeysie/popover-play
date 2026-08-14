import type { ReactNode } from "react";

export type GlossaryProvenance =
  | "established"
  | "mechanism"
  | "coinage"
  | "mitigation";

const PROVENANCE_LABEL: Record<GlossaryProvenance, string> = {
  established: "Established ML term",
  mechanism: "Real mechanism, blog naming",
  coinage: "Article-specific coinage",
  mitigation: "Mitigation technique",
};

const PROVENANCE_CLASSNAME: Record<GlossaryProvenance, string> = {
  established: "text-code-keyword border-code-keyword/30 bg-code-keyword/10",
  mechanism: "text-code-string border-code-string/30 bg-code-string/10",
  coinage: "text-code-tag border-code-tag/30 bg-code-tag/10",
  mitigation:
    "text-code-comment border-code-comment/30 bg-code-comment/10",
};

interface GlossaryCardProps {
  term: string;
  tagline: string;
  provenance: GlossaryProvenance;
  children: ReactNode;
}

export function GlossaryCard({
  term,
  tagline,
  provenance,
  children,
}: GlossaryCardProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{term}</h3>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full border whitespace-nowrap ${PROVENANCE_CLASSNAME[provenance]}`}
        >
          {PROVENANCE_LABEL[provenance]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground italic">{tagline}</p>
      <div className="text-sm text-foreground/90 leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
