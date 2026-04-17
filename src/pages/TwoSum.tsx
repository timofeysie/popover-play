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
import { TwoSumDemo } from "@/features/twoSum";

const TwoSum = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    {/* Exercise Header */}
    <div className="mb-2 flex flex-col sm:flex-row sm:items-start gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 08
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          Two Sum
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Given an array of integers <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">nums</code> and an integer{" "}
          <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">target</code>, return the <strong className="text-foreground">indices</strong> of the two numbers that add up to <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">target</code>. A single-pass hash map gives O(n) time and O(n) space.
        </p>
        <details className="group mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
            <Lightbulb className="w-5 h-5 shrink-0 text-primary" aria-hidden />
            <span className="font-medium text-foreground">Key points</span>
          </summary>
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
            <ul className="list-disc list-inside pt-3 space-y-1.5">
              <li>Exactly one valid answer exists; you may not use the same element twice.</li>
              <li>For each element, compute its <strong className="text-foreground">complement</strong> = <code className="font-mono text-xs bg-muted px-1 rounded">target − nums[i]</code> and look it up in a hash map.</li>
              <li>If the complement is already in the map, return both indices immediately — O(1) lookup.</li>
              <li>Otherwise, store <code className="font-mono text-xs bg-muted px-1 rounded">value → index</code> in the map and continue.</li>
              <li>One pass; each element is visited at most once.</li>
            </ul>
          </div>
        </details>
      </div>
    </div>

    {/* How it works */}
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
                title: "Initialise the map",
                desc: "Create an empty Map<number, number> called seen that will store value → index pairs. It acts as a record of every element we have already processed.",
              },
              {
                step: "2",
                title: "Compute the complement",
                desc: "For each nums[i], calculate complement = target − nums[i]. If two numbers sum to target, one of them must equal this complement.",
              },
              {
                step: "3",
                title: "Check the map",
                desc: "If complement is already in seen, the pair has been found. Return [seen.get(complement), i]. The lookup is O(1) — constant time regardless of how many entries the map holds.",
              },
              {
                step: "4",
                title: "Record and continue",
                desc: "If complement is not in seen, store seen.set(nums[i], i) and move on. By deferring the write until after the check, we naturally avoid pairing an element with itself.",
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

    {/* Code Sample */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <Code2 className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Code Sample</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-6 pt-4">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-foreground">Hash map solution (TypeScript)</h4>
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-accent/60" />
                <span className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs text-code-comment font-mono">twoSum.ts</span>
              </div>
              <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                <code>
                  <span className="text-code-keyword">function </span>
                  <span className="text-code-foreground">twoSum(nums: </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">[], target: </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">): </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">[] {"{\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">seen = </span>
                  <span className="text-code-keyword">new </span>
                  <span className="text-code-tag">Map</span>
                  <span className="text-code-foreground">{"<"}</span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">, </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">{">();"}</span>
                  <span className="text-code-comment">{" // value → index\n\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">for </span>
                  <span className="text-code-foreground">{"(let i = 0; i < nums.length; i++) {\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">{"complement = target - nums[i];\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-keyword">if </span>
                  <span className="text-code-foreground">{"(seen.has(complement)) {\n"}</span>
                  <span className="text-code-foreground">{"      "}</span>
                  <span className="text-code-keyword">return </span>
                  <span className="text-code-foreground">{"[seen.get(complement)"}</span>
                  <span className="text-code-foreground">{"!, i];\n"}</span>
                  <span className="text-code-foreground">{"    }\n"}</span>
                  <span className="text-code-foreground">{"    seen.set(nums[i], i);\n"}</span>
                  <span className="text-code-foreground">{"  }\n\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">return </span>
                  <span className="text-code-foreground">{"[];"}</span>
                  <span className="text-code-comment">{" // unreachable given \"exactly one solution\"\n"}</span>
                  <span className="text-code-foreground">{"}"}</span>
                </code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The <code className="font-mono text-xs bg-muted px-1 rounded">!</code> non-null assertion on line 6 tells TypeScript that <code className="font-mono text-xs bg-muted px-1 rounded">seen.get(complement)</code> is defined — we already confirmed <code className="font-mono text-xs bg-muted px-1 rounded">seen.has(complement)</code> is true on the line above.
            </p>
          </div>
        </div>
      </details>
    </section>

    {/* Complexity */}
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
              The algorithm makes a single left-to-right pass. Each element is visited exactly once, and each hash-map operation (get, has, set) is O(1) on average.
            </p>
            <div className="space-y-2">
              <details className="group/time rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/time:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/time:inline" aria-hidden />
                  <span><strong className="text-foreground">Time:</strong> O(n) — one pass; each hash-map lookup and insert is O(1) amortised.</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
                  <p className="pt-3">
                    The loop runs at most n iterations. Inside each iteration we do at most one <code className="font-mono text-xs bg-muted px-1 rounded">has</code>, one <code className="font-mono text-xs bg-muted px-1 rounded">get</code>, and one <code className="font-mono text-xs bg-muted px-1 rounded">set</code> — all O(1). Total: O(n).
                  </p>
                </div>
              </details>
              <details className="group/space rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/space:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/space:inline" aria-hidden />
                  <span><strong className="text-foreground">Space:</strong> O(n) — the seen map can grow to hold every element in the worst case.</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
                  <p className="pt-3">
                    In the worst case (the answer pair is the last two elements), every element except the final one is stored in the map before a match is found. The map therefore holds up to n − 1 entries.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </details>
    </section>

    {/* Live Demo */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <GitBranch className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Live Demo</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <p className="text-muted-foreground mb-4 pt-4">
            Step through the algorithm on{" "}
            <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">
              nums = [3, 7, 1, 5, 11, 2, 4, 6, 8, 9]
            </code>
            {", "}
            <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">target = 17</code>.
            {" "}Watch each number flow from the array into the <strong className="text-foreground">seen</strong> map and see the complement check on every iteration. To try different inputs, edit{" "}
            <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">DEMO_INPUT</code>{" "}
            in <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">src/features/twoSum/TwoSumDemo.tsx</code>.
          </p>
          <TwoSumDemo />
        </div>
      </details>
    </section>

    {/* Problems */}
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
              <h4 className="font-medium text-foreground mb-2">LeetCode link</h4>
              <a
                href="https://leetcode.com/problems/two-sum/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                #1 — Two Sum
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                One of the most-solved problems on LeetCode; a classic warm-up for hash-map thinking.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Related problems</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Two Sum II — Input Array Is Sorted
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— two-pointer variant (O(1) space)</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/3sum/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    3Sum
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— extend to three numbers, O(n²)</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/four-sum/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    4Sum
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— generalisation to four numbers</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/subarray-sum-equals-k/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Subarray Sum Equals K
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— prefix-sum + hash map</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  </div>
);

export default TwoSum;
