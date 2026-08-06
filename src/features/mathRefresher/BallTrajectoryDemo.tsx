import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { Rocket } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  heightAt,
  vertexTime,
  flightDuration,
  type QuadraticCoefficients,
} from "./trajectory";

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 320;
const PADDING = 32;
const PLOT_WIDTH = VIEW_WIDTH - PADDING * 2;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING * 2;
const SAMPLE_COUNT = 60;
const ANIMATION_SECONDS = 2.6;
const GRID_COLUMNS = 8;
const GRID_ROWS = 6;

const TITLE_WORDS = ["The", "path", "of", "a", "thrown", "ball"];

function buildPathAndScales(coeffs: QuadraticCoefficients) {
  const duration = flightDuration(coeffs);
  const peak = heightAt(coeffs, vertexTime(coeffs));
  const maxHeight = Math.max(peak, coeffs.c, 1) * 1.15;

  const toX = (t: number) => PADDING + (t / duration) * PLOT_WIDTH;
  const toY = (h: number) => PADDING + PLOT_HEIGHT - (h / maxHeight) * PLOT_HEIGHT;

  const points = Array.from({ length: SAMPLE_COUNT + 1 }, (_, i) => {
    const t = (i / SAMPLE_COUNT) * duration;
    return { t, h: heightAt(coeffs, t) };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.t).toFixed(2)} ${toY(p.h).toFixed(2)}`)
    .join(" ");

  return { duration, maxHeight, toX, toY, path };
}

export function BallTrajectoryDemo() {
  const [coeffs, setCoeffs] = useState<QuadraticCoefficients>({ a: -4.9, b: 20, c: 1 });
  const [readout, setReadout] = useState({ t: 0, h: coeffs.c, phase: "rising" as "rising" | "falling" });
  const [showPeak, setShowPeak] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const t = useMotionValue(0);
  const stopRef = useRef<{ stop: () => void } | null>(null);
  const isDraggingRef = useRef(false);
  const autoLaunchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const svgRef = useRef<SVGSVGElement>(null);

  const { duration, maxHeight, toX, toY, path } = useMemo(() => buildPathAndScales(coeffs), [coeffs]);
  const vertexT = useMemo(() => vertexTime(coeffs), [coeffs]);

  const cx = useTransform(t, (latest) => toX(latest));
  const cy = useTransform(t, (latest) => toY(heightAt(coeffs, latest)));
  const drawnFraction = useTransform(t, (latest) => (duration > 0 ? latest / duration : 0));

  useMotionValueEvent(t, "change", (latest) => {
    const h = heightAt(coeffs, latest);
    setReadout({ t: latest, h, phase: latest < vertexT ? "rising" : "falling" });
    setShowPeak(Math.abs(latest - vertexT) < duration * 0.02);
  });

  const cancelAutoLaunch = () => {
    if (autoLaunchTimeoutRef.current) clearTimeout(autoLaunchTimeoutRef.current);
  };

  const launch = () => {
    cancelAutoLaunch();
    stopRef.current?.stop();
    t.set(0);
    setShowPeak(false);
    const controls = animate(t, duration, {
      duration: ANIMATION_SECONDS,
      ease: "linear",
    });
    stopRef.current = controls;
  };

  useEffect(() => {
    autoLaunchTimeoutRef.current = setTimeout(launch, 900);
    return cancelAutoLaunch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCoeffChange = (key: keyof QuadraticCoefficients) => (value: number[]) => {
    cancelAutoLaunch();
    stopRef.current?.stop();
    t.set(0);
    setShowPeak(false);
    setHasInteracted(true);
    setCoeffs((prev) => ({ ...prev, [key]: value[0] }));
  };

  const clientXToTime = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return t.get();
    const rect = svg.getBoundingClientRect();
    const localX = ((clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const ratio = (localX - PADDING) / PLOT_WIDTH;
    return Math.min(Math.max(ratio, 0), 1) * duration;
  };

  const handleDragStart = (event: PointerEvent<SVGCircleElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    isDraggingRef.current = true;
    cancelAutoLaunch();
    stopRef.current?.stop();
    setHasInteracted(true);
    t.set(clientXToTime(event.clientX));
  };

  const handleDragMove = (event: PointerEvent<SVGCircleElement>) => {
    if (!isDraggingRef.current) return;
    t.set(clientXToTime(event.clientX));
  };

  const handleDragEnd = (event: PointerEvent<SVGCircleElement>) => {
    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const groundY = VIEW_HEIGHT - PADDING;

  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
      <motion.h3
        className="text-2xl font-bold tracking-tight text-foreground mb-1 flex flex-wrap gap-x-2"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {TITLE_WORDS.map((word, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h3>
      <motion.p
        className="text-sm text-muted-foreground mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        is modeled by a quadratic polynomial —{" "}
        <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
          h(t) = at² + bt + c
        </code>
        . Drag the ball to explore any point on its path.
      </motion.p>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="w-full h-auto rounded-lg bg-muted/30 border border-border"
          role="img"
          aria-label="Graph of the ball's height over time, tracing a downward parabola. The ball is draggable."
        >
          <defs>
            <pattern
              id="mathrefresher-grid"
              width={PLOT_WIDTH / GRID_COLUMNS}
              height={PLOT_HEIGHT / GRID_ROWS}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${PLOT_WIDTH / GRID_COLUMNS} 0 L 0 0 0 ${PLOT_HEIGHT / GRID_ROWS}`}
                fill="none"
                className="stroke-border"
                strokeWidth={1}
                opacity={0.4}
              />
            </pattern>
          </defs>

          {/* Background graph grid */}
          <rect
            x={PADDING}
            y={PADDING}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
            fill="url(#mathrefresher-grid)"
          />

          {/* Ground line */}
          <line
            x1={PADDING}
            y1={groundY}
            x2={VIEW_WIDTH - PADDING}
            y2={groundY}
            className="stroke-border"
            strokeWidth={2}
          />
          {/* Axis labels */}
          <text x={PADDING - 8} y={PADDING + 4} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">
            h={maxHeight.toFixed(1)}
          </text>
          <text x={PADDING - 8} y={groundY} textAnchor="end" className="fill-muted-foreground text-[10px] font-mono">
            0
          </text>
          <text x={PADDING} y={groundY + 20} className="fill-muted-foreground text-[11px] font-mono">
            t = 0
          </text>
          <text
            x={VIEW_WIDTH - PADDING}
            y={groundY + 20}
            textAnchor="end"
            className="fill-muted-foreground text-[11px] font-mono"
          >
            t = {duration.toFixed(2)}s
          </text>

          {/* Trajectory path, drawn in step with the ball's progress */}
          <motion.path
            d={path}
            fill="none"
            className="stroke-primary"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ pathLength: drawnFraction }}
          />

          {/* Vertex marker */}
          <AnimatePresence>
            {showPeak && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <circle
                  cx={toX(vertexT)}
                  cy={toY(heightAt(coeffs, vertexT))}
                  r={5}
                  className="fill-accent"
                />
                <text
                  x={toX(vertexT)}
                  y={toY(heightAt(coeffs, vertexT)) - 12}
                  textAnchor="middle"
                  className="fill-accent text-[11px] font-mono font-semibold"
                >
                  peak
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Guide lines from the ball to each axis */}
          <motion.line
            className="stroke-primary/40"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            style={{ x1: cx, y1: cy, x2: cx, y2: groundY }}
          />
          <motion.line
            className="stroke-primary/40"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            style={{ x1: PADDING, y1: cy, x2: cx, y2: cy }}
          />

          {/* The ball (visible dot, non-interactive) */}
          <motion.circle r={8} className="fill-primary pointer-events-none" style={{ cx, cy }} />

          {/* Larger invisible hit area so the ball is easy to grab */}
          <motion.circle
            r={18}
            className="fill-transparent cursor-grab active:cursor-grabbing"
            style={{ cx, cy, touchAction: "none" }}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          />

          <AnimatePresence>
            {!hasInteracted && (
              <motion.text
                x={VIEW_WIDTH / 2}
                y={PADDING - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                ← drag the ball →
              </motion.text>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Live plugged-in formula */}
      <div className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3 overflow-x-auto">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
          Plugged in at t = {readout.t.toFixed(2)}
        </div>
        <div className="font-mono text-sm whitespace-nowrap text-foreground">
          h({readout.t.toFixed(2)}) ={" "}
          <span className="text-code-keyword">{coeffs.a.toFixed(2)}</span>(
          {readout.t.toFixed(2)})² +{" "}
          <span className="text-code-string">{coeffs.b.toFixed(2)}</span>(
          {readout.t.toFixed(2)}) +{" "}
          <span className="text-code-tag">{coeffs.c.toFixed(2)}</span> ={" "}
          <span className="font-semibold text-primary">{readout.h.toFixed(2)}</span>
        </div>
      </div>

      {/* Live readout */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <ReadoutTile label="t (seconds)" value={readout.t.toFixed(2)} />
        <ReadoutTile label="h(t) (height)" value={readout.h.toFixed(2)} />
        <ReadoutTile label="phase" value={readout.phase} />
      </div>

      {/* Controls */}
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <CoefficientSlider
          label="a (gravity pull)"
          value={coeffs.a}
          min={-8}
          max={-2}
          step={0.1}
          onValueChange={handleCoeffChange("a")}
        />
        <CoefficientSlider
          label="b (launch velocity)"
          value={coeffs.b}
          min={5}
          max={30}
          step={0.5}
          onValueChange={handleCoeffChange("b")}
        />
        <CoefficientSlider
          label="c (initial height)"
          value={coeffs.c}
          min={0}
          max={5}
          step={0.1}
          onValueChange={handleCoeffChange("c")}
        />
      </div>

      <motion.button
        onClick={() => {
          setHasInteracted(true);
          launch();
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
      >
        <Rocket className="w-4 h-4" aria-hidden="true" />
        Launch the ball
      </motion.button>
    </div>
  );
}

function ReadoutTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <motion.div
        key={value}
        initial={{ opacity: 0.4, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="font-mono text-lg font-semibold text-foreground tabular-nums"
      >
        {value}
      </motion.div>
    </div>
  );
}

function CoefficientSlider({
  label,
  value,
  min,
  max,
  step,
  onValueChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-mono text-foreground">{value.toFixed(1)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={onValueChange} />
    </div>
  );
}
