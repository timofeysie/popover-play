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

const ROW_COUNT = 16;
const COL_COUNT = 24;
const CELL_SIZE = 22;

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
}

class LandGrabScene extends Phaser.Scene {
  private gameStateRef!: SceneData["gameStateRef"];
  private onTick!: SceneData["onTick"];
  private graphics!: Phaser.GameObjects.Graphics;
  private headMarkers: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super("land-grab");
  }

  init(data: SceneData) {
    this.gameStateRef = data.gameStateRef;
    this.onTick = data.onTick;
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
    const g = this.graphics;
    g.clear();

    g.fillStyle(0x0f172a, 1);
    g.fillRect(0, 0, COL_COUNT * CELL_SIZE, ROW_COUNT * CELL_SIZE);

    for (let row = 0; row < state.rowCount; row++) {
      for (let col = 0; col < state.colCount; col++) {
        const cell = state.grid[row][col];
        if (cell.kind === "neutral") continue;
        const player = state.players[cell.playerId];
        const color = player?.color ?? 0xffffff;
        g.fillStyle(color, cell.kind === "territory" ? 0.9 : 0.4);
        g.fillRect(col * CELL_SIZE + 1, row * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }

    g.lineStyle(1, 0x1e293b, 0.6);
    for (let col = 0; col <= COL_COUNT; col++) {
      g.lineBetween(col * CELL_SIZE, 0, col * CELL_SIZE, ROW_COUNT * CELL_SIZE);
    }
    for (let row = 0; row <= ROW_COUNT; row++) {
      g.lineBetween(0, row * CELL_SIZE, COL_COUNT * CELL_SIZE, row * CELL_SIZE);
    }

    for (const marker of this.headMarkers) marker.destroy();
    this.headMarkers = [];
    for (const player of Object.values(state.players)) {
      if (!player.alive) continue;
      const cx = player.head.col * CELL_SIZE + CELL_SIZE / 2;
      const cy = player.head.row * CELL_SIZE + CELL_SIZE / 2;
      const marker = this.add.circle(cx, cy, CELL_SIZE * 0.28, 0xffffff);
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
  const stateHolderRef = useRef<{ current: GameState }>({
    current: createInitialGameState(ROW_COUNT, COL_COUNT, PLAYER_CONFIGS),
  });
  const [players, setPlayers] = useState<Record<string, PlayerState>>(stateHolderRef.current.current.players);
  const [tick, setTick] = useState(0);
  const [restartToken, setRestartToken] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    stateHolderRef.current.current = createInitialGameState(ROW_COUNT, COL_COUNT, PLAYER_CONFIGS);
    setPlayers(stateHolderRef.current.current.players);
    setTick(0);

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: COL_COUNT * CELL_SIZE,
      height: ROW_COUNT * CELL_SIZE,
      parent: containerRef.current,
      backgroundColor: "#0f172a",
    });

    game.scene.add(
      "land-grab",
      LandGrabScene,
      true,
      {
        gameStateRef: stateHolderRef.current,
        onTick: (state: GameState) => {
          setPlayers({ ...state.players });
          setTick(state.tick);
        },
      } satisfies SceneData
    );

    return () => {
      game.destroy(true);
    };
  }, [restartToken]);

  return (
    <div className="flex flex-col gap-4">
      <div ref={containerRef} className="rounded-lg overflow-hidden border border-border w-fit max-w-full overflow-x-auto" />
      {!hideControls && (
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setRestartToken((n) => n + 1)}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Restart
          </button>
          <ul className="flex flex-wrap gap-4 text-sm">
            {Object.values(players).map((player) => (
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
  );
}
