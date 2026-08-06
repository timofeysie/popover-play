import { Outlet, useLocation, Link } from "react-router-dom";
import { Rocket } from "lucide-react";

const STEPS = [
  { path: "cargo", label: "Cargo Manifest" },
  { path: "destination", label: "Destination & Clearance" },
  { path: "review", label: "Review & Launch" },
] as const;

export function WizardShell() {
  const location = useLocation();
  const activeIndex = STEPS.findIndex((step) => location.pathname.endsWith(`/${step.path}`));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <Rocket className="w-4 h-4" />
          Mission Control Cargo Manifest
        </div>
        <Link
          to="/mccm/plan"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          About this demo
        </Link>
      </div>

      <ol className="flex items-center gap-2 mb-8">
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete = activeIndex !== -1 && index < activeIndex;
          return (
            <li key={step.path} className="flex items-center gap-2 flex-1">
              <div
                aria-current={isActive ? "step" : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-full transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-muted text-foreground"
                      : "bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="font-mono">{index + 1}</span>
                {step.label}
              </div>
              {index < STEPS.length - 1 && (
                <span className="text-muted-foreground/40" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <Outlet />
    </div>
  );
}
