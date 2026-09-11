import { useEffect, useRef, useState } from "react";
import { frameChainsAt, frameGridAt, frameHeadHistoryAt, type ReplayLog } from "./replayLog";
import { chainPositions } from "./chainTrail";
import { TICK_MS } from "./simulation";

export const SPEED_OPTIONS = [0.5, 1, 2, 4];

/** How long playback holds on the final frame before `onEnded` fires. */
const END_HOLD_MS = 3000;

const BTN_PRIMARY =
  "px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity";
const BTN_SECONDARY =
  "px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed";

function rgba(color: number, alpha: number): string {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hex(color: number): string {
  return `#${(color & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Redraw the board at `index` — mirrors `LandGrabScene.draw()`, minus Phaser. */
function drawFrame(canvas: HTMLCanvasElement, log: ReplayLog, index: number, cell: number): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const grid = frameGridAt(log, index);
  const frame = log.frames[Math.max(0, Math.min(index, log.frames.length - 1))];
  const width = log.colCount * cell;
  const height = log.rowCount * cell;

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  for (let row = 0; row < log.rowCount; row++) {
    for (let col = 0; col < log.colCount; col++) {
      const state = grid[row][col];
      if (state.kind === "neutral") continue;
      const color = log.playerMeta[state.playerId]?.color ?? 0xffffff;
      ctx.fillStyle = rgba(color, state.kind === "territory" ? 0.9 : 0.4);
      ctx.fillRect(col * cell, row * cell, cell, cell);
    }
  }

  // Display-only: the trailing chain of previously-captured avatars, replayed
  // the same way the live game builds it — see `chainTrail.ts`.
  const chains = frameChainsAt(log, index);
  const headHistory = frameHeadHistoryAt(log, index);
  for (const id of log.playerOrder) {
    const player = frame.players[id];
    const chain = chains[id];
    if (!player || !player.alive || !chain || chain.length === 0) continue;
    const positions = chainPositions(headHistory[id] ?? [], chain.length);
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const capturedColor = log.playerMeta[chain[i]]?.color ?? log.playerMeta[id]?.color ?? 0xffffff;
      const cx = pos.col * cell + cell / 2;
      const cy = pos.row * cell + cell / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = rgba(capturedColor, 0.85);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.stroke();
    }
  }

  for (const id of log.playerOrder) {
    const player = frame.players[id];
    if (!player || !player.alive) continue;
    const color = log.playerMeta[id]?.color ?? 0xffffff;
    const cx = player.head.col * cell + cell / 2;
    const cy = player.head.row * cell + cell / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = hex(color);
    ctx.stroke();
  }
}

export interface LandGrabReplayProps {
  log: ReplayLog;
  /** Pixel size of one cell; defaults to a fit that keeps the board ~520px wide. */
  cellSize?: number;
  /** Start playing immediately, rather than resting paused on the last frame. */
  autoPlay?: boolean;
  /** Frame to start `autoPlay` from. Defaults to 0 (the opening frame). */
  startIndex?: number;
  /** Playback speed to start `autoPlay` at — one of `SPEED_OPTIONS`. Defaults to 2×. */
  initialSpeed?: number;
  /** Fired once when playback reaches the final frame (only while actually playing). */
  onEnded?: () => void;
  onClose?: () => void;
  /** Overrides the default card wrapper — pass `""` to drop it (e.g. inside a modal). */
  className?: string;
}

/**
 * Scrub / play back a recorded match. Pure viewer over a `ReplayLog` — it never
 * touches the live simulation, so it's safe to mount while a fresh match runs.
 */
export function LandGrabReplay({
  log,
  cellSize,
  autoPlay,
  startIndex,
  initialSpeed,
  onEnded,
  onClose,
  className,
}: LandGrabReplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCount = log.frames.length;

  const [index, setIndex] = useState(autoPlay ? (startIndex ?? 0) : frameCount - 1);
  const [playing, setPlaying] = useState(!!autoPlay);
  const [speed, setSpeed] = useState(initialSpeed ?? 2);
  // Fires `onEnded` at most once per log.
  const endedRef = useRef(false);

  const cell = cellSize ?? Math.max(6, Math.min(22, Math.floor(520 / Math.max(1, log.colCount))));

  // A new log (next finished match) resets playback per `autoPlay`/`startIndex`/`initialSpeed`.
  useEffect(() => {
    setIndex(autoPlay ? (startIndex ?? 0) : log.frames.length - 1);
    setPlaying(!!autoPlay);
    setSpeed(initialSpeed ?? 2);
    endedRef.current = false;
  }, [log, autoPlay, startIndex, initialSpeed]);

  useEffect(() => {
    if (canvasRef.current) drawFrame(canvasRef.current, log, index, cell);
  }, [log, index, cell]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((i) => Math.min(i + 1, frameCount - 1));
    }, TICK_MS / speed);
    return () => window.clearInterval(timer);
  }, [playing, speed, frameCount]);

  const clampedIndex = Math.max(0, Math.min(index, frameCount - 1));

  // Stop advancing once playback reaches the end. Split from the hold/announce
  // effect below: this one flips `playing`, so it must not also own the hold
  // timer — a single effect that both set `playing` and started the timeout
  // would re-run on its own `playing` change and cancel the timeout it just set.
  useEffect(() => {
    if (playing && clampedIndex >= frameCount - 1) setPlaying(false);
  }, [playing, clampedIndex, frameCount]);

  // Hold on the final frame for a beat so it actually reads, then announce it
  // once. Scrubbing/stepping away during the hold cancels the pending
  // announcement (the effect cleanup clears the timer).
  useEffect(() => {
    if (clampedIndex < frameCount - 1 || endedRef.current) return;
    endedRef.current = true;
    const timer = window.setTimeout(() => onEnded?.(), END_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [clampedIndex, frameCount, onEnded]);
  const frame = log.frames[clampedIndex];
  const width = log.colCount * cell;
  const height = log.rowCount * cell;

  const step = (delta: number) => {
    setPlaying(false);
    setIndex((i) => Math.max(0, Math.min(frameCount - 1, i + delta)));
  };

  return (
    <div
      className={className ?? "rounded-lg border border-border bg-card/40 p-4"}
      data-testid="landgrab-replay"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Replay</h3>
        <p className="text-xs text-muted-foreground">
          {frameCount} frame{frameCount === 1 ? "" : "s"}
          {log.truncated && " · capped, later ticks not recorded"} · in-memory only, replaced when the
          next match ends
        </p>
        {onClose && (
          <button onClick={onClose} className={BTN_SECONDARY + " ml-auto !px-2.5 !py-1 !text-xs"}>
            Close
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="rounded-md border border-border"
          style={{ width, height }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button onClick={() => setPlaying((p) => !p)} className={BTN_PRIMARY}>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => step(-1)} disabled={clampedIndex === 0} className={BTN_SECONDARY}>
          ◀ Step
        </button>
        <button
          onClick={() => step(1)}
          disabled={clampedIndex >= frameCount - 1}
          className={BTN_SECONDARY}
        >
          Step ▶
        </button>
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Speed
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
          >
            {SPEED_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-muted-foreground tabular-nums ml-auto">
          tick {frame.tick} · frame {clampedIndex + 1}/{frameCount}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, frameCount - 1)}
        value={clampedIndex}
        onChange={(e) => {
          setPlaying(false);
          setIndex(Number(e.target.value));
        }}
        className="w-full mt-2 accent-primary"
        aria-label="Replay frame"
      />

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        {log.playerOrder.map((id) => {
          const player = frame.players[id];
          const meta = log.playerMeta[id];
          if (!player || !meta) return null;
          return (
            <li key={id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full inline-block shrink-0"
                style={{ backgroundColor: hex(meta.color) }}
              />
              <span className="text-foreground font-medium truncate">{meta.label}</span>
              <span className="text-muted-foreground tabular-nums ml-auto">{player.ownedCount}</span>
              <span className="text-muted-foreground text-xs w-12 text-right">
                {player.alive ? player.facing : "sunk"}
              </span>
            </li>
          );
        })}
      </ul>

      {frame.winnerId && (
        <p className="mt-2 text-xs text-muted-foreground">
          Decided on this frame — winner: {log.playerMeta[frame.winnerId]?.label ?? frame.winnerId}
        </p>
      )}
    </div>
  );
}
