import { ThresholdDecay } from "./ThresholdDecay";
import { AttentionDilution } from "./AttentionDilution";
import { AttentionSinks } from "./AttentionSinks";
import { LostInTheMiddle } from "./LostInTheMiddle";
import { TheDumbZone } from "./TheDumbZone";
import { ContextRot } from "./ContextRot";

export function AttentionLimitsDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <ThresholdDecay />
      <AttentionDilution />
      <AttentionSinks />
      <LostInTheMiddle />
      <TheDumbZone />
      <ContextRot />
    </div>
  );
}
