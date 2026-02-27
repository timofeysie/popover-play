import { useState } from "react";
import { Play, Plus, Minus } from "lucide-react";

export interface TreeNode {
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

/**
 * 
 * @param root - The root node of the tree
 * @param visit - A function to visit each node
 * Description: Depth-First Search (DFS) is a graph traversal algorithm that 
 * explores as deep as possible along each branch before backtracking. 
 */
function dfsPreOrder(root: TreeNode | null, visit: (node: TreeNode) => void): void {
  if (!root) return;
  visit(root);
  dfsPreOrder(root.left, visit);
  dfsPreOrder(root.right, visit);
}

export function DfsPreOrderDemo() {
  const [visitOrder, setVisitOrder] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDfs = () => {
    // Prevent starting again while the animation is running
    setIsRunning(true);
    setVisitOrder([]);

    // Run DFS once to get the full pre-order visit sequence (node ids: n1, n2, …)
    const order: string[] = [];
    dfsPreOrder(DEMO_TREE, (node) => order.push(node.id));

    // Reveal one node at a time so we can see the traversal order
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

  /** Currently not used, but keeping for reference.
   * DFS pre-order iterative (explicit stack) - for code sample display 
   */
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

  return (
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
          Run
        </button>
      </div>
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

      <details className="group/explain rounded-lg border border-border bg-muted/20 overflow-hidden mb-4">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-3 py-2.5 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <Plus className="w-4 h-4 shrink-0 text-primary group-open/explain:hidden" aria-hidden />
          <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/explain:inline" aria-hidden />
          <span className="font-medium text-foreground text-sm">How the code works</span>
        </summary>
        <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground border-t border-border">
          <div className="pt-3 space-y-3">
            <p>
              <strong className="text-foreground">TreeNode</strong> is a small data structure: each node has a <code className="bg-muted px-1 rounded text-foreground">value</code>, an <code className="bg-muted px-1 rounded text-foreground">id</code>, and optional <code className="bg-muted px-1 rounded text-foreground">left</code> and <code className="bg-muted px-1 rounded text-foreground">right</code> child references. A node with no children has <code className="bg-muted px-1 rounded text-foreground">left: null</code> and <code className="bg-muted px-1 rounded text-foreground">right: null</code>.
            </p>
            <p>
              <strong className="text-foreground">Building the tree</strong> is a matter of deciding, for each node, what goes left and what goes right. We create nodes from the leaves up (e.g. 4, 5, 7 first), then attach them as <code className="bg-muted px-1 rounded text-foreground">left</code> or <code className="bg-muted px-1 rounded text-foreground">right</code> of their parent. For example, 2’s left is 4 and right is 5; 6’s right is 7. The root (1) has left = 2 and right = 3. Those left/right choices define the shape you see in the diagram.
            </p>
            <p>
              <strong className="text-foreground">How the search works</strong>: Pre-order DFS visits the current node first, then recursively visits the left subtree, then the right subtree. So we go root → entire left branch (going deep) → then the right branch. The animation shows that order: 1 → 2 → 4 → 5 → 3 → 6 → 7. No queue is used; the call stack (or an explicit stack in the iterative version) keeps track of where to go next.
            </p>
          </div>
        </div>
      </details>

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
  );
}
