import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import {
  createInitialGameState,
  setPlayerFacing,
  stepGame,
  DEFAULT_GAME_RULES,
  TICK_MS,
  type GameRules,
  type GameState,
  type PlayerConfig,
  type PlayerState,
} from "./simulation";
import { cloneProfile, DEFAULT_BOT_PROFILE, type BotProfile } from "./botProfile";
import { createBotMemory, DEFAULT_BOT_TYPE, type BotType } from "./botStrategy";
import { BotProfilePanel } from "./BotProfilePanel";
import { MatchRecordsPanel } from "./MatchRecordsPanel";
import { buildGameRecord, saveGameRecord, type LandGrabGameRecord } from "./gameRecord";
import { loadUserProfile, resolveUsername, saveUserProfile } from "./userProfile";
import type { Direction } from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CELL_SIZE = 22;
const DEFAULT_DIMS = { rows: 16, cols: 24, cell: CELL_SIZE };
const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

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
  { id: "bot-red", label: "Red Surveyor", color: 0xf87171, isBot: true, botType: "surveyor" },
  { id: "bot-yellow", label: "Yellow Rambler", color: 0xfacc15, isBot: true, botType: "rambler" },
  { id: "bot-green", label: "Green Surveyor", color: 0x4ade80, isBot: true, botType: "surveyor" },
];

const HUMAN_ID = "you";

function makeInitialProfiles(): Record<string, BotProfile> {
  return Object.fromEntries(PLAYER_CONFIGS.map((c) => [c.id, cloneProfile(DEFAULT_BOT_PROFILE)]));
}

function makeInitialAutopilot(): Record<string, boolean> {
  return Object.fromEntries(PLAYER_CONFIGS.map((c) => [c.id, false]));
}

function makeInitialBotTypes(): Record<string, BotType> {
  return Object.fromEntries(PLAYER_CONFIGS.map((c) => [c.id, c.botType ?? DEFAULT_BOT_TYPE]));
}

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

/** Mutable knobs the React layer owns and the Phaser tick loop reads each frame. */
interface SceneControl {
  paused: boolean;
  speed: number;
  /** Set by the Step button to let exactly one tick through while paused. */
  stepOnce: boolean;
}

interface SceneData {
  gameStateRef: { current: GameState };
  controlRef: { current: SceneControl };
  profilesRef: { current: Record<string, BotProfile> };
  autopilotRef: { current: Record<string, boolean> };
  botTypesRef: { current: Record<string, BotType> };
  rulesRef: { current: GameRules };
  onTick: (state: GameState) => void;
  cellSize: number;
}

