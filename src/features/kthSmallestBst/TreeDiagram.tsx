import type { TreeNode } from "./kthSmallest";

export interface TreeDiagramProps {
  node: TreeNode | null;
  /** True if this node is on the current descent path (amber — entered but not yet visited). */
  isConsidering: (val: number) => boolean;
  /** True if this node has been counted in the in-order sequence. */
  isVisited: (val: number) => boolean;
  /** True if this node was the most recently visited (bright blue). */
  isCurrent: (val: number) => boolean;
  /** True if this node is the kth smallest answer (filled primary). */
  isKth: (val: number) => boolean;
}

/**
 * Recursively renders a BST as a vertically expanding tree.
 * Each node is styled according to its current traversal state:
 *   amber  → considering (on the descent path, not yet visited)
 *   blue   → visited (counted in in-order sequence)
 *   filled → kth smallest (final answer)
 */
export function TreeDiagram({
  node,
  isConsidering,
  isVisited,
  isCurrent,
  isKth,
}: TreeDiagramProps) {
  if (!node) return null;

  const considering = isConsidering(node.val);
  const visited = isVisited(node.val);
  const current = isCurrent(node.val);
  const kth = isKth(node.val);
  const hasChildren = node.left || node.right;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-lg border-2 font-mono text-sm font-semibold transition-colors ${
          kth
            ? "border-primary bg-primary text-primary-foreground"
            : current
              ? "border-primary bg-primary/15 text-foreground"
              : visited
                ? "border-primary/60 bg-primary/10 text-foreground"
                : considering
                  ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  : "border-border bg-muted/50 text-muted-foreground"
        }`}
      >
        {node.val}
      </div>

      {hasChildren && (
        <div className="flex justify-center gap-8 mt-2">
          {node.left ? (
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-border shrink-0" aria-hidden />
              <TreeDiagram
                node={node.left}
                isConsidering={isConsidering}
                isVisited={isVisited}
                isCurrent={isCurrent}
                isKth={isKth}
              />
            </div>
          ) : (
            <div className="min-w-[2rem]" />
          )}
          {node.right ? (
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-border shrink-0" aria-hidden />
              <TreeDiagram
                node={node.right}
                isConsidering={isConsidering}
                isVisited={isVisited}
                isCurrent={isCurrent}
                isKth={isKth}
              />
            </div>
          ) : (
            <div className="min-w-[2rem]" />
          )}
        </div>
      )}
    </div>
  );
}
