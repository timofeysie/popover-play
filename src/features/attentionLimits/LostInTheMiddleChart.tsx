import { useState } from "react";

interface RecallPoint {
  position: number;
  accuracy: number;
}

const DATA: RecallPoint[] = [
  { position: 0, accuracy: 88 },
  { position: 10, accuracy: 83 },
  { position: 20, accuracy: 74 },
  { position: 30, accuracy: 63 },
  { position: 40, accuracy: 56 },
  { position: 50, accuracy: 53 },
  { position: 60, accuracy: 56 },
  { position: 70, accuracy: 63 },
  { position: 80, accuracy: 74 },
  { position: 90, accuracy: 83 },
  { position: 100, accuracy: 88 },
];

const WEAK_ZONE = { start: 30, end: 70 };

const VIEW_WIDTH = 440;
const VIEW_HEIGHT = 214;
const PADDING_LEFT = 30;
const PADDING_RIGHT = 12;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 40;
const PLOT_WIDTH = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const X_MAX = 100;
const Y_MIN = 45;
const Y_MAX = 90;

const toX = (position: number) => PADDING_LEFT + (position / X_MAX) * PLOT_WIDTH;
const toY = (accuracy: number) =>
  PADDING_TOP + (1 - (accuracy - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;

const linePath = DATA.map(
  (p, i) => `${i === 0 ? "M" : "L"} ${toX(p.position).toFixed(2)} ${toY(p.accuracy).toFixed(2)}`,
).join(" ");

const areaPath = `${linePath} L ${toX(X_MAX).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} L ${toX(0).toFixed(2)} ${(PADDING_TOP + PLOT_HEIGHT).toFixed(2)} Z`;

const X_TICKS = [0, 30, 50, 70, 100];
const Y_TICKS = [50, 70, 90];

const TOOLTIP_WIDTH = 112;
const TOOLTIP_HEIGHT = 38;

export function LostInTheMiddleChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : DATA[activeIndex];

  const tooltipX = active
    ? Math.min(
        Math.max(toX(active.position) - TOOLTIP_WIDTH / 2, PADDING_LEFT),
        VIEW_WIDTH - PADDING_RIGHT - TOOLTIP_WIDTH,
      )
    : 0;
  const tooltipAbove = active ? toY(active.accuracy) - PADDING_TOP > TOOLTIP_HEIGHT + 6 : true;
  const tooltipY = active
    ? tooltipAbove
      ? toY(active.accuracy) - TOOLTIP_HEIGHT - 10
      : toY(active.accuracy) + 10
    : 0;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Line chart of retrieval accuracy versus the position of the key information in a document, forming a U shape. Accuracy is about 88% when the information is at the very start or very end, and dips to about 53% when it sits in the middle."
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
          x={toX(WEAK_ZONE.start)}
          y={PADDING_TOP}
          width={toX(WEAK_ZONE.end) - toX(WEAK_ZONE.start)}
          height={PLOT_HEIGHT}
          className="fill-muted-foreground/10"
        />
        <text
          x={(toX(WEAK_ZONE.start) + toX(WEAK_ZONE.end)) / 2}
          y={PADDING_TOP + 12}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] font-mono uppercase tracking-wide"
        >
          weakest recall
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
          Position of key info in context
        </text>

        <text
          x={toX(0)}
          y={toY(88) - 10}
          textAnchor="start"
          className="fill-foreground text-[10px] font-mono font-semibold"
        >
          88%
        </text>
        <text
          x={toX(100)}
          y={toY(88) - 10}
          textAnchor="end"
          className="fill-foreground text-[10px] font-mono font-semibold"
        >
          88%
        </text>
        <text
          x={toX(50)}
          y={toY(53) + 16}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-mono font-semibold"
        >
          53%
        </text>

        {activeIndex !== null && active && (
          <line
            x1={toX(active.position)}
            y1={PADDING_TOP}
            x2={toX(active.position)}
            y2={PADDING_TOP + PLOT_HEIGHT}
            className="stroke-muted-foreground/50"
            strokeWidth={1}
          />
        )}

        {DATA.map((p, i) => (
          <g key={p.position}>
            <circle
              cx={toX(p.position)}
              cy={toY(p.accuracy)}
              r={i === activeIndex ? 5 : 4}
              className="fill-primary stroke-card pointer-events-none"
              strokeWidth={2}
            />
            <circle
              cx={toX(p.position)}
              cy={toY(p.accuracy)}
              r={12}
              className="fill-transparent cursor-pointer focus:outline-none"
              tabIndex={0}
              role="button"
              aria-label={`${p.accuracy}% accuracy at position ${p.position}%`}
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
              {active.accuracy}% accuracy
            </text>
            <text
              x={tooltipX + 8}
              y={tooltipY + 29}
              className="fill-muted-foreground text-[9px] font-mono"
            >
              at {active.position}% into context
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
              <th className="text-left font-normal pr-4 pb-1">Position</th>
              <th className="text-left font-normal pb-1">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((p) => (
              <tr key={p.position} className="text-foreground/90">
                <td className="pr-4 py-0.5">{p.position}%</td>
                <td className="py-0.5">{p.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Illustrative U-curve — shape matches Liu et al.'s reported pattern (best
        at the start and end, worst in the middle), not a plot of their exact
        published figures.
      </p>
    </div>
  );
}
