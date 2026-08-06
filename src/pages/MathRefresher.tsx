import { Sigma } from "lucide-react";
import { BallTrajectoryDemo, FormulaGlossary } from "@/features/mathRefresher";

const MathRefresher = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
      <Sigma className="w-4 h-4" />
      Math Refresher
    </div>
    <h2 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
      Quadratic Polynomials
    </h2>
    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
      A quadratic polynomial has the form{" "}
      <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">
        h(t) = at² + bt + c
      </code>
      . One classic example: the height of a ball thrown into the air, plotted
      against time. Drag the sliders to change the throw and watch the curve
      redraw.
    </p>

    <FormulaGlossary />
    <BallTrajectoryDemo />
  </div>
);

export default MathRefresher;
