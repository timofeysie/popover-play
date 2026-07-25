import { Zap } from "lucide-react";
import { JavascriptGotchasDemo } from "@/features/javascriptGotchas";

const JavascriptGotchas = () => (
  <div>
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-4">
      <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
        <Zap className="w-4 h-4" />
        Exercise 10
      </div>
      <h2 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
        JavaScript Gotchas
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
        Floating-point surprises, object references, and other traps that catch
        even experienced developers — starting with why{" "}
        <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">
          0.1 + 0.2 !== 0.3
        </code>
        .
      </p>
    </div>
    <JavascriptGotchasDemo />
  </div>
);

export default JavascriptGotchas;
