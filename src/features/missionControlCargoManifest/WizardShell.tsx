import { Outlet, useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
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
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-full overflow-hidden transition-colors ${
                  isActive
                    ? "text-primary-foreground"
                    : isComplete
                      ? "bg-muted text-foreground"
                      : "bg-muted/40 text-muted-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="wizard-step-indicator"
                    className="absolute inset-0 bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative font-mono">{index + 1}</span>
                <span className="relative">{step.label}</span>
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
