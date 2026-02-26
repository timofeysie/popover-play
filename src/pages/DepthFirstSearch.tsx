import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { BookOpen, Zap, GitBranch, Play, ChevronRight, ExternalLink, ListChecks, Plus, Minus } from "lucide-react";

/** Simple tree node for the demo */
interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/** Build the demo tree:       1
 *                           /   \
 *                          2     3
 *                         / \   /
 *                        4   5 6
 *                             \
 *                              7
 */
function buildDemoTree(): TreeNode {
  const n = (v: number, l: TreeNode | null, r: TreeNode | null): TreeNode => ({
    id: `n${v}`,
    value: v,
    left: l,
    right: r,
  });
  const n7 = n(7, null, null);
  const n6 = n(6, null, n7);
  const n5 = n(5, null, null);
  const n4 = n(4, null, null);
  const n3 = n(3, n6, null);
  const n2 = n(2, n4, n5);
  const n1 = n(1, n2, n3);
  return n1;
}

const DEMO_TREE = buildDemoTree();

/** DFS pre-order (visit root, then left subtree, then right subtree) */
function dfsPreOrder(root: TreeNode | null, visit: (node: TreeNode) => void): void {
  if (!root) return;
  visit(root);
  dfsPreOrder(root.left, visit);
  dfsPreOrder(root.right, visit);
}

/** DFS pre-order iterative (explicit stack) */
function dfsPreOrderIterative(root: TreeNode | null, visit: (node: TreeNode) => void): void {
  if (!root) return;
  const stack: TreeNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    visit(node);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
}

/** Colors: DFS time (primary), DFS space (accent), others faint */
const COLORS = {
  dfsTime: "hsl(160, 60%, 40%)",
  dfsSpace: "hsl(40, 90%, 55%)",
  faint: "hsl(220, 12%, 82%)",
};

const N_MAX = 64;

function drawComplexityChart(container: SVGSVGElement) {
  const data = Array.from({ length: N_MAX }, (_, i) => i + 1);
  const series = [
    { id: "O(1)", fn: (n: number) => 1, color: COLORS.faint, label: "O(1)" },
    { id: "O(log n)", fn: (n: number) => Math.log2(n) || 0, color: COLORS.faint, label: "O(log n)" },
    { id: "O(n)", fn: (n: number) => n, color: COLORS.faint, label: "O(n)" },
    { id: "O(n log n)", fn: (n: number) => n * (Math.log2(n) || 0), color: COLORS.faint, label: "O(n log n)" },
    { id: "O(n²)", fn: (n: number) => n * n, color: COLORS.faint, label: "O(n²)" },
    { id: "DFS time O(V+E)", fn: (n: number) => n, color: COLORS.dfsTime, label: "DFS time O(V+E)" },
    { id: "DFS space O(h)", fn: (n: number) => Math.log2(n) || 0, color: COLORS.dfsSpace, label: "DFS space O(h)" },
  ];

  const width = 560;
  const height = 260;
  const margin = { top: 20, right: 140, bottom: 32, left: 48 };

  d3.select(container).selectAll("*").remove();

  const svg = d3
    .select(container)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "auto")
    .style("max-width", "100%");

  const xScale = d3.scaleLinear().domain([1, N_MAX]).range([margin.left, width - margin.right]);
  const maxVal = Math.max(
    ...series.flatMap((s) => data.map((n) => s.fn(n)))
  );
  const yScale = d3.scaleLinear().domain([0, maxVal]).range([height - margin.bottom, margin.top]);

  // Faint grid
  const yTicks = yScale.ticks(5);
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("class", "grid")
    .selectAll("line")
    .data(yTicks)
    .join("line")
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d))
    .attr("x2", width - margin.right - margin.left)
    .attr("stroke", "hsl(220, 13%, 92%)")
    .attr("stroke-width", 1);

  // Axes
  const xAxis = d3.axisBottom(xScale).ticks(8).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(5).tickSizeOuter(0);
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .attr("color", "hsl(220, 10%, 46%)")
    .attr("font-size", "11px");
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .attr("color", "hsl(220, 10%, 46%)")
    .attr("font-size", "11px");

  svg.append("text").attr("x", width / 2).attr("y", height - 4).attr("text-anchor", "middle").attr("fill", "hsl(220, 10%, 46%)").attr("font-size", "11px").text("Input size n");

  // Draw lines: faint first, then DFS time and space on top
  const order = [0, 1, 2, 3, 4, 5, 6]; // O(1), O(log n), O(n), O(n log n), O(n²), DFS time, DFS space
  order.forEach((idx) => {
    const s = series[idx];
    const pathData = data.map((n) => s.fn(n));
    const pathGen = d3
      .line<number>()
      .x((_, i) => xScale(data[i]))
      .y((d) => yScale(d));
    const isDfs = s.id.startsWith("DFS");
    svg
      .append("path")
      .attr("d", pathGen(pathData))
      .attr("fill", "none")
      .attr("stroke", s.color)
      .attr("stroke-width", isDfs ? 2.5 : 1)
      .attr("stroke-opacity", isDfs ? 1 : 0.5);
  });

  // Legend: right side
  const legendY = margin.top;
  const legendX = width - margin.right + 8;
  series.forEach((s, i) => {
    const y = legendY + i * 18;
    const isDfs = s.id.startsWith("DFS");
    svg
      .append("line")
      .attr("x1", legendX)
      .attr("x2", legendX + 20)
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", s.color)
      .attr("stroke-width", isDfs ? 2.5 : 1)
      .attr("stroke-opacity", isDfs ? 1 : 0.5);
    svg
      .append("text")
      .attr("x", legendX + 24)
      .attr("y", y + 4)
      .attr("fill", isDfs ? "hsl(220, 20%, 10%)" : "hsl(220, 10%, 46%)")
      .attr("font-size", isDfs ? "12px" : "11px")
      .attr("font-weight", isDfs ? 600 : 400)
      .text(s.label);
  });
}

