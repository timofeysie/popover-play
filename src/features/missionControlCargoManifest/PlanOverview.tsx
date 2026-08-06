const SKILL_SECTIONS = [
  {
    title: "Modern Frontend Frameworks",
    accent: "text-code-keyword",
    points: [
      "Steps live at real routes (/mccm/cargo, /destination, /review) — the URL is the source of truth for wizard position, not local component state.",
      "Step components are code-split and read/write a shared store instead of prop-drilling wizard state through parents.",
      "The live price ticker is isolated in its own subtree so WebSocket updates don't re-render the whole wizard.",
    ],
  },
  {
    title: "TypeScript",
    accent: "text-code-string",
    points: [
      "Strict domain types: CargoItem, Manifest, Destination, plus a generic fetchJson<T> API client wrapper.",
      "A typed Zustand store (MccmState) with typed actions and selectors.",
      "Zod schemas per step, inferred into RHF types — one source of truth for runtime validation and compile-time types.",
    ],
  },
  {
    title: "State Management",
    accent: "text-code-tag",
    points: [
      "Zustand owns the durable cross-step manifest (items, destination, clearance, totals) — the transactional state that must survive step navigation.",
      "Each step's React Hook Form is hydrated from the store and commits back on step-change, not on every keystroke.",
      "Cross-field logic: hazardous cargo makes a clearance code required; destination sector narrows available shipping lanes.",
    ],
  },
  {
    title: "API Integration",
    accent: "text-code-comment",
    points: [
      "REST: DummyJSON /products as the cargo catalog — search, pagination, and caching via TanStack Query.",
      "Real-time: a public Binance WebSocket stream repurposed as a live \"galactic credit\" exchange rate on the review step.",
      "Error handling: catalog fetch failures, WS reconnect/backoff, and a stale-price affordance.",
    ],
  },
];

export function PlanOverview() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <h3 className="text-lg font-semibold text-foreground mb-3">The theme</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You're provisioning a resupply run for a space station. Step 1 builds a{" "}
          <strong className="text-foreground">cargo manifest</strong> from a searchable,
          paginated catalog. Step 2 picks a{" "}
          <strong className="text-foreground">destination</strong>, revealing conditional
          fields based on what's in the manifest. Step 3{" "}
          <strong className="text-foreground">reviews and launches</strong>, converting the
          total to live "galactic credits" via a real-time price feed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {SKILL_SECTIONS.map(({ title, accent, points }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-muted/20 px-4 py-4"
          >
            <h4 className={`text-sm font-semibold mb-2 ${accent}`}>{title}</h4>
            <ul className="space-y-1.5">
              {points.map((point) => (
                <li
                  key={point}
                  className="text-sm text-muted-foreground leading-relaxed pl-3 relative before:content-['—'] before:absolute before:left-0 before:text-muted-foreground/50"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-transparent p-6 md:p-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">Status</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Plan only — no wizard code yet. Next up: breaking this into concrete milestones
          (store shape, API client, step 1 UI, step 2 UI, step 3 + WS ticker, polish).
          See{" "}
          <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
            docs/mission-control-cargo-manifest.md
          </code>{" "}
          for the full write-up.
        </p>
      </div>
    </div>
  );
}
