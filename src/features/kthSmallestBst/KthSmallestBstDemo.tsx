import { useState, useCallback } from "react";
import { Play, Plus, Minus } from "lucide-react";

export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/** Example 1: root = [3,1,4,null,2] — in-order: 1, 2, 3, 4 */
function buildDemoTree(): TreeNode {
  const n2: TreeNode = { val: 2, left: null, right: null };
  const n1: TreeNode = { val: 1, left: null, right: n2 };
  const n4: TreeNode = { val: 4, left: null, right: null };
  const n3: TreeNode = { val: 3, left: n1, right: n4 };
  return n3;
}

const DEMO_TREE = buildDemoTree();

/** Collect in-order sequence of values (for animation). */
function inorderSequence(root: TreeNode | null): number[] {
  const out: number[] = [];
  function go(node: TreeNode | null) {
    if (!node) return;
    go(node.left);
    out.push(node.val);
    go(node.right);
  }
  go(root);
  return out;
}

const INORDER = inorderSequence(DEMO_TREE);

export function KthSmallestBstDemo() {
  const [k, setK] = useState(1);
  const [visitOrder, setVisitOrder] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const runDemo = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    setVisitOrder([]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < INORDER.length) {
        const next = INORDER.slice(0, step + 1);
        setVisitOrder(next);
        if (step + 1 === k) {
          setResult(INORDER[k - 1]);
        }
        step++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 500);
  }, [k, isRunning]);

  const isVisited = (val: number) => visitOrder.includes(val);
  const isCurrent = (val: number) =>
    visitOrder.length > 0 && visitOrder[visitOrder.length - 1] === val;
  const isKth = (val: number) => result !== null && val === result;

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <span className="text-sm font-medium text-foreground">
          In-order traversal (tree from Example 1: [3,1,4,null,2])
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="k-select" className="text-sm text-muted-foreground">
            k =
          </label>
          <select
            id="k-select"
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            disabled={isRunning}
            className="rounded border border-border bg-background px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={runDemo}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        In-order (left → node → right) visits nodes in ascending order. The kth node visited is the kth smallest.
      </p>

      {/* Tree diagram: root 3, left 1 (right 2), right 4 */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">BST</div>
        <pre
          className="text-sm font-mono bg-muted/30 p-4 rounded-lg overflow-x-auto"
          aria-label="Tree structure: root 3, left child 1 with right child 2, right child 4"
        >
          {["    3", "   / \\", "  1   4", "   \\", "    2"].map((line, i) => (
            <span key={i}>
              {line.split("").map((char, j) => {
                const val = Number(char);
                if (Number.isInteger(val) && val >= 1 && val <= 4) {
                  const current = isCurrent(val);
                  const visited = isVisited(val);
                  const kth = isKth(val);
                  return (
                    <span
                      key={j}
                      className={
                        kth
                          ? "font-bold text-primary"
                          : current
                            ? "font-bold text-foreground"
                            : visited
                              ? "text-foreground"
                              : "text-muted-foreground"
                      }
                    >
                      {char}
                    </span>
                  );
                }
                return <span key={j}>{char}</span>;
              })}
              {"\n"}
            </span>
          ))}
        </pre>
      </div>

      {/* In-order visit order */}
      <div className="mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-2">In-order visit order</div>
        <div className="flex flex-wrap gap-2 items-center">
          {INORDER.map((val) => {
            const current = isCurrent(val);
            const kth = isKth(val);
            return (
              <span
                key={val}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 font-mono text-sm font-semibold transition-colors ${
                  kth
                    ? "border-primary bg-primary text-primary-foreground"
                    : current
                      ? "border-primary bg-primary/15 text-foreground"
                      : visitOrder.includes(val)
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border bg-muted/50 text-muted-foreground"
                }`}
              >
                {val}
              </span>
            );
          })}
        </div>
      </div>

      {result !== null && (
        <p className="text-sm font-medium text-foreground">
          Kth smallest (k = {k}): <span className="font-mono text-primary">{result}</span>
        </p>
      )}

      <details className="group/explain rounded-lg border border-border bg-muted/20 overflow-hidden mt-4">
        <summary className="flex items-center gap-2 list-none cursor-pointer px-3 py-2.5 text-muted-foreground hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
          <Plus className="w-4 h-4 shrink-0 text-primary group-open/explain:hidden" aria-hidden />
          <Minus className="w-4 h-4 shrink-0 text-primary hidden group-open/explain:inline" aria-hidden />
          <span className="font-medium text-foreground text-sm">How in-order gives kth smallest</span>
        </summary>
        <div className="px-3 pb-3 pt-0 text-sm text-muted-foreground border-t border-border">
          <div className="pt-3 space-y-3">
            <p>
              In a BST, <strong className="text-foreground">in-order traversal</strong> (left subtree, then node, then right subtree) visits nodes in <strong className="text-foreground">ascending order</strong>. So the 1st node visited is the smallest, the 2nd is the 2nd smallest, and the kth node visited is the kth smallest. We can stop as soon as we have visited k nodes (early exit).
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
