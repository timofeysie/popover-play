import { useState } from "react";

interface DecayPoint {
  instructions: number;
  compliance: number;
}

const DATA: DecayPoint[] = [
  { instructions: 0, compliance: 99 },
  { instructions: 50, compliance: 98.5 },
  { instructions: 90, compliance: 97 },
  { instructions: 100, compliance: 95 },
  { instructions: 130, compliance: 86 },
  { instructions: 160, compliance: 78 },
  { instructions: 200, compliance: 72 },
  { instructions: 250, compliance: 69.5 },
  { instructions: 350, compliance: 68.5 },
  { instructions: 500, compliance: 68 },
];

const CLIFF_ZONE = { start: 100, end: 250 };

const VIEW_WIDTH = 440;
const VIEW_HEIGHT = 214;
const PADDING_LEFT = 34;
const PADDING_RIGHT = 12;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 40;
const PLOT_WIDTH = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const X_MAX = 500;
const Y_MIN = 60;
const Y_MAX = 100;

const toX = (instructions: number) =>
  PADDING_LEFT + (instructions / X_MAX) * PLOT_WIDTH;
const toY = (compliance: number) =>
  PADDING_TOP + (1 - (compliance - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;

const linePath = DATA.map(
  (p, i) => `${i === 0 ? "M" : "L"} ${toX(p.instructions).toFixed(2)} ${toY(p.compliance).toFixed(2)}`,
).join(" ");

const areaPath = `${linePath} L ${toX(X_MAX).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} L ${toX(0).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} Z`;

const X_TICKS = [0, 100, 250, 500];
const Y_TICKS = [60, 80, 100];

const TOOLTIP_WIDTH = 108;
const TOOLTIP_HEIGHT = 38;

export function ThresholdDecayChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : DATA[activeIndex];

  const tooltipX = active
    ? Math.min(
        Math.max(toX(active.instructions) - TOOLTIP_WIDTH / 2, PADDING_LEFT),
        VIEW_WIDTH - PADDING_RIGHT - TOOLTIP_WIDTH,
      )
    : 0;
  const tooltipAbove = active ? toY(active.compliance) - PADDING_TOP > TOOLTIP_HEIGHT + 6 : true;
  const tooltipY = active
    ? tooltipAbove
      ? toY(active.compliance) - TOOLTIP_HEIGHT - 10
      : toY(active.compliance) + 10
    : 0;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Line chart of instruction compliance versus instruction count. Compliance holds near 99% until about 100 instructions, falls sharply through the 100 to 250 instruction range, then levels out around 68% by 500 instructions."
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

        <rect
          x={toX(CLIFF_ZONE.start)}
          y={PADDING_TOP}
          width={toX(CLIFF_ZONE.end) - toX(CLIFF_ZONE.start)}
          height={PLOT_HEIGHT}
          className="fill-muted-foreground/10"
        />
        <text
          x={(toX(CLIFF_ZONE.start) + toX(CLIFF_ZONE.end)) / 2}
          y={PADDING_TOP + 12}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] font-mono uppercase tracking-wide"
        >
          cliff zone
        </text>

        <path d={areaPath} className="fill-primary/10" />
        <path
          d={linePath}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {X_TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={toX(tick)}
              y1={PADDING_TOP + PLOT_HEIGHT}
              x2={toX(tick)}
              y2={PADDING_TOP + PLOT_HEIGHT + 4}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={toX(tick)}
              y={PADDING_TOP + PLOT_HEIGHT + 15}
              textAnchor={tick === 0 ? "start" : tick === X_MAX ? "end" : "middle"}
              className="fill-muted-foreground text-[9px] font-mono"
            >
              {tick}
            </text>
          </g>
        ))}

        <text
          x={PADDING_LEFT + PLOT_WIDTH / 2}
          y={PADDING_TOP + PLOT_HEIGHT + 32}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] font-mono uppercase tracking-wide"
        >
          Instructions in prompt
        </text>

        <text
          x={toX(X_MAX)}
          y={toY(68) - 10}
          textAnchor="end"
          className="fill-foreground text-[10px] font-mono font-semibold"
        >
          68% @ 500
        </text>

        {activeIndex !== null && active && (
          <line
            x1={toX(active.instructions)}
            y1={PADDING_TOP}
            x2={toX(active.instructions)}
            y2={PADDING_TOP + PLOT_HEIGHT}
            className="stroke-muted-foreground/50"
            strokeWidth={1}
          />
        )}

        {DATA.map((p, i) => (
          <g key={p.instructions}>
            <circle
              cx={toX(p.instructions)}
              cy={toY(p.compliance)}
              r={i === activeIndex ? 5 : 4}
              className="fill-primary stroke-card pointer-events-none"
              strokeWidth={2}
            />
            <circle
              cx={toX(p.instructions)}
              cy={toY(p.compliance)}
              r={12}
              className="fill-transparent cursor-pointer focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`${p.compliance}% compliance at ${p.instructions} instructions`}
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
              y={tooltipY + 16}
              className="fill-foreground text-[11px] font-mono font-semibold"
            >
              {active.compliance}% compliance
            </text>
            <text
              x={tooltipX + 8}
              y={tooltipY + 29}
              className="fill-muted-foreground text-[9px] font-mono"
            >
              at {active.instructions} instructions
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
              <th className="text-left font-normal pr-4 pb-1">Instructions</th>
              <th className="text-left font-normal pb-1">Compliance</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((p) => (
              <tr key={p.instructions} className="text-foreground/90">
                <td className="pr-4 py-0.5">{p.instructions}</td>
                <td className="py-0.5">{p.compliance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Illustrative curve anchored to the article's reported figures (steady
        through ~100–250 instructions, 68% compliance at 500) — not a plot of
        published per-instruction measurements.
      </p>
    </div>
  );
}
