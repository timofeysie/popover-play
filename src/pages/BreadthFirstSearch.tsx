import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { BookOpen, Zap, GitBranch, ChevronRight, ExternalLink, ListChecks, Code2, BarChart2, Plus, Minus, Lightbulb } from "lucide-react";
import { CourseScheduleDemo } from "@/features/breadthFirstSearch";

/** Colors: BFS time (primary), BFS space (accent), others faint */
const COLORS = {
  bfsTime: "hsl(220, 60%, 48%)",
  bfsSpace: "hsl(280, 55%, 55%)",
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
    { id: "BFS time O(V+E)", fn: (n: number) => n, color: COLORS.bfsTime, label: "BFS time O(V+E)" },
    { id: "BFS space O(V)", fn: (n: number) => n, color: COLORS.bfsSpace, label: "BFS space O(V)" },
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
  const maxVal = Math.max(...series.flatMap((s) => data.map((n) => s.fn(n))));
  const yScale = d3.scaleLinear().domain([0, maxVal]).range([height - margin.bottom, margin.top]);

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

  const order = [0, 1, 2, 3, 4, 5, 6];
  order.forEach((idx) => {
    const s = series[idx];
    const pathData = data.map((n) => s.fn(n));
    const pathGen = d3.line<number>().x((_, i) => xScale(data[i])).y((d) => yScale(d));
    const isBfs = s.id.startsWith("BFS");
    svg
      .append("path")
      .attr("d", pathGen(pathData))
      .attr("fill", "none")
      .attr("stroke", s.color)
      .attr("stroke-width", isBfs ? 2.5 : 1)
      .attr("stroke-opacity", isBfs ? 1 : 0.5);
  });

  const legendY = margin.top;
  const legendX = width - margin.right + 8;
  series.forEach((s, i) => {
    const y = legendY + i * 18;
    const isBfs = s.id.startsWith("BFS");
    svg
      .append("line")
      .attr("x1", legendX)
      .attr("x2", legendX + 20)
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", s.color)
      .attr("stroke-width", isBfs ? 2.5 : 1)
      .attr("stroke-opacity", isBfs ? 1 : 0.5);
    svg
      .append("text")
      .attr("x", legendX + 24)
      .attr("y", y + 4)
      .attr("fill", isBfs ? "hsl(220, 20%, 10%)" : "hsl(220, 10%, 46%)")
      .attr("font-size", isBfs ? "12px" : "11px")
      .attr("font-weight", isBfs ? 600 : 400)
      .text(s.label);
  });
}

function drawComplexityChartCompact(container: SVGSVGElement) {
  const data = Array.from({ length: N_MAX }, (_, i) => i + 1);
  const series = [
    { id: "O(1)", fn: (n: number) => 1, color: COLORS.faint },
    { id: "O(log n)", fn: (n: number) => Math.log2(n) || 0, color: COLORS.faint },
    { id: "O(n)", fn: (n: number) => n, color: COLORS.faint },
    { id: "O(n log n)", fn: (n: number) => n * (Math.log2(n) || 0), color: COLORS.faint },
    { id: "O(n²)", fn: (n: number) => n * n, color: COLORS.faint },
    { id: "BFS time", fn: (n: number) => n, color: COLORS.bfsTime },
    { id: "BFS space", fn: (n: number) => n, color: COLORS.bfsSpace },
  ];
  const size = 200;
  const margin = 12;

  d3.select(container).selectAll("*").remove();

  const svg = d3
    .select(container)
    .attr("viewBox", `0 0 ${size} ${size}`)
    .attr("width", size)
    .attr("height", size);

  const xScale = d3.scaleLinear().domain([1, N_MAX]).range([margin, size - margin]);
  const maxVal = Math.max(...series.flatMap((s) => data.map((n) => s.fn(n))));
  const yScale = d3.scaleLinear().domain([0, maxVal]).range([size - margin, margin]);

  const order = [0, 1, 2, 3, 4, 5, 6];
  order.forEach((idx) => {
    const s = series[idx];
    const pathData = data.map((n) => s.fn(n));
    const pathGen = d3.line<number>().x((_, i) => xScale(data[i])).y((d) => yScale(d));
    const isBfs = s.id.startsWith("BFS");
    svg
      .append("path")
      .attr("d", pathGen(pathData))
      .attr("fill", "none")
      .attr("stroke", s.color)
      .attr("stroke-width", isBfs ? 2 : 0.8)
      .attr("stroke-opacity", isBfs ? 1 : 0.5);
  });
}