class LandGrabScene extends Phaser.Scene {
  private gameStateRef!: SceneData["gameStateRef"];
  private controlRef!: SceneData["controlRef"];
  private profilesRef!: SceneData["profilesRef"];
  private autopilotRef!: SceneData["autopilotRef"];
  private botTypesRef!: SceneData["botTypesRef"];
  private rulesRef!: SceneData["rulesRef"];
  private onTick!: SceneData["onTick"];
  private cellSize = CELL_SIZE;
  private graphics!: Phaser.GameObjects.Graphics;
  private headMarkers: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super("land-grab");
  }

  init(data: SceneData) {
    this.gameStateRef = data.gameStateRef;
    this.controlRef = data.controlRef;
    this.profilesRef = data.profilesRef;
    this.autopilotRef = data.autopilotRef;
    this.botTypesRef = data.botTypesRef;
    this.rulesRef = data.rulesRef;
    this.onTick = data.onTick;
    this.cellSize = data.cellSize;
  }

  create() {
    this.graphics = this.add.graphics();
    this.draw();

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      // Phaser listens on window, so a keypress inside the Profiles panel lands
      // here too. Don't steer the boat (or swallow the key) when a form control
      // has focus — the panel's sliders need their own arrow-key handling.
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName)) return;
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) return;
      event.preventDefault();
      setPlayerFacing(this.gameStateRef.current, HUMAN_ID, direction);
    });

    this.time.addEvent({
      delay: TICK_MS,
      loop: true,
      callback: () => {
        const control = this.controlRef.current;
        this.time.timeScale = control.speed;
        if (control.paused && !control.stepOnce) return;
        control.stepOnce = false;

        const state = this.gameStateRef.current;
        // Push the React-owned knobs onto the live state before stepping.
        state.rules.respawnDelayTicks = this.rulesRef.current.respawnDelayTicks;
        for (const id of Object.keys(state.players)) {
          const player = state.players[id];
          const profile = this.profilesRef.current[id];
          if (profile) player.profile = profile;
          player.autopilot = !!this.autopilotRef.current[id];
          // Live archetype swap from the Profiles panel — rebuild the scratch bag
          // so the new strategy never reads the old one's memory shape.
          const nextType = this.botTypesRef.current[id];
          if (nextType && player.botType !== nextType) {
            player.botType = nextType;
            player.botMemory = createBotMemory(nextType);
          }
        }

        this.gameStateRef.current = stepGame(state);
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

/** `mm:ss` from a millisecond duration. */
function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export interface LandGrabDemoProps {
  hideControls?: boolean;
}

export function LandGrabDemo({ hideControls }: LandGrabDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<GridDims>(DEFAULT_DIMS);
  const [fullScreen, setFullScreen] = useState(false);

  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, BotProfile>>(makeInitialProfiles);
  const [autopilot, setAutopilot] = useState<Record<string, boolean>>(makeInitialAutopilot);
  const [botTypes, setBotTypes] = useState<Record<string, BotType>>(makeInitialBotTypes);
  const [rules, setRules] = useState<GameRules>({ ...DEFAULT_GAME_RULES });
  const [username, setUsername] = useState<string>(() => loadUserProfile().username);

  const controlRef = useRef<SceneControl>({ paused: false, speed: 1, stepOnce: false });
  const profilesRef = useRef(profiles);
  const autopilotRef = useRef(autopilot);
  const botTypesRef = useRef(botTypes);
  const rulesRef = useRef(rules);
  const usernameRef = useRef(username);

  /** The human's display name, trimmed and never empty. Bots keep their fixed labels. */
  const displayLabel = (player: Pick<PlayerState, "id" | "label">): string =>
    player.id === HUMAN_ID ? resolveUsername(username) : player.label;

  const buildConfigs = (): PlayerConfig[] =>
    PLAYER_CONFIGS.map((c) => ({
      ...c,
      label: c.id === HUMAN_ID ? resolveUsername(usernameRef.current) : c.label,
      profile: cloneProfile(profilesRef.current[c.id] ?? DEFAULT_BOT_PROFILE),
      autopilot: !!autopilotRef.current[c.id],
      botType: botTypesRef.current[c.id] ?? c.botType,
    }));

  const stateHolderRef = useRef<{ current: GameState }>({
    current: createInitialGameState(DEFAULT_DIMS.rows, DEFAULT_DIMS.cols, buildConfigs(), rulesRef.current),
  });
  const [players, setPlayers] = useState<Record<string, PlayerState>>(stateHolderRef.current.current.players);
  const [tick, setTick] = useState(0);
  const [restartToken, setRestartToken] = useState(0);
  const [gameOver, setGameOver] = useState<LandGrabGameRecord | null>(null);
  // Guards the once-per-match record write from inside the Phaser tick loop.
  const recordedRef = useRef(false);
  // Read inside the tick loop; the preview card (hideControls) doesn't record or pop a dialog.
  const hideControlsRef = useRef(hideControls);
  hideControlsRef.current = hideControls;

  const restart = () => setRestartToken((n) => n + 1);

  const leaderboard = Object.values(players).sort((a, b) => b.ownedCount - a.ownedCount);

  useEffect(() => {
    controlRef.current.paused = paused;
  }, [paused]);
  useEffect(() => {
    controlRef.current.speed = speed;
  }, [speed]);
  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);
  useEffect(() => {
    autopilotRef.current = autopilot;
  }, [autopilot]);
  useEffect(() => {
    botTypesRef.current = botTypes;
  }, [botTypes]);
  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);
  useEffect(() => {
    usernameRef.current = username;
    saveUserProfile({ schemaVersion: 1, username });
  }, [username]);

  // Space toggles pause, "." single-steps. Ignore while a control has focus so
  // the panel's sliders/buttons keep their own key handling.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPaused((p) => !p);
      } else if (event.key === ".") {
        event.preventDefault();
        controlRef.current.stepOnce = true;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

    stateHolderRef.current.current = createInitialGameState(dims.rows, dims.cols, buildConfigs(), rulesRef.current);
    setPlayers(stateHolderRef.current.current.players);
    setTick(0);
    setGameOver(null);
    recordedRef.current = false;
    controlRef.current.paused = false;
    setPaused(false);

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
        controlRef,
        profilesRef,
        autopilotRef,
        botTypesRef,
        rulesRef,
        cellSize: dims.cell,
        onTick: (state: GameState) => {
          setPlayers({ ...state.players });
          setTick(state.tick);
          if (!hideControlsRef.current && state.winnerId && !recordedRef.current) {
            recordedRef.current = true;
            const record = buildGameRecord(state);
            saveGameRecord(record);
            setGameOver(record);
            controlRef.current.paused = true;
            setPaused(true);
          }
        },
      } satisfies SceneData
    );

    return () => {
      game.destroy(true);
    };
    // Profiles/rules/autopilot are read from refs on build, not deps — editing
    // them must not tear down and restart the match.
  }, [restartToken, dims]);

  const handleProfileChange = (id: string, key: keyof BotProfile, value: number) => {
    setProfiles((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };
  const handleResetProfile = (id: string) => {
    setProfiles((prev) => ({ ...prev, [id]: cloneProfile(DEFAULT_BOT_PROFILE) }));
  };
  const handleResetAll = () => {
    setProfiles(makeInitialProfiles());
    setBotTypes(makeInitialBotTypes());
    setRules({ ...DEFAULT_GAME_RULES });
  };

  return (
    <div
      className={
        (fullScreen ? "fixed inset-0 z-50 bg-background p-4 overflow-auto " : "") + "flex flex-col gap-4"
      }
    >
      <div className="flex flex-col min-[1400px]:flex-row min-[1400px]:items-start gap-4">
        <div className="flex flex-col gap-4 min-w-0">
          <div ref={containerRef} className="rounded-lg overflow-hidden border border-border w-fit max-w-full overflow-x-auto" />
          {!hideControls && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={restart}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Restart
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                disabled={!!gameOver}
                className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                aria-pressed={paused}
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => {
                  controlRef.current.stepOnce = true;
                }}
                disabled={!paused || !!gameOver}
                className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Step
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
              <button
                onClick={() => setShowProfiles((s) => !s)}
                className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                aria-expanded={showProfiles}
              >
                {showProfiles ? "Hide profiles" : "Profiles"}
              </button>
              <button
                onClick={() => setShowRecords((s) => !s)}
                className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                aria-expanded={showRecords}
              >
                {showRecords ? "Hide records" : "Records"}
              </button>
              <ul className="flex flex-wrap gap-4 text-sm min-[1400px]:hidden">
                {leaderboard.map((player) => (
                  <li key={player.id} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colorToHex(player.color) }} />
                    <span className="text-foreground font-medium">{displayLabel(player)}</span>
                    <span className="text-muted-foreground">{player.ownedCount} cells</span>
                    {!player.alive && <span className="text-destructive text-xs">trying to respawn…</span>}
                  </li>
                ))}
              </ul>
              <span className="text-xs text-muted-foreground ml-auto" data-testid="landgrab-tick">
                Arrow keys / WASD to move · Space pauses · “.” steps · tick {tick}
              </span>
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
                  <span className="text-foreground font-medium truncate">{displayLabel(player)}</span>
                  <span className="text-muted-foreground tabular-nums ml-auto">{player.ownedCount}</span>
                </li>
              ))}
            </ol>
            <ul className="mt-3 flex flex-col gap-1">
              {leaderboard.filter((p) => !p.alive).map((player) => (
                <li key={player.id} className="text-destructive text-xs">{displayLabel(player)} trying to respawn…</li>
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
      {!hideControls && showRecords && (
        <MatchRecordsPanel key={gameOver?.endedAt ?? "records"} />
      )}
      {!hideControls && showProfiles && (
        <BotProfilePanel
          configs={PLAYER_CONFIGS}
          humanId={HUMAN_ID}
          username={username}
          profiles={profiles}
          autopilot={autopilot}
          botTypes={botTypes}
          rules={rules}
          onUsernameChange={setUsername}
          onProfileChange={handleProfileChange}
          onAutopilotChange={(id, on) => setAutopilot((prev) => ({ ...prev, [id]: on }))}
          onBotTypeChange={(id, type) => setBotTypes((prev) => ({ ...prev, [id]: type }))}
          onResetProfile={handleResetProfile}
          onResetAll={handleResetAll}
          onRulesChange={(patch) => setRules((prev) => ({ ...prev, ...patch }))}
        />
      )}
      {!hideControls && (
        <AlertDialog open={gameOver !== null} onOpenChange={(open) => !open && setGameOver(null)}>
          <AlertDialogContent data-testid="landgrab-gameover">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: gameOver?.winner.color }}
                />
                {gameOver?.winner.label} wins
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    {gameOver && gameOver.winner.ownedCount >= gameOver.board.totalCells
                      ? `${gameOver.winner.label} captured the entire board.`
                      : `${gameOver?.winner.label} was the last boat afloat with nowhere left for the others to respawn.`}
                  </p>
                  {gameOver && (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt className="text-muted-foreground">Ticks</dt>
                      <dd className="tabular-nums text-foreground">{gameOver.ticks}</dd>
                      <dt className="text-muted-foreground">Match time</dt>
                      <dd className="tabular-nums text-foreground">{formatDuration(gameOver.durationMs)}</dd>
                      <dt className="text-muted-foreground">Board</dt>
                      <dd className="tabular-nums text-foreground">
                        {gameOver.board.cols}×{gameOver.board.rows} · {gameOver.board.totalCells} cells
                      </dd>
                      <dt className="text-muted-foreground">Winner cells</dt>
                      <dd className="tabular-nums text-foreground">
                        {gameOver.winner.ownedCount} ({Math.round(gameOver.winner.ownedFraction * 100)}%)
                      </dd>
                      <dt className="text-muted-foreground">Winner captures</dt>
                      <dd className="tabular-nums text-foreground">{gameOver.winner.captures}</dd>
                    </dl>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Saved to this browser as a game record (<code>landgrab:game-records</code>).
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setGameOver(null)}>Dismiss</AlertDialogCancel>
              <AlertDialogAction onClick={restart}>Play again</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
