# Kth Smallest Element in a BST

## The problem

> Given the root of a Binary Search Tree (BST) and an integer k, return the kth smallest value (1-indexed).

### What K and "kth smallest" Mean in the BST Problem

**k** is an integer that specifies a *rank* or *position* in the sorted order of all values in the BST.

- k = 1 → "the 1st smallest" (the minimum)
- k = 2 → "the 2nd smallest"
- k = 3 → "the 3rd smallest"
- k = n → "the nth smallest" (the maximum, when the tree has n nodes)

So k tells you: "I want the value at position k when the tree's values are listed from smallest to largest."

## What is "kth smallest"?

The **kth smallest** value is the value that appears at index k - 1 when you sort all BST values in ascending order (or equivalently, when you perform in-order traversal of the BST).

Because a BST's in-order traversal yields values in sorted order, the kth node you visit during in-order traversal *is* the kth smallest value.

## The non-obvious part

Given a BST root, how do you efficiently retrieve the element at rank k? You can't just index into it like an array. You have to traverse it, and the elegant observation is that in-order traversal naturally gives you rank order. The problem is testing whether you know that BST + in-order = sorted sequence.

### Example

Tree from Example 1: `root = [3, 1, 4, null, 2]` (structure: 3 → left 1, right 4; 1's right child is 2)

- In-order sequence: 1, 2, 3, 4
- k = 1 → kth smallest = 1 (1st smallest)
- k = 2 → kth smallest = 2 (2nd smallest)
- k = 3 → kth smallest = 3 (3rd smallest)
- k = 4 → kth smallest = 4 (4th smallest)

## 1-indexed vs 0-indexed

The problem says **1-indexed**, meaning:

- k = 1 refers to the first (smallest) element, not the second
- So the kth smallest is `sortedValues[k - 1]` in 0-indexed terms
