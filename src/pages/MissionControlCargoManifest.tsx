import { Rocket } from "lucide-react";
import { PlanOverview } from "@/features/missionControlCargoManifest";

const MissionControlCargoManifest = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
      <Rocket className="w-4 h-4" />
      Mission Control Cargo Manifest
    </div>
    <h2 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
      MCCM
    </h2>
    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
      A multi-step cargo requisition wizard for a space station resupply run —
      the demo surface for React app-level architecture, strict TypeScript,
      Zustand-driven transactional form state, and REST + real-time API
      integration. This page is the plan; the wizard itself is coming next.
    </p>

    <PlanOverview />
  </div>
);

export default MissionControlCargoManifest;
