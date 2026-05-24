import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

const TICKER = "NXCR";
const K = 5;
const CLOSES = [
  100, 98, 102, 105, 103,
  107, 110, 108, 112, 115,
  113, 109, 106, 108, 112,
  116, 119, 117, 121, 118,
  122, 125, 123, 120, 124,
  127, 124, 128, 131, 129,
];
const Y_MIN = Math.min(...CLOSES) - 4; // chart baseline below all prices
const ANIMATION_MS = 700;

interface SessionPoint {
  day: string;
  session: number;
  close: number;
  rollingHigh: number | null;
  rollingLow: number | null;
  channelBase: number | null;  // rollingLow - Y_MIN  (stacked area base, transparent)
  channelWidth: number | null; // rollingHigh - rollingLow  (stacked area band, tinted)
}

function computeDonchian(): SessionPoint[] {
  const maxDeque: number[] = [];
  const minDeque: number[] = [];

  return CLOSES.map((close, i) => {
    if (maxDeque.length && maxDeque[0] <= i - K) maxDeque.shift();
    while (maxDeque.length && CLOSES[maxDeque[maxDeque.length - 1]] < close) maxDeque.pop();
    maxDeque.push(i);

    if (minDeque.length && minDeque[0] <= i - K) minDeque.shift();
    while (minDeque.length && CLOSES[minDeque[minDeque.length - 1]] > close) minDeque.pop();
    minDeque.push(i);

    const warmup = i < K - 1;
    const high = warmup ? null : CLOSES[maxDeque[0]];
    const low  = warmup ? null : CLOSES[minDeque[0]];

    return {
      day: `D${i + 1}`,
      session: i + 1,
      close,
      rollingHigh: high,
      rollingLow: low,
      channelBase:  low  !== null              ? low - Y_MIN        : null,
      channelWidth: high !== null && low !== null ? high - low       : null,
    };
  });
}

const ALL_DATA = computeDonchian();

