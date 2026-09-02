import { useState } from "react";

interface ReliabilityPoint {
  contextUsed: number;
  reliability: number;
}

const DATA: ReliabilityPoint[] = [
  { contextUsed: 0, reliability: 99 },
  { contextUsed: 10, reliability: 98 },
  { contextUsed: 20, reliability: 97 },
  { contextUsed: 30, reliability: 96 },
  { contextUsed: 40, reliability: 94 },
  { contextUsed: 50, reliability: 89 },
  { contextUsed: 60, reliability: 82 },
  { contextUsed: 70, reliability: 73 },
  { contextUsed: 80, reliability: 63 },
  { contextUsed: 90, reliability: 54 },
  { contextUsed: 100, reliability: 46 },
];

const ZONE_START = 40;

const VIEW_WIDTH = 440;
const VIEW_HEIGHT = 214;
const PADDING_LEFT = 34;
const PADDING_RIGHT = 12;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 40;
const PLOT_WIDTH = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const X_MAX = 100;
const Y_MIN = 40;
const Y_MAX = 100;

const toX = (contextUsed: number) =>
  PADDING_LEFT + (contextUsed / X_MAX) * PLOT_WIDTH;
const toY = (reliability: number) =>
  PADDING_TOP + (1 - (reliability - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;

const linePath = DATA.map(
  (point, index) =>
    `${index === 0 ? "M" : "L"} ${toX(point.contextUsed).toFixed(2)} ${toY(point.reliability).toFixed(2)}`,
).join(" ");

const areaPath = `${linePath} L ${toX(X_MAX).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} L ${toX(0).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} Z`;

const X_TICKS = [0, 20, 40, 60, 80, 100];
const Y_TICKS = [40, 60, 80, 100];

const TOOLTIP_WIDTH = 116;
const TOOLTIP_HEIGHT = 38;

export function TheDumbZoneChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : DATA[activeIndex];

  const tooltipX = active
    ? Math.min(
        Math.max(toX(active.contextUsed) - TOOLTIP_WIDTH / 2, PADDING_LEFT),
        VIEW_WIDTH - PADDING_RIGHT - TOOLTIP_WIDTH,
      )
    : 0;
  const tooltipAbove = active
    ? toY(active.reliability) - PADDING_TOP > TOOLTIP_HEIGHT + 6
    : true;
  const tooltipY = active
    ? tooltipAbove
      ? toY(active.reliability) - TOOLTIP_HEIGHT - 10
      : toY(active.reliability) + 10
    : 0;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Illustrative line chart of task reliability versus percentage of the context window used. Reliability remains high through roughly 40 percent usage, then declines increasingly quickly as the context window fills."
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
          x={toX(ZONE_START)}
          y={PADDING_TOP}
          width={toX(X_MAX) - toX(ZONE_START)}
          height={PLOT_HEIGHT}
          className="fill-destructive/10"
        />
        <line
          x1={toX(ZONE_START)}
          y1={PADDING_TOP}
          x2={toX(ZONE_START)}
          y2={PADDING_TOP + PLOT_HEIGHT}
          className="stroke-destructive/70"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text
          x={(toX(ZONE_START) + toX(X_MAX)) / 2}
          y={PADDING_TOP + 12}
          textAnchor="middle"
          className="fill-destructive text-[9px] font-mono uppercase tracking-wide"
        >
          degradation zone
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
              textAnchor={
                tick === 0 ? "start" : tick === X_MAX ? "end" : "middle"
              }
              className="fill-muted-foreground text-[9px] font-mono"
            >
              {tick}%
            </text>
          </g>
        ))}

        <text
          x={PADDING_LEFT + PLOT_WIDTH / 2}
          y={PADDING_TOP + PLOT_HEIGHT + 32}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] font-mono uppercase tracking-wide"
        >
          Context window used
        </text>

        <text
          x={toX(ZONE_START) - 5}
          y={PADDING_TOP + 28}
          textAnchor="end"
          className="fill-foreground text-[10px] font-mono font-semibold"
        >
          ~40% threshold
        </text>

        {activeIndex !== null && active && (
          <line
            x1={toX(active.contextUsed)}
            y1={PADDING_TOP}
            x2={toX(active.contextUsed)}
            y2={PADDING_TOP + PLOT_HEIGHT}
            className="stroke-muted-foreground/50"
            strokeWidth={1}
          />
        )}

        {DATA.map((point, index) => (
          <g key={point.contextUsed}>
            <circle
              cx={toX(point.contextUsed)}
              cy={toY(point.reliability)}
              r={index === activeIndex ? 5 : 4}
              className="fill-primary stroke-card pointer-events-none"
              strokeWidth={2}
            />
            <circle
              cx={toX(point.contextUsed)}
              cy={toY(point.reliability)}
              r={12}
              className="fill-transparent cursor-pointer focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`${point.reliability}% illustrative reliability at ${point.contextUsed}% context-window usage`}
              onPointerEnter={() => setActiveIndex(index)}
              onPointerLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
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
              {active.reliability}% reliability
            </text>
            <text
              x={tooltipX + 8}
              y={tooltipY + 29}
              className="fill-muted-foreground text-[9px] font-mono"
            >
              at {active.contextUsed}% context used
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
              <th className="text-left font-normal pr-4 pb-1">
                Context used
              </th>
              <th className="text-left font-normal pb-1">Reliability</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((point) => (
              <tr key={point.contextUsed} className="text-foreground/90">
                <td className="pr-4 py-0.5">{point.contextUsed}%</td>
                <td className="py-0.5">{point.reliability}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Illustrative curve, not measurements from a specific model. The shaded
        region visualizes the article&apos;s “Dumb Zone” framing rather than an
        established universal threshold.
      </p>
    </div>
  );
}
