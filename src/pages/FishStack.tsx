import {
  BookOpen,
  Zap,
  GitBranch,
  ChevronRight,
  ExternalLink,
  ListChecks,
  Plus,
  Minus,
  Lightbulb,
  Code2,
  BarChart2,
} from "lucide-react";
import { FishStackDemo } from "@/features/fishStack";

const FishStack = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    {/* Exercise Header */}
    <div className="mb-2 flex flex-col sm:flex-row sm:items-start gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 06
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          The Fish Stack Problem
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          N fish move along a river; each has a size and direction (upstream or downstream). When two fish moving in opposite directions meet, the <strong className="text-foreground">larger eats the smaller</strong>. Using a single stack and one pass left-to-right, we count how many fish survive — a classic Codility stacks-and-queues problem.
        </p>
        <details className="group mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
            <Lightbulb className="w-5 h-5 shrink-0 text-primary" aria-hidden />
            <span className="font-medium text-foreground">Key points</span>
          </summary>
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
            <ul className="list-disc list-inside pt-3 space-y-1.5">
              <li>Arrays <strong className="text-foreground">A</strong> (sizes) and <strong className="text-foreground">B</strong> (directions: 0 = upstream, 1 = downstream); index 0 is upstream.</li>
              <li>Only opposite-direction pairs can meet; when they do, the larger fish wins and keeps moving.</li>
              <li>Process fish <strong className="text-foreground">left to right</strong>: push downstream fish onto a stack; upstream fish &quot;fight&quot; the stack top (pop smaller, survive if stack empties).</li>
              <li>Answer = upstream survivors + number of fish left on the stack.</li>
            </ul>
            <p className="mt-4">
              This problem is a good interview exercise for stacks: one pass, O(N) time and space, and the stack naturally represents &quot;downstream fish still in play.&quot;
            </p>
          </div>
        </details>
      </div>
    </div>

    {/* How it works - native accordion */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <BookOpen className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">How it works</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            {[
              {
                step: "1",
                title: "Order of processing",
                desc: "Scan fish from index 0 to N−1 (upstream to downstream). Meetings only happen between a downstream fish to the left and an upstream fish to the right (they move toward each other).",
              },
              {
                step: "2",
                title: "Downstream fish (B[i] = 1)",
                desc: "Push the fish&apos;s size onto a stack. These are &quot;pending&quot; downstream fish that might later eat or be eaten by upstream fish to their right.",
              },
              {
                step: "3",
                title: "Upstream fish (B[i] = 0)",
                desc: "It first meets the nearest downstream fish to its left — the top of the stack. While the top is smaller, the current fish eats it (pop). If the stack becomes empty, this upstream fish survives; otherwise the new top eats it.",
              },
              {
                step: "4",
                title: "Result",
                desc: "Survivors = (number of upstream fish that ever emptied the stack) + (number of downstream fish still on the stack).",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-card border border-border rounded-lg p-5"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                  {item.step}
                </span>
                <h4 className="font-semibold mb-1 text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </section>

    {/* Code Samples - native accordion */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <Code2 className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Code Samples</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-8 pt-4">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-foreground">Stack solution (TypeScript)</h4>
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-accent/60" />
                <span className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs text-code-comment font-mono">fish.ts</span>
              </div>
              <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                <code>
                  <span className="text-code-keyword">function solution</span>
                  <span className="text-code-foreground">(A: number[], B: number[]): number </span>
                  <span className="text-code-foreground">{"{\n  "}</span>
                  <span className="text-code-keyword">const</span>
                  <span className="text-code-foreground">{" downstreamStack: number[] = [];\n  "}</span>
                  <span className="text-code-keyword">let</span>
                  <span className="text-code-foreground">{" upstreamSurvivors = 0;\n\n  "}</span>
                  <span className="text-code-keyword">for</span>
                  <span className="text-code-foreground"> (</span>
                  <span className="text-code-keyword">let</span>
                  <span className="text-code-foreground">{" i = 0; i < A.length; i++) {\n    "}</span>
                  <span className="text-code-keyword">if</span>
                  <span className="text-code-foreground">{" (B[i] === 1) {\n      downstreamStack.push(A[i]);\n    } "}</span>
                  <span className="text-code-keyword">else</span>
                  <span className="text-code-foreground"> {"{\n      "}</span>
                  <span className="text-code-keyword">while</span>
                  <span className="text-code-foreground">{" (downstreamStack.length > 0 && downstreamStack[downstreamStack.length - 1] < A[i]) {\n        downstreamStack.pop();\n      }\n      "}</span>
                  <span className="text-code-keyword">if</span>
                  <span className="text-code-foreground">{" (downstreamStack.length === 0) {\n        upstreamSurvivors++;\n      }\n    }\n  }\n\n  "}</span>
                  <span className="text-code-keyword">return</span>
                  <span className="text-code-foreground">{" upstreamSurvivors + downstreamStack.length;\n}"}</span>
                </code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              One pass: downstream fish are pushed; upstream fish pop until they eat or are eaten. Each fish is pushed at most once and popped at most once.
            </p>
          </div>
        </div>
      </details>
    </section>

    {/* Complexity - native accordion */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <BarChart2 className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Complexity</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              The algorithm does a single left-to-right pass over the arrays. Time and space are both linear in the number of fish N.
            </p>
            <div className="space-y-2">
              <details className="group/time rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/time:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/time:inline" aria-hidden />
                  <span><strong className="text-foreground">Time:</strong> O(N) — each fish is processed once; each push/pop is O(1), and each fish is pushed at most once and popped at most once.</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                  <p className="pt-3">
                    The loop runs N iterations. Although an upstream fish may trigger multiple pops, the total number of pops across the whole run is at most N (every downstream fish is pushed at most once and therefore popped at most once). So total work is O(N).
                  </p>
                </div>
              </details>
              <details className="group/space rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/space:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/space:inline" aria-hidden />
                  <span><strong className="text-foreground">Space:</strong> O(N) — the stack can hold up to N fish in the worst case (e.g. all fish flowing downstream).</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                  <p className="pt-3">
                    We only keep one stack of downstream fish sizes and a few scalar variables. In the worst case, no upstream fish ever empties the stack (e.g. all B[i] = 1), so the stack size grows to N.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </details>
    </section>

    {/* Live Demo - native accordion */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <GitBranch className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Live Demo</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <p className="text-muted-foreground mb-4 pt-4">
            Run the stack simulation on the example A = [4, 3, 2, 1, 5], B = [0, 1, 0, 0, 0]. The river shows each fish (size and direction); the downstream stack and upstream survivor count update step-by-step. Eaten fish are struck through.
          </p>
          <FishStackDemo />
        </div>
      </details>
    </section>

    {/* Problems - native accordion */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <ListChecks className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Problems</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <div className="pt-4 space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">Codility link</h4>
              <a
                href="https://app.codility.com/programmers/lessons/7-stacks_and_queues/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                Stacks and Queues — Fish
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                Free lesson on Codility; the Fish task is in this lesson.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Related problems</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://app.codility.com/programmers/lessons/7-stacks_and_queues/brackets/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Brackets
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— stack for matching pairs</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/valid-parentheses/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Valid Parentheses
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— classic stack</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/min-stack/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Min Stack
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— stack with O(1) min</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  </div>
);

export default FishStack;
