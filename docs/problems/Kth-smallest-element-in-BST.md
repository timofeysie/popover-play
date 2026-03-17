# Kth Smallest Element in a BST

Given the root of a binary search tree and an integer `k`, return the **kth smallest** value (1-indexed) of all the values of the nodes in the tree.

## Table of contents

- [Binary search tree (BST)](#binary-search-tree-bst)
- [Examples](#examples)
- [Constraints](#constraints)
- [Follow-up and hints](#follow-up-and-hints)
- [Approach: In-order traversal](#approach-in-order-traversal)
- [Solution (TypeScript)](#solution-typescript)
- [Reference](#reference)

---

## Binary search tree (BST)

A **Binary Search Tree (BST)** is a hierarchical data structure that organizes elements so that search, insertion, and deletion can be done efficiently. For every node in a BST:

- All values in its **left subtree** are **less** than its own value.
- All values in its **right subtree** are **greater** than its own value.

**Key properties:**

- **Ordered structure:** An **in-order traversal** (left → node → right) of the tree yields a **sorted sequence** of all elements. That is why in-order traversal is the natural way to get the kth smallest.
- **Hierarchical:** Each node has at most two children (left and right).
- **Efficiency:** Search, insertion, and deletion are O(log n) on average in a balanced tree; in the worst case (skewed tree, like a linked list), O(n).

---

## Examples

**Example 1:**

- **Input:** `root = [3,1,4,null,2]`, `k = 1`
- **Output:** `1`

**Example 2:**

- **Input:** `root = [5,3,6,2,4,null,null,1]`, `k = 3`
- **Output:** `3`

---

## Constraints

- The number of nodes in the tree is `n`.
- `1 <= k <= n <= 10^4`
- `0 <= Node.val <= 10^4`

---

## Follow-up and hints

**Follow-up:** If the BST is modified often (insert/delete) and you need to find the kth smallest frequently, how would you optimize?

**Hints:**

1. Use the property of the BST.
2. Try **in-order traversal** (credits: @chan13).
3. What if you could modify the BST node’s structure? (e.g., store subtree size for rank queries.)

---

## Approach: In-order traversal

Because in-order traversal of a BST visits nodes in **ascending order**, the kth node we visit is the kth smallest.

**Idea:**

1. Traverse in order: recurse left, then “visit” the current node, then recurse right.
2. Count visited nodes (or decrement `k`). When we have visited exactly `k` nodes, the current node’s value is the answer.

**Implementation options:**

- **Collect then index:** Do a full in-order traversal, push values into an array, then return `arr[k - 1]`. Time O(n), space O(n).
- **Early exit:** During in-order traversal, decrement a counter (or increment a “seen” count). When the counter reaches 0 (or we have seen `k` nodes), record the value and stop. Time O(k) to O(n), space O(h) for the recursion stack (height of tree).

The early-exit version is shown below; it avoids storing the whole inorder sequence when `k` is small.

---

## Solution (TypeScript)

```ts
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val ?? 0;
    this.left = left ?? null;
    this.right = right ?? null;
  }
}

function kthSmallest(root: TreeNode | null, k: number): number {
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
```

**Explanation:**

- `inorder(node)` performs in-order: left subtree first, then current node, then right subtree.
- We use `remaining` to track how many more “smallest” nodes we still need to pass. When we visit a node, we decrement `remaining`.
- When `remaining` becomes 0, the current node’s value is the kth smallest; we store it in `result` and return.
- Early returns when `node === null` or `remaining <= 0` avoid unnecessary work after the answer is found.

**Time complexity:** O(k) to O(n) — we stop once we’ve visited `k` nodes in order, but in the worst case we traverse the whole tree.

**Space complexity:** O(h) — recursion stack depth equals the height of the tree (O(log n) balanced, O(n) skewed).

---

## Reference

- [Kth Smallest Element in a BST — LeetCode](https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/)
