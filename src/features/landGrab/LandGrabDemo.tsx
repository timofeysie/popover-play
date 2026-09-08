import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import {
  createInitialGameState,
  setPlayerFacing,
  stepGame,
  TICK_MS,
  type GameState,
  type PlayerConfig,
  type PlayerState,
} from "./simulation";
import type { Direction } from "./types";

const CELL_SIZE = 22;
const DEFAULT_DIMS = { rows: 16, cols: 24, cell: CELL_SIZE };

interface GridDims {
  rows: number;
  cols: number;
  cell: number;
}

/** Grow the board to fill the browser window while keeping the cell size constant. */
function computeFullScreenDims(): GridDims {
  const cell = CELL_SIZE;
  const gap = 16;
  const overlayPadding = 16 * 2; // matches the overlay's p-4
  const asideWidth = window.innerWidth >= 1400 ? 224 + gap : 0; // w-56 sidebar + gap
  const controlsHeight = 56; // Restart row under the board
  const availWidth = window.innerWidth - overlayPadding - asideWidth;
  const availHeight = window.innerHeight - overlayPadding - controlsHeight;
  return {
    cell,
    cols: Math.max(DEFAULT_DIMS.cols, Math.floor(availWidth / cell)),
    rows: Math.max(DEFAULT_DIMS.rows, Math.floor(availHeight / cell)),
  };
}

const PLAYER_CONFIGS: PlayerConfig[] = [
  { id: "you", label: "You", color: 0x38bdf8, isBot: false },
  { id: "bot-red", label: "Red Bot", color: 0xf87171, isBot: true },
  { id: "bot-yellow", label: "Yellow Bot", color: 0xfacc15, isBot: true },
  { id: "bot-green", label: "Green Bot", color: 0x4ade80, isBot: true },
];

const HUMAN_ID = "you";

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

interface SceneData {
  gameStateRef: { current: GameState };
  onTick: (state: GameState) => void;
  cellSize: number;
}

class LandGrabScene extends Phaser.Scene {
  private gameStateRef!: SceneData["gameStateRef"];
  private onTick!: SceneData["onTick"];
  private cellSize = CELL_SIZE;
  private graphics!: Phaser.GameObjects.Graphics;
  private headMarkers: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super("land-grab");
  }

  init(data: SceneData) {
    this.gameStateRef = data.gameStateRef;
    this.onTick = data.onTick;
    this.cellSize = data.cellSize;
  }

  create() {
    this.graphics = this.add.graphics();
    this.draw();

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) return;
      event.preventDefault();
      setPlayerFacing(this.gameStateRef.current, HUMAN_ID, direction);
    });

    this.time.addEvent({
      delay: TICK_MS,
      loop: true,
      callback: () => {
        this.gameStateRef.current = stepGame(this.gameStateRef.current);
        this.draw();
        this.onTick(this.gameStateRef.current);
      },
    });
  }

  private draw() {
    const state = this.gameStateRef.current;
    const cell = this.cellSize;
    const width = state.colCount * cell;
    const height = state.rowCount * cell;
    const g = this.graphics;
    g.clear();

    g.fillStyle(0x0f172a, 1);
    g.fillRect(0, 0, width, height);

    for (let row = 0; row < state.rowCount; row++) {
      for (let col = 0; col < state.colCount; col++) {
        const cellState = state.grid[row][col];
        if (cellState.kind === "neutral") continue;
        const player = state.players[cellState.playerId];
        const color = player?.color ?? 0xffffff;
        g.fillStyle(color, cellState.kind === "territory" ? 0.9 : 0.4);
        g.fillRect(col * cell + 1, row * cell + 1, cell - 2, cell - 2);
      }
    }

    g.lineStyle(1, 0x1e293b, 0.6);
    for (let col = 0; col <= state.colCount; col++) {
      g.lineBetween(col * cell, 0, col * cell, height);
    }
    for (let row = 0; row <= state.rowCount; row++) {
      g.lineBetween(0, row * cell, width, row * cell);
    }

    for (const marker of this.headMarkers) marker.destroy();
    this.headMarkers = [];
    for (const player of Object.values(state.players)) {
      if (!player.alive) continue;
      const cx = player.head.col * cell + cell / 2;
      const cy = player.head.row * cell + cell / 2;
      const marker = this.add.circle(cx, cy, cell * 0.28, 0xffffff);
      marker.setStrokeStyle(2, player.color);
      this.headMarkers.push(marker);
    }
  }
}

function colorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

export interface LandGrabDemoProps {
  hideControls?: boolean;
}

export function LandGrabDemo({ hideControls }: LandGrabDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<GridDims>(DEFAULT_DIMS);
  const [fullScreen, setFullScreen] = useState(false);
  const stateHolderRef = useRef<{ current: GameState }>({
    current: createInitialGameState(DEFAULT_DIMS.rows, DEFAULT_DIMS.cols, PLAYER_CONFIGS),
  });
  const [players, setPlayers] = useState<Record<string, PlayerState>>(stateHolderRef.current.current.players);
  const [tick, setTick] = useState(0);
  const [restartToken, setRestartToken] = useState(0);

  const leaderboard = Object.values(players).sort((a, b) => b.ownedCount - a.ownedCount);

  // Toggling full screen changes the cell count, so the game restarts on a fresh board.
  const toggleFullScreen = () => {
    const next = !fullScreen;
    setFullScreen(next);
    setDims(next ? computeFullScreenDims() : DEFAULT_DIMS);
  };

  useEffect(() => {
    if (!fullScreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullScreen(false);
        setDims(DEFAULT_DIMS);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullScreen]);

  useEffect(() => {
    if (!containerRef.current) return;

    stateHolderRef.current.current = createInitialGameState(dims.rows, dims.cols, PLAYER_CONFIGS);
    setPlayers(stateHolderRef.current.current.players);
    setTick(0);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: dims.cols * dims.cell,
      height: dims.rows * dims.cell,
      parent: containerRef.current,
      backgroundColor: "#0f172a",
    });

    game.scene.add(
      "land-grab",
      LandGrabScene,
      true,
      {
        gameStateRef: stateHolderRef.current,
        cellSize: dims.cell,
        onTick: (state: GameState) => {
          setPlayers({ ...state.players });
          setTick(state.tick);
        },
      } satisfies SceneData
    );

    return () => {
      game.destroy(true);
    };
  }, [restartToken, dims]);

  return (
    <div
      className={
        (fullScreen
          ? "fixed inset-0 z-50 bg-background p-4 overflow-auto "
          : "") + "flex flex-col min-[1400px]:flex-row min-[1400px]:items-start gap-4"
      }
    >
      <div className="flex flex-col gap-4 min-w-0">
        <div ref={containerRef} className="rounded-lg overflow-hidden border border-border w-fit max-w-full overflow-x-auto" />
        {!hideControls && (
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setRestartToken((n) => n + 1)}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Restart
            </button>
            <ul className="flex flex-wrap gap-4 text-sm min-[1400px]:hidden">
              {leaderboard.map((player) => (
                <li key={player.id} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colorToHex(player.color) }} />
                  <span className="text-foreground font-medium">{player.label}</span>
                  <span className="text-muted-foreground">{player.ownedCount} cells</span>
                  {!player.alive && <span className="text-destructive text-xs">respawning…</span>}
                </li>
              ))}
            </ul>
            <span className="text-xs text-muted-foreground ml-auto">Arrow keys / WASD to move · tick {tick}</span>
          </div>
        )}
      </div>
      {!hideControls && (
        <aside
          className={
            (fullScreen ? "block " : "hidden min-[1400px]:block ") +
            "shrink-0 w-56 rounded-lg border border-border p-4"
          }
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">Leaderboard</h3>
          <ol className="flex flex-col gap-2 text-sm">
            {leaderboard.map((player, index) => (
              <li key={player.id} className="flex items-center gap-2">
                <span className="text-muted-foreground tabular-nums w-4">{index + 1}</span>
                <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ backgroundColor: colorToHex(player.color) }} />
                <span className="text-foreground font-medium truncate">{player.label}</span>
                <span className="text-muted-foreground tabular-nums ml-auto">{player.ownedCount}</span>
              </li>
            ))}
          </ol>
          <ul className="mt-3 flex flex-col gap-1">
            {leaderboard.filter((p) => !p.alive).map((player) => (
              <li key={player.id} className="text-destructive text-xs">{player.label} respawning…</li>
            ))}
          </ul>
          <button
            onClick={toggleFullScreen}
            className="mt-4 w-full px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {fullScreen ? "Exit full screen" : "Full screen"}
          </button>
          {fullScreen && (
            <p className="mt-2 text-xs text-muted-foreground">
              {dims.cols}×{dims.rows} cells · press Esc to exit
            </p>
          )}
        </aside>
      )}
    </div>
  );
}
