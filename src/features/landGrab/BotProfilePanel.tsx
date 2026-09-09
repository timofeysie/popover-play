import { BOT_PROFILE_FIELDS, type BotProfile } from "./botProfile";
import type { GameRules, PlayerConfig } from "./simulation";

function colorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(2)));
}

/** The fixed rules a keyboard-controlled human plays by — shown read-only. */
const HUMAN_RULES = [
  "Buffered input: a key press sets the facing used on the next tick.",
  "No 180° flip back onto your own live wake.",
  "Start gate: your boat holds on its base until your first key press (re-arms after a respawn).",
];

export interface BotProfilePanelProps {
  configs: PlayerConfig[];
  humanId: string;
  profiles: Record<string, BotProfile>;
  autopilot: Record<string, boolean>;
  rules: GameRules;
  onProfileChange: (id: string, key: keyof BotProfile, value: number) => void;
  onAutopilotChange: (id: string, on: boolean) => void;
  onResetProfile: (id: string) => void;
  onResetAll: () => void;
  onRulesChange: (patch: Partial<GameRules>) => void;
}

export function BotProfilePanel({
  configs,
  humanId,
  profiles,
  autopilot,
  rules,
  onProfileChange,
  onAutopilotChange,
  onResetProfile,
  onResetAll,
  onRulesChange,
}: BotProfilePanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4" data-testid="bot-profile-panel">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
        <h3 className="text-sm font-semibold text-foreground">Profiles &amp; tuning</h3>
        <p className="text-xs text-muted-foreground">
          Every bot scores its four moves with these numbers each tick. Changes apply on the next tick — pause first if
          you want to line up an experiment.
        </p>
        <label className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
          <span className="text-foreground font-medium">Respawn delay</span>
          <input
            type="range"
            min={0}
            max={60}
            step={1}
            value={rules.respawnDelayTicks}
            onChange={(e) => onRulesChange({ respawnDelayTicks: Number(e.target.value) })}
            className="w-28 accent-primary"
          />
          <span className="tabular-nums text-foreground w-8">{rules.respawnDelayTicks}</span>
          <span>ticks</span>
        </label>
        <button
          onClick={onResetAll}
          className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          Reset all
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {configs.map((config) => {
          const isHuman = config.id === humanId;
          const driven = !isHuman || autopilot[config.id];
          const profile = profiles[config.id];
          return (
            <div key={config.id} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: colorToHex(config.color) }}
                />
                <span className="text-sm font-medium text-foreground">{config.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1 py-px">
                  {isHuman ? "you" : "bot"}
                </span>
                {driven && (
                  <button
                    onClick={() => onResetProfile(config.id)}
                    className="ml-auto text-xs text-primary hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {isHuman && (
                <label className="flex items-center gap-2 text-xs text-foreground mb-2">
                  <input
                    type="checkbox"
                    checked={!!autopilot[config.id]}
                    onChange={(e) => onAutopilotChange(config.id, e.target.checked)}
                    className="accent-primary"
                  />
                  Autopilot — hand this boat to the bot scorer
                </label>
              )}

              {isHuman && !autopilot[config.id] ? (
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  {HUMAN_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {BOT_PROFILE_FIELDS.map((field) => {
                    const inputId = `${config.id}-${field.key}`;
                    return (
                      <div key={field.key}>
                        <div className="flex items-center justify-between gap-2">
                          <label htmlFor={inputId} className="text-xs text-foreground">
                            {field.label}
                          </label>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {formatValue(profile[field.key])}
                          </span>
                        </div>
                        <input
                          id={inputId}
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={profile[field.key]}
                          onChange={(e) => onProfileChange(config.id, field.key, Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <p className="text-[11px] leading-snug text-muted-foreground">{field.hint}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
