import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Rocket, ChevronDown } from "lucide-react";

const STEPS = [
  { path: "cargo", label: "Cargo Manifest" },
  { path: "destination", label: "Destination & Clearance" },
  { path: "review", label: "Review & Launch" },
] as const;

export function WizardShell() {
  const location = useLocation();
  const activeIndex = STEPS.findIndex((step) => location.pathname.endsWith(`/${step.path}`));
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <Rocket className="w-4 h-4" />
          Mission Control Cargo Manifest
        </div>
        <motion.button
          type="button"
          onClick={() => setAboutOpen((open) => !open)}
          aria-expanded={aboutOpen}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          About this demo
          <motion.span animate={{ rotate: aboutOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3 h-3" />
          </motion.span>
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {aboutOpen && (
          <motion.div
            key="about-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mb-6 rounded-lg border border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                A resupply-run wizard for a space station:{" "}
                <span className="text-foreground">Cargo Manifest</span> browses a real product API
                into a manifest, <span className="text-foreground">Destination & Clearance</span>{" "}
                adds cascading selects with conditional Zod validation, and{" "}
                <span className="text-foreground">Review & Launch</span> totals the manifest in
                live "galactic credits" via a real WebSocket feed. It's a demo surface for React
                app architecture, strict TypeScript, Zustand-driven form state, and REST +
                real-time API integration — full write-up at{" "}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  docs/mission-control-cargo-manifest.md
                </code>
                .
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
