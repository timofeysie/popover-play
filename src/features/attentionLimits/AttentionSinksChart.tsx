import { useState } from "react";

interface PositionWeight {
  position: number;
  weight: number;
  isSink: boolean;
}

const DATA: PositionWeight[] = [
  { position: 0, weight: 34, isSink: true },
  { position: 1, weight: 10, isSink: true },
  ...Array.from({ length: 14 }, (_, i) => ({
    position: i + 2,
    weight: 4,
    isSink: false,
  })),
];

const VIEW_WIDTH = 400;
const VIEW_HEIGHT = 190;
const PADDING_LEFT = 30;
const PADDING_RIGHT = 8;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 34;
const PLOT_WIDTH = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

const Y_MAX = 40;
const Y_TICKS = [0, 20, 40];
const BAR_GAP = 3;
const BAR_WIDTH = (PLOT_WIDTH - (DATA.length - 1) * BAR_GAP) / DATA.length;
const BASELINE_Y = PADDING_TOP + PLOT_HEIGHT;

const toBarX = (i: number) => PADDING_LEFT + i * (BAR_WIDTH + BAR_GAP);
const toBarHeight = (weight: number) => (weight / Y_MAX) * PLOT_HEIGHT;
const toY = (weight: number) => BASELINE_Y - toBarHeight(weight);

const TOOLTIP_WIDTH = 118;
const TOOLTIP_HEIGHT = 34;

export function AttentionSinksChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : DATA[activeIndex];

  const tooltipX =
    active && activeIndex !== null
      ? Math.min(
          Math.max(toBarX(activeIndex) + BAR_WIDTH / 2 - TOOLTIP_WIDTH / 2, PADDING_LEFT),
          VIEW_WIDTH - PADDING_RIGHT - TOOLTIP_WIDTH,
        )
      : 0;
  const tooltipY = active ? Math.max(toY(active.weight) - TOOLTIP_HEIGHT - 8, 2) : 0;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Bar chart of attention weight by token position in a sequence. The first two positions absorb a disproportionate 34% and 10% of attention, while every later position gets a flat, low share of about 4% each — illustrating an attention sink at the start of the sequence."
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

        <text
          x={toBarX(0) + BAR_WIDTH / 2}
          y={toY(34) - 8}
          textAnchor="middle"
          className="fill-foreground text-[10px] font-mono font-semibold"
        >
          34%
        </text>
        <text
          x={(toBarX(0) + toBarX(1) + BAR_WIDTH) / 2}
          y={PADDING_TOP - 10}
          textAnchor="middle"
          className="fill-primary text-[9px] font-mono uppercase tracking-wide"
        >
          sink
        </text>

        {DATA.map((p, i) => (
          <rect
            key={p.position}
            x={toBarX(i)}
            y={toY(p.weight)}
            width={BAR_WIDTH}
            height={toBarHeight(p.weight)}
            rx={2}
            className={
              p.isSink
                ? "fill-primary cursor-pointer"
                : "fill-muted-foreground/40 cursor-pointer"
            }
            stroke={i === activeIndex ? "hsl(var(--foreground))" : "none"}
            strokeWidth={1}
            tabIndex={0}
            role="button"
            aria-label={`Position ${p.position}: ${p.weight}% attention`}
            onPointerEnter={() => setActiveIndex(i)}
            onPointerLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(i)}
            onBlur={() => setActiveIndex(null)}
          />
        ))}

        <text
          x={PADDING_LEFT + PLOT_WIDTH / 2}
          y={VIEW_HEIGHT - 6}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px] font-mono uppercase tracking-wide"
        >
          Token position in sequence
        </text>

        {active && (
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
              className="fill-foreground text-[11px] font-mono font-semibold"
            >
              {active.weight}% attention
            </text>
            <text
              x={tooltipX + 8}
              y={tooltipY + 27}
              className="fill-muted-foreground text-[9px] font-mono"
            >
              position {active.position}{active.isSink ? " (sink)" : ""}
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
              <th className="text-left font-normal pb-1">Attention</th>
            </tr>
          </thead>
          <tbody>
            {DATA.map((p) => (
              <tr key={p.position} className={p.isSink ? "text-primary font-semibold" : "text-foreground/90"}>
                <td className="pr-4 py-0.5">
                  {p.position}
                  {p.isSink ? " (sink)" : ""}
                </td>
                <td className="py-0.5">{p.weight}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <p className="mt-2 text-[11px] text-muted-foreground italic">
        Illustrative weights, not measurements from a specific model — the shape
        (an outsized first position, a low flat tail) is what StreamingLLM and
        related work document.
      </p>
    </div>
  );
}
