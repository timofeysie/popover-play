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
import { KthSmallestBstDemo } from "@/features/kthSmallestBst";

const KthSmallestBst = () => (
  <div className="max-w-4xl mx-auto px-6 py-12">
    {/* Exercise Header */}
    <div className="mb-2 flex flex-col sm:flex-row sm:items-start gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 07
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          Kth Smallest Element in a BST
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Given the root of a Binary Search Tree (BST) and an integer <strong className="text-foreground">k</strong>, return the kth smallest value (1-indexed). Because <strong className="text-foreground">in-order traversal</strong> of a BST visits nodes in ascending order, the kth node we visit is the answer.
        </p>
        <details className="group mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
            <Lightbulb className="w-5 h-5 shrink-0 text-primary" aria-hidden />
            <span className="font-medium text-foreground">Key points</span>
          </summary>
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
            <ul className="list-disc list-inside pt-3 space-y-1.5">
              <li>In a BST, <strong className="text-foreground">in-order</strong> (left → node → right) yields a <strong className="text-foreground">sorted</strong> sequence; the kth node visited is the kth smallest.</li>
              <li>Recurse left, then &quot;visit&quot; the current node (decrement a counter), then recurse right; when the counter hits 0, the current node&apos;s value is the answer.</li>
              <li>Early exit: stop once we have visited k nodes — time O(k) to O(n), space O(h) for the recursion stack.</li>
              <li>Alternative: collect full in-order into an array and return <code className="bg-muted px-1 rounded text-foreground">arr[k - 1]</code> (O(n) time and space).</li>
            </ul>
            <p className="mt-4">
              This problem frequently appears in interviews to test BST properties and in-order traversal; the follow-up (optimize for repeated kth-smallest queries) leads to augmented trees (e.g. storing subtree sizes).
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
                title: "BST property",
                desc: "For every node, all values in its left subtree are smaller and all in its right subtree are larger. So in-order (left, node, right) visits values in ascending order.",
              },
              {
                step: "2",
                title: "In-order traversal",
                desc: "Recurse into the left subtree first, then visit the current node (e.g. decrement a \"remaining\" counter), then recurse into the right subtree.",
              },
              {
                step: "3",
                title: "Kth smallest",
                desc: "When we visit a node, we have just seen one more value in sorted order. When we have visited exactly k nodes, the current node's value is the kth smallest.",
              },
              {
                step: "4",
                title: "Early exit",
                desc: "Once we have found the kth smallest, we can return and skip the rest of the tree (and avoid building a full in-order array).",
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
            <h4 className="text-lg font-semibold mb-3 text-foreground">In-order with early exit (TypeScript)</h4>
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-accent/60" />
                <span className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs text-code-comment font-mono">kthSmallest.ts</span>
              </div>
              <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                <code>
                  <span className="text-code-keyword">function kthSmallest</span>
                  <span className="text-code-foreground">(root: TreeNode | null, k: number): number </span>
                  <span className="text-code-foreground">{"{\n  "}</span>
                  <span className="text-code-keyword">let</span>
                  <span className="text-code-foreground">{" remaining = k;\n  "}</span>
                  <span className="text-code-keyword">let</span>
                  <span className="text-code-foreground">{" result = 0;\n\n  "}</span>
                  <span className="text-code-keyword">function</span>
                  <span className="text-code-foreground">{" inorder(node: TreeNode | null): void {\n    "}</span>
                  <span className="text-code-keyword">if</span>
                  <span className="text-code-foreground">{" (node === null || remaining <= 0) return;\n    inorder(node.left);\n    "}</span>
                  <span className="text-code-keyword">if</span>
                  <span className="text-code-foreground">{" (remaining <= 0) return;\n    remaining--;\n    "}</span>
                  <span className="text-code-keyword">if</span>
                  <span className="text-code-foreground">{" (remaining === 0) {\n      result = node.val;\n      return;\n    }\n    inorder(node.right);\n  }\n\n  inorder(root);\n  "}</span>
                  <span className="text-code-keyword">return</span>
                  <span className="text-code-foreground">{" result;\n}"}</span>
                </code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <code className="bg-muted px-1 rounded text-foreground">remaining</code> counts how many more &quot;smallest&quot; nodes we need to pass; when it reaches 0, the current node is the kth smallest.
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
              With early exit we only traverse until we have visited k nodes. Time ranges from O(k) to O(n); space is the recursion stack depth.
            </p>
            <div className="space-y-2">
              <details className="group/time rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/time:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/time:inline" aria-hidden />
                  <span><strong className="text-foreground">Time:</strong> O(k) to O(n) — we stop once we have visited k nodes in order; in the worst case (e.g. k = n or kth in the rightmost node) we traverse the whole tree.</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                  <p className="pt-3">
                    Best case is when the kth smallest is reached after visiting only k nodes (e.g. small k and a balanced tree). Worst case is O(n) when we must visit all nodes to reach the kth (e.g. skewed tree and k = n).
                  </p>
                </div>
              </details>
              <details className="group/space rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/space:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/space:inline" aria-hidden />
                  <span><strong className="text-foreground">Space:</strong> O(h) for the recursion stack, where h is the height of the tree (O(log n) balanced, O(n) skewed).</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                  <p className="pt-3">
                    The stack holds the path from the root to the current node. We do not store the full in-order sequence when using early exit, so space is dominated by the call stack.
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
            Choose <em>k</em> and click Run to see in-order traversal; the kth
            node visited is highlighted as the kth smallest.
          </p>
          <KthSmallestBstDemo />
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
              <h4 className="font-medium text-foreground mb-2">LeetCode link</h4>
              <a
                href="https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                Kth Smallest Element in a BST
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-xs text-muted-foreground mt-1">
                Original problem; in-order traversal or augmented BST for follow-up.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Related problems</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://leetcode.com/problems/validate-binary-search-tree/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Validate Binary Search Tree
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— BST property, in-order</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/binary-search-tree-iterator/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    BST Iterator
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— in-order one step at a time</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/convert-bst-to-greater-tree/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Convert BST to Greater Tree
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— reverse in-order</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </details>
    </section>
  </div>
);

export default KthSmallestBst;
