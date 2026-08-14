import { Brain } from "lucide-react";
import { AttentionLimitsDemo } from "@/features/attentionLimits";

const AttentionLimits = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
      <Brain className="w-4 h-4" />
      Attention & Context Limits
    </div>
    <h2 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
      Threshold Decay and Other Instruction Limits
    </h2>
    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
      Instruction-following doesn't degrade gracefully as a prompt or config
      file grows — it holds, then falls off a cliff. A glossary of the
      mechanisms behind it, from{" "}
      <a
        href="https://paddo.dev/blog/your-agents-md-is-a-liability/"
        target="_blank"
        rel="noreferrer"
        className="underline decoration-dotted underline-offset-4 hover:text-foreground"
      >
        "Your AGENTS.md is a Liability"
      </a>
      , plus notes on which terms are established ML research vs. blog framing.
    </p>

    <AttentionLimitsDemo />

    <div className="mt-8 rounded-xl border border-border bg-muted/20 p-6">
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Why this matters here
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Directly relevant to how a file like this repo's own{" "}
        <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
          CLAUDE.md
        </code>{" "}
        should be written: keep it short, put the most important rules first,
        reinforce critical ones near the end, and don't assume rule #47 in a
        long list survives — the middle is the least reliable position.
      </p>
    </div>
  </div>
);

export default AttentionLimits;
