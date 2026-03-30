export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

/** Parse level-order (LeetCode-style) array into a BST. Index i: left = 2i+1, right = 2i+2. */
export function arrayToTree(arr: (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;
  const nodes: (TreeNode | null)[] = arr.map((val) =>
    val === null ? null : { val, left: null, right: null }
  );
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;
    const leftIdx = 2 * i + 1;
    const rightIdx = 2 * i + 2;
    if (leftIdx < arr.length) node.left = nodes[leftIdx];
    if (rightIdx < arr.length) node.right = nodes[rightIdx];
  }
  return nodes[0];
}

/** Return the kth smallest value (1-indexed) via in-order traversal with early exit. */
export function kthSmallest(root: TreeNode | null, k: number): number {
  let remaining = k;
  let result = 0;

  function inorder(node: TreeNode | null): void {
    if (node === null || remaining <= 0) return;
    inorder(node.left);
    if (remaining <= 0) return;
    remaining--;
    if (remaining === 0) {
      result = node.val;
      return;
    }
    inorder(node.right);
  }

  inorder(root);
  return result;
}