export function DonchianChannelDemo() {
  const [sessionIdx, setSessionIdx] = useState(K - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pause = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(true);
    setSessionIdx(K - 1);
    let i = K - 1;
    intervalRef.current = setInterval(() => {
      if (i < CLOSES.length - 1) { i++; setSessionIdx(i); }
      else { clearInterval(intervalRef.current!); intervalRef.current = null; setIsPlaying(false); }
    }, ANIMATION_MS);
  }, []);

  const stepBack    = useCallback(() => { if (isPlaying) pause(); setSessionIdx(p => Math.max(K - 1, p - 1)); }, [isPlaying, pause]);
  const stepForward = useCallback(() => { if (isPlaying) pause(); setSessionIdx(p => Math.min(CLOSES.length - 1, p + 1)); }, [isPlaying, pause]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const windowStart   = sessionIdx - K + 1;
  const windowEnd     = sessionIdx;
  const currentHigh   = ALL_DATA[sessionIdx].rollingHigh;
  const currentLow    = ALL_DATA[sessionIdx].rollingLow;
  const windowPrices  = CLOSES.slice(windowStart, windowEnd + 1);
  const maxInWindow   = Math.max(...windowPrices);
  const minInWindow   = Math.min(...windowPrices);
  const isDone        = sessionIdx === CLOSES.length - 1;

  // Null out channel fields for sessions we haven't reached yet
  const chartData = useMemo(
    () => ALL_DATA.map((d, i) =>
      i <= sessionIdx ? d : { ...d, rollingHigh: null, rollingLow: null, channelBase: null, channelWidth: null }
    ),
    [sessionIdx],
  );

  // Inline dot renderer for the price line
  const renderDot = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      const { cx, cy, index } = props;
      if (cx == null || cy == null) return <g key={index} />;
      const price   = CLOSES[index];
      const inWin   = index >= windowStart && index <= windowEnd;
      const isHigh  = inWin && price === maxInWindow;
      const isLow   = inWin && price === minInWindow;
      if (isHigh) return <circle key={index} cx={cx} cy={cy} r={5} fill="hsl(var(--primary))"    stroke="hsl(var(--card))" strokeWidth={1.5} />;
      if (isLow)  return <circle key={index} cx={cx} cy={cy} r={5} fill="hsl(var(--destructive))" stroke="hsl(var(--card))" strokeWidth={1.5} />;
      if (inWin)  return <circle key={index} cx={cx} cy={cy} r={3.5} fill="hsl(var(--foreground))" stroke="hsl(var(--card))" strokeWidth={1} />;
      return <circle key={index} cx={cx} cy={cy} r={2} fill="hsl(var(--muted-foreground))" />;
    },
    [windowStart, windowEnd, maxInWindow, minInWindow],
  );

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">

      {/* Header + controls */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground font-mono">{TICKER}</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">FICTIONAL</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {K}-session Donchian Channel · rolling high/low via monotonic deque O(n)
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={play} disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
            <Play className="w-3.5 h-3.5" /> Play
          </button>
          <button type="button" onClick={pause} disabled={!isPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-foreground text-xs font-medium hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none">
            <Pause className="w-3.5 h-3.5" /> Pause
          </button>
          <button type="button" onClick={stepBack} disabled={sessionIdx <= K - 1}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-muted/30 text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button type="button" onClick={stepForward} disabled={isDone}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-muted/30 text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step label */}
      <p className="text-xs text-muted-foreground">
        {`Session D${sessionIdx + 1} of D${CLOSES.length} · window D${windowStart + 1}–D${windowEnd + 1}${isDone ? " — all sessions processed" : ""}`}
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} interval={4} />
          <YAxis domain={[Y_MIN, "auto"]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false} tickLine={false} width={34} tickFormatter={(v) => `$${v}`} />

          {/* Custom tooltip — hides the computed channelBase/channelWidth entries */}
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const get = (key: string) => payload.find(p => p.dataKey === key)?.value as number | undefined;
              const close = get("close");
              const high  = get("rollingHigh");
              const low   = get("rollingLow");
              return (
                <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs space-y-0.5">
                  <p className="font-semibold text-foreground mb-1">{label}</p>
                  {close != null && <p>Close: <span className="font-mono font-bold">${close}</span></p>}
                  {high  != null && <p className="text-primary">{K}-Day High: <span className="font-mono font-bold">${high}</span></p>}
                  {low   != null && <p className="text-destructive">{K}-Day Low: <span className="font-mono font-bold">${low}</span></p>}
                  {high != null && low != null && (
                    <p className="text-muted-foreground">Channel width: <span className="font-mono">${high - low}</span></p>
                  )}
                </div>
              );
            }}
          />

          {/* Current window highlight */}
          <ReferenceArea
            x1={`D${windowStart + 1}`} x2={`D${windowEnd + 1}`}
            fill="hsl(var(--accent))" fillOpacity={0.15}
            stroke="hsl(var(--accent))" strokeOpacity={0.5} strokeWidth={1}
          />

          {/* Donchian band: transparent base stacked under tinted width */}
          <Area type="monotone" dataKey="channelBase"  stackId="dc"
            fill="transparent" fillOpacity={0} stroke="none" isAnimationActive={false} legendType="none" />
          <Area type="monotone" dataKey="channelWidth" stackId="dc"
            fill="hsl(var(--primary))" fillOpacity={0.12} stroke="none" isAnimationActive={false} legendType="none" />

          {/* Channel boundary lines */}
          <Line type="monotone" dataKey="rollingHigh" stroke="hsl(var(--primary))"
            strokeWidth={1.5} dot={false} connectNulls={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="rollingLow"  stroke="hsl(var(--primary))"
            strokeWidth={1.5} strokeDasharray="4 2" dot={false} connectNulls={false} isAnimationActive={false} />

          {/* Price line */}
          <Line type="monotone" dataKey="close" stroke="hsl(var(--foreground))"
            strokeWidth={2} dot={renderDot} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground font-mono w-8">D{K}</span>
        <input type="range" min={K - 1} max={CLOSES.length - 1} value={sessionIdx}
          onChange={e => { if (isPlaying) pause(); setSessionIdx(Number(e.target.value)); }}
          className="flex-1 accent-primary cursor-pointer" />
        <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">D{CLOSES.length}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Session",       value: `D${sessionIdx + 1}`,           sub: `close $${CLOSES[sessionIdx]}`,  accent: "bg-muted/20 border-border",         labelCls: "text-muted-foreground" },
          { label: "Window",        value: `D${windowStart+1}–D${windowEnd+1}`, sub: `${K} sessions`,            accent: "bg-muted/20 border-border",         labelCls: "text-muted-foreground" },
          { label: `${K}-Day High`, value: `$${currentHigh ?? "—"}`,        sub: "upper channel",                accent: "bg-primary/10 border-primary/20",   labelCls: "text-primary" },
          { label: `${K}-Day Low`,  value: `$${currentLow  ?? "—"}`,        sub: "lower channel",                accent: "bg-destructive/10 border-destructive/20", labelCls: "text-destructive" },
        ] as const).map(({ label, value, sub, accent, labelCls }) => (
          <div key={label} className={`rounded-lg border p-3 ${accent}`}>
            <div className={`text-[10px] font-semibold uppercase tracking-wide ${labelCls}`}>{label}</div>
            <div className="text-lg font-bold font-mono text-foreground mt-0.5">{value}</div>
            <div className="text-[10px] text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* Window price boxes */}
      <div>
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Prices in window · D{windowStart + 1}–D{windowEnd + 1}
        </div>
        <div className="flex flex-wrap gap-2">
          {windowPrices.map((price, i) => {
            const isHigh = price === maxInWindow;
            const isLow  = price === minInWindow;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className={[
                  "flex flex-col items-center rounded border-2 px-3 py-1.5 min-w-[3.5rem] transition-all",
                  isHigh ? "bg-primary/15 border-primary" : isLow ? "bg-destructive/15 border-destructive" : "bg-muted/20 border-border",
                ].join(" ")}>
                  <span className="text-sm font-bold font-mono text-foreground">${price}</span>
                  <span className="text-[10px] text-muted-foreground">D{windowStart + i + 1}</span>
                </div>
                <span className={["text-[9px] font-mono h-3", isHigh ? "text-primary" : isLow ? "text-destructive" : "text-transparent"].join(" ")}>
                  {isHigh ? "high" : isLow ? "low" : "·"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* O(n) note */}
      <div className="rounded-lg bg-muted/20 border border-border px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Why O(n): </span>
        each closing price enters and leaves each deque at most once, so updating the channel
        costs amortised O(1) per session. All {CLOSES.length} sessions require{" "}
        <span className="font-mono text-foreground">≤ {2 * CLOSES.length}</span> deque
        operations — versus{" "}
        <span className="font-mono text-foreground">{CLOSES.length} × {K} = {CLOSES.length * K}</span>{" "}
        for a brute-force re-scan.
      </div>
    </div>
  );
}