const BreadthFirstSearch = () => {
  const chartRef = useRef<SVGSVGElement>(null);
  const chartHeaderRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (chartRef.current) drawComplexityChart(chartRef.current);
    if (chartHeaderRef.current) drawComplexityChartCompact(chartHeaderRef.current);
  }, []);

  return (
  <div className="max-w-4xl mx-auto px-6 py-12">
    {/* Exercise Header */}
    <div className="mb-2 flex flex-col sm:flex-row sm:items-start gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 05
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          Breadth-First Search (BFS)
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Breadth-First Search explores a tree or graph <strong className="text-foreground">level by level</strong>, using a queue. It processes all nodes at the current depth before moving to the next, and does not use backtracking. BFS is ideal for shortest paths in unweighted graphs and for topological sort (e.g. Kahn’s algorithm).
        </p>
        <details className="group mt-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
          <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight className="w-4 h-4 shrink-0 text-primary transition-transform group-open:rotate-90" aria-hidden />
            <Lightbulb className="w-5 h-5 shrink-0 text-primary" aria-hidden />
            <span className="font-medium text-foreground">Key points</span>
          </summary>
          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border">
            <ul className="list-disc list-inside pt-3 space-y-1.5">
              <li>Uses a <strong className="text-foreground">queue</strong> (FIFO); contrast with DFS, which uses a stack and backtracking.</li>
              <li>Explores all neighbors at the current level before going deeper.</li>
              <li>Useful for shortest path in unweighted graphs, level-order traversal, and topological sort (Kahn’s algorithm).</li>
            </ul>
            <p className="mt-4">
              BFS appears in graph and tree problems (course schedule, clone graph, level-order, shortest path). When you need “level by level” or “what becomes available next,” think queue and BFS.
            </p>
          </div>
        </details>
      </div>
      <div className="shrink-0 rounded-lg border border-border bg-muted/30 overflow-hidden">
        <svg ref={chartHeaderRef} className="block" aria-hidden />
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
                title: "Queue, not stack",
                desc: "BFS uses a queue (FIFO). Dequeue a node, process it, then enqueue its unvisited neighbors. Nodes are processed in the order they were discovered.",
              },
              {
                step: "2",
                title: "Level by level",
                desc: "All nodes at distance k from the start are processed before any node at distance k + 1. So you explore the graph in expanding “waves.”",
              },
              {
                step: "3",
                title: "No backtracking",
                desc: "Unlike DFS, BFS does not go back to try another branch; it always processes the front of the queue. No recursion or stack unwinding.",
              },
              {
                step: "4",
                title: "Kahn’s algorithm",
                desc: "For topological sort: maintain in-degrees, queue nodes with in-degree 0, dequeue and reduce dependents’ in-degrees. “Take a class, see what opens up.”",
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
            <h4 className="text-lg font-semibold mb-3 text-foreground">BFS with queue (graph)</h4>
            <div className="rounded-lg overflow-hidden border border-border">
              <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-accent/60" />
                <span className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs text-code-comment font-mono">bfs.ts</span>
              </div>
              <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                <code>
                  <span className="text-code-keyword">{"function bfs"}</span>
                  <span className="text-code-foreground">{"(start: Node, visit: (n: Node) => void): void {\n  const queue = [start];\n  const visited = new Set([start]);\n  while (queue.length > 0) {\n    const node = queue.shift()!;\n    visit(node);\n    for (const neighbor of node.neighbors) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n}"}</span>
                </code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Enqueue the start; then repeatedly dequeue, visit, and enqueue unvisited neighbors. The queue ensures level-by-level order.
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
              How BFS compares to other common complexities (input size <em>n</em> from 1 to {N_MAX}). BFS time and space both grow like O(n) in the size of the graph (V + E and queue size).
            </p>
            <div className="overflow-x-auto rounded-lg border border-border bg-muted/30 mb-6">
              <svg ref={chartRef} className="w-full" />
            </div>
            <div className="space-y-2">
              <details className="group/time rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/time:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/time:inline" aria-hidden />
                  <span><strong className="text-foreground">Time:</strong> O(V + E) for a graph with V vertices and E edges; each node and edge is processed at most once.</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                  <p className="pt-3">
                    We enqueue each node at most once and, for each node, iterate over its neighbors (edges). So total work is proportional to V + E — the same as DFS for an adjacency-list graph.
                  </p>
                </div>
              </details>
              <details className="group/space rounded-lg border border-border bg-muted/20 overflow-hidden">
                <summary className="flex items-center gap-2 list-none cursor-pointer px-4 py-3 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
                  <Plus className="w-4 h-4 shrink-0 text-primary group-open/space:hidden" aria-hidden />
                  <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/space:inline" aria-hidden />
                  <span><strong className="text-foreground">Space:</strong> O(V) for the visited set and the queue; in the worst case the queue holds one full level (e.g. O(V) for a star graph).</span>
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border mt-0">
                  <p className="pt-3">
                    The queue size is at most the number of nodes in the largest “level.” For a balanced binary tree that’s about O(n) at the last level; for a general graph we say O(V) to cover the worst case.
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
            Course Schedule (Kahn’s algorithm): BFS over the dependency graph. Click &quot;Run&quot; to see if all courses can be finished and one valid order. This mimics “take a class, see what opens up.”
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start flex-wrap">
            <CourseScheduleDemo />
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
                href="https://leetcode.com/problem-list/breadth-first-search/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                Breadth-First Search problem list
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-xs text-muted-foreground mt-1">Curated list of BFS problems on LeetCode.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Key LeetCode examples</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://leetcode.com/problems/course-schedule/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Course Schedule
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— Kahn’s algorithm / topological sort</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/binary-tree-level-order-traversal/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Binary Tree Level Order Traversal
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— level-by-level</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/clone-graph/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Clone Graph
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— BFS or DFS</span>
                </li>
                <li>
                  <a href="https://leetcode.com/problems/number-of-islands/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    Number of Islands
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                  <span className="ml-1">— BFS or DFS</span>
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

export default BreadthFirstSearch;
