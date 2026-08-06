export function FormulaGlossary() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8 mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">In plain English</h3>

      <div className="space-y-3 overflow-x-auto">
        <div className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-sm md:text-base whitespace-nowrap">
          <span className="text-muted-foreground">h(t) =</span>
          <span className="text-code-keyword">a</span>
          <span className="text-muted-foreground">t² +</span>
          <span className="text-code-string">b</span>
          <span className="text-muted-foreground">t +</span>
          <span className="text-code-tag">c</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-sm md:text-base">
          <span className="text-muted-foreground">Height(time) = −½ ·</span>
          <span className="text-code-keyword">gravity</span>
          <span className="text-muted-foreground">· time² +</span>
          <span className="text-code-string">initial velocity</span>
          <span className="text-muted-foreground">· time +</span>
          <span className="text-code-tag">initial height</span>
        </div>
      </div>

      <dl className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <dt className="text-sm font-semibold text-foreground mb-1">Quadratic</dt>
          <dd className="text-sm text-muted-foreground leading-relaxed">
            An expression whose highest power is 2 — from the Latin{" "}
            <em>quadratus</em>, "squared." The{" "}
            <code className="font-mono text-code-keyword">t²</code> term is
            what curves the ball's path instead of leaving it a straight line.
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
          <dt className="text-sm font-semibold text-foreground mb-1">Polynomial</dt>
          <dd className="text-sm text-muted-foreground leading-relaxed">
            An expression built from variables and coefficients using only
            addition, subtraction, and multiplication — from the Greek/Latin
            for "many terms" (<em>poly</em> + <em>nomial</em>).
          </dd>
        </div>
      </dl>
    </div>
  );
}