const DepthFirstSearch = () => {
  const chartRef = useRef<SVGSVGElement>(null);
  const [visitOrder, setVisitOrder] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (chartRef.current) drawComplexityChart(chartRef.current);
  }, []);

  const runDfs = () => {
    setIsRunning(true);
    setVisitOrder([]);
    const order: string[] = [];
    dfsPreOrder(DEMO_TREE, (node) => order.push(node.id));
    let i = 0;
    const interval = setInterval(() => {
      if (i < order.length) {
        setVisitOrder(order.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 400);
  };

  const isVisited = (id: string) => visitOrder.includes(id);
  const isCurrent = (id: string) => visitOrder.length > 0 && visitOrder[visitOrder.length - 1] === id;
  const currentNum = visitOrder.length > 0 ? Number(visitOrder[visitOrder.length - 1].replace("n", "")) : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Exercise Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 04
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          Depth-First Search (DFS)
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Depth-First Search explores a tree or graph by going <strong className="text-foreground">as deep as possible</strong> along each branch before backtracking. It’s one of the most common graph/tree traversal algorithms and often appears in frontend and general technical interviews.
        </p>
        <details className="group mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
            <span className="font-medium text-foreground">Key points & why DFS matters</span>
          </summary>
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
            <ul className="list-disc list-inside pt-3 space-y-1.5">
              <li>Uses a <strong className="text-foreground">stack</strong> (or recursion, which uses the call stack).</li>
              <li>Contrast with BFS (breadth-first), which explores level by level using a queue.</li>
              <li>Useful for path finding, cycle detection, topological sort, and backtracking.</li>
            </ul>
            <p className="mt-4">
              DFS is frequently used in tree/graph problems (path finding, cycles, connected components, backtracking). It’s often the first algorithm to reach for when you need to explore every node or find a path. In the DSA doc it’s listed as the #1 algorithm most likely to appear in frontend interviews.
            </p>
          </div>
        </details>
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
              title: "Go deep first",
              desc: "From the current node, visit one neighbor (or child), then recurse. Only when that path is fully explored do you backtrack and try the next branch.",
            },
            {
              step: "2",
              title: "Stack or recursion",
              desc: "Recursive DFS uses the call stack; iterative DFS uses an explicit stack. Both visit nodes in the same “depth-first” order (depending on the order you push children).",
            },
            {
              step: "3",
              title: "Pre-order (trees)",
              desc: "For a binary tree: visit root, then DFS(left), then DFS(right). Other orders (in-order, post-order) are also DFS with a different visit time.",
            },
            {
              step: "4",
              title: "Graphs",
              desc: "Keep a visited set so each node is processed once. Push unvisited neighbors onto the stack (or recurse into them).",
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
            <span className="font-semibold text-foreground">Code Samples</span>
          </summary>
          <div className="px-4 pb-4 pt-0 border-t border-border space-y-8 pt-4">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-foreground">Recursive DFS (pre-order, tree)</h4>
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                  <span className="w-3 h-3 rounded-full bg-destructive/60" />
                  <span className="w-3 h-3 rounded-full bg-accent/60" />
                  <span className="w-3 h-3 rounded-full bg-primary/60" />
                  <span className="ml-3 text-xs text-code-comment font-mono">dfs.ts</span>
                </div>
                <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                  <code>
                    <span className="text-code-keyword">{"function dfsPreOrder"}</span>
                    <span className="text-code-foreground">{"("}</span>
                    <span className="text-code-tag">root</span>
                    <span className="text-code-foreground">{" : TreeNode | null, "}</span>
                    <span className="text-code-tag">visit</span>
                    <span className="text-code-foreground">{" : (node: TreeNode) => void): void {\n  "}</span>
                    <span className="text-code-keyword">if</span>
                    <span className="text-code-foreground">{" (!root) "}</span>
                    <span className="text-code-keyword">return</span>
                    <span className="text-code-foreground">{";\n  "}</span>
                    <span className="text-code-foreground">{"visit(root);\n  "}</span>
                    <span className="text-code-foreground">{"dfsPreOrder(root.left, visit);\n  "}</span>
                    <span className="text-code-foreground">{"dfsPreOrder(root.right, visit);\n}"}</span>
                  </code>
                </pre>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-foreground">Iterative DFS (explicit stack)</h4>
              <div className="rounded-lg overflow-hidden border border-border">
                <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                  <span className="w-3 h-3 rounded-full bg-destructive/60" />
                  <span className="w-3 h-3 rounded-full bg-accent/60" />
                  <span className="w-3 h-3 rounded-full bg-primary/60" />
                  <span className="ml-3 text-xs text-code-comment font-mono">dfs.ts</span>
                </div>
                <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                  <code>
                    <span className="text-code-keyword">{"function dfsPreOrderIterative"}</span>
                    <span className="text-code-foreground">{"("}</span>
                    <span className="text-code-tag">root</span>
                    <span className="text-code-foreground">{" : TreeNode | null, "}</span>
                    <span className="text-code-tag">visit</span>
                    <span className="text-code-foreground">{" : (node: TreeNode) => void): void {\n  "}</span>
                    <span className="text-code-keyword">if</span>
                    <span className="text-code-foreground">{" (!root) "}</span>
                    <span className="text-code-keyword">return</span>
                    <span className="text-code-foreground">{";\n  const stack = [root];\n  while (stack.length > 0) {\n    const node = stack.pop()!;\n    visit(node);\n    if (node.right) stack.push(node.right);\n    if (node.left) stack.push(node.left);\n  }\n}"}</span>
                  </code>
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Right is pushed before left so that left is processed first (stack is LIFO). Same visit order as the recursive pre-order.
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
            <span className="font-semibold text-foreground">Complexity</span>
          </summary>
          <div className="px-4 pb-4 pt-0 border-t border-border">
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                How DFS compares to other common complexities (input size <em>n</em> from 1 to {N_MAX}). DFS time grows like O(n); DFS space grows like O(log n) for balanced trees.
              </p>
              <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 mb-6">
                <svg ref={chartRef} className="w-full" />
              </div>
              <div className="space-y-2">
                <details className="group/time rounded-lg border border-border bg-muted/20 overflow-hidden">
                  <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                    <Plus className="w-4 h-4 shrink-0 text-primary group-open/time:hidden" aria-hidden />
                    <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/time:inline" aria-hidden />
                    <span><strong className="text-foreground">Time:</strong> O(V + E) for a graph with V vertices and E edges; O(n) for a tree with n nodes (each node visited once).</span>
                  </summary>
                  <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                    <p className="pt-3">
                      For graphs, the input size is described by <strong className="text-foreground">V</strong> (vertices) and <strong className="text-foreground">E</strong> (edges). 
                      DFS visits each vertex once and traverses each edge once when using an adjacency list, so total work is proportional to V + E — i.e. linear in the size of the graph, analogous to O(n) for a list of n items.
                    </p>
                  </div>
                </details>
                <details className="group/space rounded-lg border border-border bg-muted/20 overflow-hidden">
                  <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                    <Plus className="w-4 h-4 shrink-0 text-primary group-open/space:hidden" aria-hidden />
                    <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/space:inline" aria-hidden />
                    <span><strong className="text-foreground">Space:</strong> O(h) for recursion stack or explicit stack, where h is the maximum depth (tree height or graph depth).</span>
                  </summary>
                  <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                    <p className="pt-3">
                      <strong className="text-foreground">h</strong> is the maximum depth of the recursion (or explicit stack). At any moment the stack holds the path from the root to the current node, so space is proportional to how deep the search goes. For a balanced tree, h ≈ log V; for a skewed path, h = V. So we say O(h) to cover both.
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
              Pre-order DFS on a small tree. Click &quot;Run DFS&quot; to see the visit order. Current node is highlighted; visited nodes stay filled.
            </p>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="bg-card border border-border rounded-lg p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">Pre-order visit order</span>
              <button
                type="button"
                onClick={runDfs}
                disabled={isRunning}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Run DFS
              </button>
            </div>
            {/* Tree diagram: fixed layout for 1–7; bold = currently visited */}
            <div className="font-mono text-sm text-muted-foreground mb-4">
              Tree structure:
              <pre className="mt-2 text-xs bg-muted/50 p-3 rounded overflow-x-auto">
                {"     "}
                <span className={currentNum === 1 ? "font-bold text-foreground" : ""}>1</span>
                {"\n   / \\\n  "}
                <span className={currentNum === 2 ? "font-bold text-foreground" : ""}>2</span>
                {"   "}
                <span className={currentNum === 3 ? "font-bold text-foreground" : ""}>3</span>
                {"\n / \\  /\n"}
                <span className={currentNum === 4 ? "font-bold text-foreground" : ""}>4</span>
                {"  "}
                <span className={currentNum === 5 ? "font-bold text-foreground" : ""}>5</span>
                {" "}
                <span className={currentNum === 6 ? "font-bold text-foreground" : ""}>6</span>
                {"\n      \\\n       "}
                <span className={currentNum === 7 ? "font-bold text-foreground" : ""}>7</span>
              </pre>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((v) => {
                const id = `n${v}`;
                const visited = isVisited(id);
                const current = isCurrent(id);
                return (
                  <span
                    key={id}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 font-mono font-semibold text-sm transition-colors ${
                      current
                        ? "border-primary bg-primary text-primary-foreground"
                        : visited
                          ? "border-primary/60 bg-primary/15 text-foreground"
                          : "border-border bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {v}
                  </span>
                );
              })}
            </div>
            {visitOrder.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Order:{" "}
                {visitOrder.map((id, i) => {
                  const num = id.replace("n", "");
                  const isCurrentStep = i === visitOrder.length - 1;
                  return (
                    <span key={id}>
                      {i > 0 && " → "}
                      <span className={isCurrentStep ? "font-bold text-foreground" : ""}>{num}</span>
                    </span>
                  );
                })}
              </p>
            )}
              </div>
            </div>
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
                <h4 className="font-medium text-foreground mb-2">LeetCode links</h4>
                <a
                  href="https://leetcode.com/problem-list/depth-first-search/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  Depth-First Search problem list
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
                <p className="text-xs text-muted-foreground mt-1">Curated list of DFS problems on LeetCode.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3">Key LeetCode examples</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a href="https://leetcode.com/problems/number-of-islands/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      Number of Islands
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <span className="ml-1">— 2D grid traversal</span>
                  </li>
                  <li>
                    <a href="https://leetcode.com/problems/maximum-depth-of-binary-tree/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      Maximum Depth of Binary Tree
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <span className="ml-1">— tree traversal</span>
                  </li>
                  <li>
                    <a href="https://leetcode.com/problems/clone-graph/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      Clone Graph
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <span className="ml-1">— graph cloning</span>
                  </li>
                  <li>
                    <a href="https://leetcode.com/problems/course-schedule/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                      Course Schedule
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <span className="ml-1">— cycle detection</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
};

export default DepthFirstSearch;
