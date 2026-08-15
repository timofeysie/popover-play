import { useState } from "react";

interface RotPoint {
  tokens: number;
  actual: number;
  assumed: number;
}

const DATA: RotPoint[] = [
  { tokens: 1_000, actual: 99, assumed: 99 },
  { tokens: 2_000, actual: 98, assumed: 99 },
  { tokens: 5_000, actual: 96, assumed: 99 },
  { tokens: 10_000, actual: 94, assumed: 99 },
  { tokens: 20_000, actual: 90, assumed: 98 },
  { tokens: 50_000, actual: 84, assumed: 98 },
  { tokens: 100_000, actual: 78, assumed: 97 },
  { tokens: 200_000, actual: 70, assumed: 96 },
  { tokens: 500_000, actual: 60, assumed: 90 },
  { tokens: 1_000_000, actual: 52, assumed: 55 },
];

const CALLOUT_INDEX = 5; // 50K tokens

const VIEW_WIDTH = 440;
const VIEW_HEIGHT = 214;
const PADDING_LEFT = 32;
const PADDING_RIGHT = 12;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 40;
const PLOT_WIDTH = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const X_MIN = 1_000;
const X_MAX = 1_000_000;
const Y_MIN = 45;
const Y_MAX = 100;

const toX = (tokens: number) =>
  PADDING_LEFT +
  ((Math.log10(tokens) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * PLOT_WIDTH;
const toY = (quality: number) =>
  PADDING_TOP + (1 - (quality - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;

const actualPath = DATA.map(
  (p, i) => `${i === 0 ? "M" : "L"} ${toX(p.tokens).toFixed(2)} ${toY(p.actual).toFixed(2)}`,
).join(" ");
const assumedPath = DATA.map(
  (p, i) => `${i === 0 ? "M" : "L"} ${toX(p.tokens).toFixed(2)} ${toY(p.assumed).toFixed(2)}`,
).join(" ");
const areaPath = `${actualPath} L ${toX(X_MAX).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} L ${toX(X_MIN).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} Z`;

const X_TICKS = [
  { tokens: 1_000, label: "1K" },
  { tokens: 10_000, label: "10K" },
  { tokens: 100_000, label: "100K" },
  { tokens: 1_000_000, label: "1M" },
];
const Y_TICKS = [50, 75, 100];

const TOOLTIP_WIDTH = 122;
const TOOLTIP_HEIGHT = 50;

export function ContextRotChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : DATA[activeIndex];

  const tooltipX = active
    ? Math.min(
        Math.max(toX(active.tokens) - TOOLTIP_WIDTH / 2, PADDING_LEFT),
        VIEW_WIDTH - PADDING_RIGHT - TOOLTIP_WIDTH,
      )
    : 0;
  const tooltipAbove = active ? toY(active.actual) - PADDING_TOP > TOOLTIP_HEIGHT + 6 : true;
  const tooltipY = active
    ? tooltipAbove
      ? toY(active.actual) - TOOLTIP_HEIGHT - 10
      : toY(active.assumed) + 10
    : 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-1 text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-primary rounded-full" aria-hidden="true" />
          Actual
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-4 h-0 border-t-2 border-dashed border-muted-foreground"
            aria-hidden="true"
          />
          Assumed (naive "I'm under the limit" model)
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Line chart on a logarithmic token-count axis comparing assumed versus actual quality as context length grows from 1,000 to 1,000,000 tokens. The naive assumption stays near 99% until crashing right at the token limit. Actual quality instead declines gradually the whole way, already down to 84% by 50,000 tokens and 52% by 1,000,000 tokens."
      >
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING_LEFT}
              y1={toY(tick)}
              x2={VIEW_WIDTH - PADDING_RIGHT}
              y2={toY(tick)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={PADDING_LEFT - 6}
              y={toY(tick) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] font-mono"
            >
              {tick}%
            </text>
          </g>
        ))}

        <path d={areaPath} className="fill-primary/10" />

        <path
          d={assumedPath}
          fill="none"
          className="stroke-muted-foreground/70"
          strokeWidth={2}
          strokeDasharray="5 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={actualPath}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {X_TICKS.map((tick) => (
          <g key={tick.tokens}>
            <line
              x1={toX(tick.tokens)}
              y1={PADDING_TOP + PLOT_HEIGHT}
              x2={toX(tick.tokens)}
              y2={PADDING_TOP + PLOT_HEIGHT + 4}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={toX(tick.tokens)}
              y={PADDING_TOP + PLOT_HEIGHT + 15}
              textAnchor={tick.tokens === X_MIN ? "start" : tick.tokens === X_MAX ? "end" : "middle"}
              className="fill-muted-foreground text-[9px] font-mono"
            >
              {tick.label}
            </text>
          </g>
        ))}

        <text
          x={PADDING_LEFT + PLOT_WIDTH / 2}
          y={PADDING_TOP + PLOT_HEIGHT + 32}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] font-mono uppercase tracking-wide"
        >
          Context length used (tokens, log scale)
        </text>

        <text
          x={toX(DATA[CALLOUT_INDEX].tokens)}
          y={toY(DATA[CALLOUT_INDEX].actual) + 18}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-mono font-semibold"
        >
          84% by 50K
        </text>

        {activeIndex !== null && active && (
          <line
            x1={toX(active.tokens)}
            y1={PADDING_TOP}
            x2={toX(active.tokens)}
            y2={PADDING_TOP + PLOT_HEIGHT}
            className="stroke-muted-foreground/50"
            strokeWidth={1}
          />
        )}

        {DATA.map((p, i) => (
          <g key={p.tokens}>
            <circle
              cx={toX(p.tokens)}
              cy={toY(p.actual)}
              r={i === activeIndex ? 5 : 4}
              className="fill-primary stroke-card pointer-events-none"
              strokeWidth={2}
            />
            <circle
              cx={toX(p.tokens)}
              cy={toY(p.assumed)}
              r={3}
              className="fill-muted-foreground stroke-card pointer-events-none"
              strokeWidth={2}
            />
            <circle
              cx={toX(p.tokens)}
              cy={toY(p.actual)}
              r={12}
              className="fill-transparent cursor-pointer focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`At ${p.tokens.toLocaleString()} tokens: actual ${p.actual}%, assumed ${p.assumed}%`}
              onPointerEnter={() => setActiveIndex(i)}
              onPointerLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
            />
          </g>
        ))}

        {activeIndex !== null && active && (
          <g>
            <rect
              x={tooltipX}
              y={tooltipY}
              width={TOOLTIP_WIDTH}
              height={TOOLTIP_HEIGHT}
              rx={6}
              className="fill-popover stroke-border"
              strokeWidth={1}
            />
            <text
              x={tooltipX + 8}
              y={tooltipY + 15}
              className="fill-muted-foreground text-[9px] font-mono"
            >
              at {active.tokens.toLocaleString()} tokens
            </text>
            <text
              x={tooltipX + 8}
              y={tooltipY + 29}
              className="fill-primary text-[11px] font-mono font-semibold"
            >
              actual: {active.actual}%
            </text>
            <text
              x={tooltipX + 8}
              y={tooltipY + 42}
              className="fill-muted-foreground text-[11px] font-mono"
            >
              assumed: {active.assumed}%
            </text>
          </g>
        )}
      </svg>

      <details className="mt-2">
        <summary className="text-[11px] text-muted-foreground cursor-pointer select-none hover:text-foreground">
          View chart data
        </summary>
        <table className="mt-2 w-full text-[11px] font-mono">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left font-normal pr-4 pb-1">Tokens</th>
              <th className="text-left font-normal pr-4 pb-1">Actual</th>
              <th className="text-left font-normal pb-1">Assumed</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((p) => (
              <tr key={p.tokens} className="text-foreground/90">
                <td className="pr-4 py-0.5">{p.tokens.toLocaleString()}</td>
                <td className="pr-4 py-0.5">{p.actual}%</td>
                <td className="py-0.5">{p.assumed}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Illustrative curves, not measurements from a specific model — the point
        is the shape: quality erodes gradually across the whole range, not only
        near the advertised limit.
      </p>
    </div>
  );
}
