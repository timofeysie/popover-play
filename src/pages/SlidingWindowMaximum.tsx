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
  Columns2,
  TrendingUp,
} from "lucide-react";
import {
  SlidingWindowMaxDemo,
  SlidingWindowComparisonVisualization,
  DonchianChannelDemo,
} from "@/features/slidingWindowMaximum";

const SlidingWindowMaximum = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    {/* Exercise Header */}
    <div className="mb-2 flex flex-col sm:flex-row sm:items-start gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 09
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          Sliding Window Maximum
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Given an array <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">nums</code> and a window size{" "}
          <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">k</code>, return the <strong className="text-foreground">maximum of every window of size k</strong> as it slides from left to right. A monotonic deque solves it in O(n) — each element enters and leaves the deque at most once.
        </p>
        <details className="group mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
            <Lightbulb className="w-5 h-5 shrink-0 text-primary" aria-hidden />
            <span className="font-medium text-foreground">Key points</span>
          </summary>
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
            <ul className="list-disc list-inside pt-3 space-y-1.5">
              <li>Brute force is O(n·k); the deque trick brings it down to <strong className="text-foreground">O(n)</strong>.</li>
              <li>Store <strong className="text-foreground">indices</strong> in the deque, not values — you need indices to know when an element leaves the window.</li>
              <li>Maintain a <strong className="text-foreground">monotonic decreasing</strong> deque: values strictly decrease from front to back.</li>
              <li>The front always holds the index of the current window&apos;s maximum.</li>
              <li>Each index is pushed once and popped at most once — amortised O(1) per step.</li>
            </ul>
            <p className="mt-4">
              Sliding-window-with-extrema is a classic interview pattern. The same monotonic-deque idea powers problems like <em>sliding window minimum</em>, <em>shortest subarray with sum at least k</em>, and several stock/temperature problems.
            </p>
            <p className="mt-3 font-medium text-foreground">Real-world applications</p>
            <ul className="list-disc list-inside mt-1.5 space-y-1.5">
              <li><strong className="text-foreground">Financial charting</strong> — rolling high/low over the last <em>n</em> trading sessions (Bollinger Bands, Donchian Channels) is exactly this problem at market data scale.</li>
              <li><strong className="text-foreground">Network monitoring</strong> — tracking peak throughput or maximum latency in the last <em>k</em> seconds to trigger alerts without re-scanning the whole history.</li>
              <li><strong className="text-foreground">Video/image processing</strong> — morphological dilation (max-pooling over a sliding kernel) uses this trick along each row and column to process frames in O(n) instead of O(n·k).</li>
              <li><strong className="text-foreground">Game AI &amp; simulations</strong> — maintaining the highest threat score or resource value visible within an agent&apos;s perception radius as it moves, updated incrementally each tick.</li>
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
                title: "Drop indices that fell out",
                desc: "When i advances, the window becomes [i−k+1, i]. If the front of the deque holds an index ≤ i−k, it is no longer in the window — shift it off.",
              },
              {
                step: "2",
                title: "Pop smaller values from the back",
                desc: "While the value at the back of the deque is < nums[i], pop it. Those elements can never be the max again — a larger, more recent value (nums[i]) dominates them for the rest of their lifetime in the window.",
              },
              {
                step: "3",
                title: "Push the current index",
                desc: "Append i to the back. The deque stays monotonic decreasing because we removed everything smaller in step 2.",
              },
              {
                step: "4",
                title: "Record the window max",
                desc: "Once i ≥ k − 1 the window is full. The front of the deque is the index of the maximum, so push nums[deque[0]] to the result. Repeat until i reaches the end.",
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

    {/* Code Samples */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <Code2 className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Code Samples</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border space-y-8 pt-4">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-foreground">Monotonic deque (O(n))</h4>
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-accent/60" />
                <span className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs text-code-comment font-mono">maxSlidingWindow.ts</span>
              </div>
              <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                <code>
                  <span className="text-code-keyword">function </span>
                  <span className="text-code-foreground">maxSlidingWindow(nums: </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">[], k: </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">): </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">[] {"{\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">deque: </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">[] = [];</span>
                  <span className="text-code-comment">{" // holds indices, values strictly decreasing\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">{"result: "}</span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">{"[] = [];\n\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">for </span>
                  <span className="text-code-foreground">{"(let i = 0; i < nums.length; i++) {\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-comment">{"// 1. drop the front if it has slid out of the window\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-keyword">if </span>
                  <span className="text-code-foreground">{"(deque.length > 0 && deque[0] <= i - k) {\n"}</span>
                  <span className="text-code-foreground">{"      deque.shift();\n"}</span>
                  <span className="text-code-foreground">{"    }\n\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-comment">{"// 2. pop smaller values from the back\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-keyword">while </span>
                  <span className="text-code-foreground">{"(deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {\n"}</span>
                  <span className="text-code-foreground">{"      deque.pop();\n"}</span>
                  <span className="text-code-foreground">{"    }\n\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-comment">{"// 3. push current index\n"}</span>
                  <span className="text-code-foreground">{"    deque.push(i);\n\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-comment">{"// 4. once the window is full, the front is the max\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-keyword">if </span>
                  <span className="text-code-foreground">{"(i >= k - 1) {\n"}</span>
                  <span className="text-code-foreground">{"      result.push(nums[deque[0]]);\n"}</span>
                  <span className="text-code-foreground">{"    }\n"}</span>
                  <span className="text-code-foreground">{"  }\n\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">return </span>
                  <span className="text-code-foreground">{"result;\n"}</span>
                  <span className="text-code-foreground">{"}"}</span>
                </code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <code className="font-mono text-xs bg-muted px-1 rounded">Array.shift()</code> is O(n) in JavaScript. For a strict O(n) implementation use a real deque (head pointer + ring buffer) or store the head index manually — see the next sample.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-foreground">Brute force baseline (O(n·k))</h4>
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-accent/60" />
                <span className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs text-code-comment font-mono">maxSlidingWindowBrute.ts</span>
              </div>
              <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                <code>
                  <span className="text-code-keyword">function </span>
                  <span className="text-code-foreground">maxSlidingWindowBrute(nums: </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">[], k: </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">): </span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">[] {"{\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">const </span>
                  <span className="text-code-foreground">{"out: "}</span>
                  <span className="text-code-tag">number</span>
                  <span className="text-code-foreground">{"[] = [];\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">for </span>
                  <span className="text-code-foreground">{"(let i = 0; i <= nums.length - k; i++) {\n"}</span>
                  <span className="text-code-foreground">{"    "}</span>
                  <span className="text-code-foreground">{"out.push(Math.max(...nums.slice(i, i + k)));\n"}</span>
                  <span className="text-code-foreground">{"  }\n"}</span>
                  <span className="text-code-foreground">{"  "}</span>
                  <span className="text-code-keyword">return </span>
                  <span className="text-code-foreground">{"out;\n"}</span>
                  <span className="text-code-foreground">{"}"}</span>
                </code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Easy to read and write under interview pressure, but it re-scans the whole window each step. For the constraint <code className="font-mono text-xs bg-muted px-1 rounded">nums.length ≤ 10<sup>5</sup></code> this is borderline — and is exactly the case the deque solution is designed for.
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
              The naïve approach is O(n·k) because each window does an O(k) scan. The deque approach is O(n) overall: although the inner <code className="font-mono text-xs bg-muted px-1 rounded">while</code> loop looks unbounded, every index is pushed and popped at most once across the whole run — the classic <strong className="text-foreground">amortised analysis</strong>.
            </p>
            <div className="space-y-2">
              <details className="group/time rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/time:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/time:inline" aria-hidden />
                  <span><strong className="text-foreground">Time:</strong> O(n) — each index is pushed once and popped at most once across the whole run.</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
                  <p className="pt-3">
                    The outer loop runs n times. The inner <code className="font-mono text-xs bg-muted px-1 rounded">while</code> can pop many elements in a single step, but every popped index was pushed earlier and will never be touched again. So the total work across all steps is bounded by 2n, giving O(n).
                  </p>
                </div>
              </details>
              <details className="group/space rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/space:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/space:inline" aria-hidden />
                  <span><strong className="text-foreground">Space:</strong> O(k) — the deque holds at most k indices at any time.</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
                  <p className="pt-3">
                    The deque only ever stores indices that lie inside the current window of size k, so its size is bounded by k. The result array is O(n − k + 1) but is part of the required output, so it is usually counted separately from auxiliary space.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </details>
    </section>

    {/* Side-by-Side Comparison */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <Columns2 className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Side-by-Side Comparison</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <p className="text-muted-foreground mb-4 pt-4 text-sm">
            Both algorithms run on the same input in lockstep. Watch the brute force re-scan the
            full window every step while the deque maintains three simultaneous guarantees — the
            monotonic trick, recency, and dominance — that keep total work linear.
          </p>
          <SlidingWindowComparisonVisualization />
        </div>
      </details>
    </section>

    {/* Real-world Example */}
    <section className="mb-2">
      <details className="group rounded-lg border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
          <TrendingUp className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Real-world Example — Donchian Channel</span>
        </summary>
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <p className="text-muted-foreground mb-4 pt-4 text-sm">
            A <strong className="text-foreground">Donchian Channel</strong> plots the rolling high and low over the last{" "}
            <em>k</em> trading sessions — the upper band is the sliding window maximum, the lower band is the minimum.
            Traders use the width and position of the channel to identify breakouts and trend strength.
            Step through the sessions to watch the channel grow, the window slide, and the O(n) deque keep the bands updated in one pass.
          </p>
          <DonchianChannelDemo />
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
              nums = [1, 3, -1, -3, 5, 3, 6, 7]
            </code>
            {", "}
            <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">k = 3</code>.
            {" "}Watch the window slide, smaller values get popped from the back, and the front of the deque always hold the window&apos;s max. Expected output:{" "}
            <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">[3, 3, 5, 5, 6, 7]</code>.
            {" "}To try different inputs, edit{" "}
            <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">DEMO_INPUT</code>{" "}
            in <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">src/features/slidingWindowMaximum/SlidingWindowMaxDemo.tsx</code>.
          </p>
          <SlidingWindowMaxDemo />
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
                href="https://leetcode.com/problems/sliding-window-maximum/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                #239 — Sliding Window Maximum
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                A classic Hard problem; the canonical example of the monotonic-deque pattern.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Related sliding-window problems</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Best Time to Buy and Sell Stock
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— single-pass min/max tracking</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/longest-substring-without-repeating-characters/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Longest Substring Without Repeating Characters
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— variable-size sliding window + hash set</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/longest-repeating-character-replacement/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Longest Repeating Character Replacement
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— window + frequency map</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Shortest Subarray with Sum at Least K
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— monotonic deque on prefix sums</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/sliding-window-median/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Sliding Window Median
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— two-heap variant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  </div>
);

export default SlidingWindowMaximum;
