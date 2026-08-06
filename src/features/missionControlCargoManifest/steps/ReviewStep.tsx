import { Navigate } from "react-router-dom";
import { useMccmStore } from "../store/mccmStore";

export function ReviewStep() {
  const hasCargo = useMccmStore((state) => state.lines.length > 0);

  if (!hasCargo) {
    return <Navigate to="/mccm/cargo" replace />;
  }

  return (
    <div className="rounded-xl border border-dashed border-border p-6 md:p-8">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Step 3 — Review & Launch
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Manifest review and the live "galactic credit" ticker land in M6.
      </p>
    </div>
  );
}
