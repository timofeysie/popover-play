import type { TreeNode } from "./kthSmallest";

export type TraversalPhase = "enter" | "visit";

export interface TraversalStep {
  phase: TraversalPhase;
  val: number;
  /** Path of node values from root to current node. */
  path: number[];
}

/**
 * Collect the in-order sequence of values for use as the "final answer strip" in the UI.
 * Because the input is a BST, in-order (left → node → right) always yields ascending order,
 * so INORDER[k-1] is the kth smallest value.
 */
export function inorderSequence(root: TreeNode | null): number[] {
  const out: number[] = [];
  function go(node: TreeNode | null) {
    if (!node) return;
    go(node.left);      // recurse into left subtree first (smaller values)
    out.push(node.val); // visit: record this node's value in sorted order
    go(node.right);     // recurse into right subtree (larger values)
  }
  go(root);
  return out;
}

/**
 * Build the full step-by-step trace of an in-order traversal for animation.
 *
 * Each node contributes two steps:
 *   "enter" — we arrive at the node and are about to recurse left.
 *             The path shows where we are in the tree (amber highlight).
 *             We have NOT counted this node yet.
 *   "visit" — we have finished the left subtree and now record this node's value.
 *             This is the moment the node counts toward k (blue highlight).
 *
 * The separation makes the "go left first, visit later" rule visible:
 * the root is entered early but not visited until all left descendants are done.
 */
export function inorderTrace(root: TreeNode | null): TraversalStep[] {
  const steps: TraversalStep[] = [];
  function go(node: TreeNode | null, path: number[]) {
    if (!node) return;
    const nodePath = [...path, node.val];
    steps.push({ phase: "enter", val: node.val, path: nodePath }); // arrived, going left
    go(node.left, nodePath);                                         // recurse left subtree
    steps.push({ phase: "visit", val: node.val, path: nodePath }); // left done, count this node
    go(node.right, nodePath);                                        // recurse right subtree
  }
  go(root, []);
  return steps;
}
