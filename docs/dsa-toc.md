# Table of Contents — Algorithms and Data Structures (docs/dsa.md)

Use this ToC to pick a topic for a new CodeLab example page. Each entry maps to a section in `docs/dsa.md` with approximate line numbers.

---

## 1. Introduction & context

| # | Section | Description |
|---|---------|-------------|
| 1.1 | **TL;DR** (≈12) | Short overview of the article and the Trekhleb repo. |
| 1.2 | **Algorithms and Data Structures using TypeScript in React** (≈17) | Article intro, definitions of data structures and algorithms. |
| 1.3 | **Data structures** (≈25) | Definition: organizing and storing data for efficient access. |
| 1.4 | **Algorithms** (≈29) | Definition: unambiguous rules to solve a class of problems. |
| 1.5 | **Why know them?** (≈35) | Why DSA matter: interviews, tradeoffs, not reinventing the wheel. |
| 1.6 | **The Trekhleb** (≈47) | The JavaScript Algorithms repo, class-based examples, limitations. |
| 1.7 | **Frontend vs. Backend** (≈85) | Different DSA requirements for frontend vs backend. |
| 1.8 | **The goal of this article** (≈95) | Plan: popular data types, functional TypeScript, sample questions. |

---

## 2. Data structures (deep dives)

| # | Section | Description |
|---|---------|-------------|
| 2.1 | **Hash table** (≈103) | Associative array, hash function, O(1) lookups, collisions, Map vs object. |
| 2.2 | **LRU (Least Recently Used) Cache** (≈123) | Limited-size cache that evicts least recently used items. |
| 2.3 | **Linked list** (≈129) | Linear collection with pointers, O(1) insert/remove, O(n) access, when to use. |
| 2.4 | **Map & Set & modern JavaScript** (≈158) | ES6 Map and Set, hash-table relation, code examples. |
| 2.5 | **Map** (≈168) | Key–value pairs, any key type, insertion order, performance. |
| 2.6 | **Set & programming shortcuts** (≈182) | Unique values, `[...new Set(array)]` for deduplication. |
| 2.7 | **Another take on this discussion** (≈254) | Memorizing vs understanding; Aman Manazir’s advice. |
| 2.8 | **Trees** (≈272) | Hierarchical structures, root, children, parent; BST, AVL, Red-Black, Segment, Fenwick. |
| 2.9 | **The Binary Search Tree (BST)** (≈284) | Ordered/sorted binary trees, fast lookup/add/remove. |
| 2.10 | **The sample code** (≈292) | Trekhleb’s class-based `BinaryTreeNode` example. |
| 2.11 | **Overview of BinaryTreeNode Class** (≈324) | value, left, right, parent, meta, nodeComparator. |
| 2.12 | **A Functional Approach** (≈336) | TypeScript interface and functional node helpers (createNode, setLeft, setRight, traverseInOrder). |
| 2.13 | **Example usage** (≈390) | Building a small BST with the functional API. |
| 2.14 | **Use Cases of Binary Search Trees** (≈455) | When BSTs are a good fit. |
| 2.15 | **Interview Questions for BSTs** (≈465) | Common BST interview topics. |
| 2.16 | **Real-World Application** (≈474) | Practical uses of trees. |
| 2.17 | **Other Tree type examples** (≈486) | AVL, Red-Black, Segment Tree, Fenwick Tree. |
| 2.18 | **Leader boards and trees** (≈516) | Using trees (e.g. BST) for leaderboards; segment trees for range queries. |

---

## 3. Algorithms (overview & groupings)

| # | Section | Description |
|---|---------|-------------|
| 3.1 | **Algorithms (how to solve a class of problems)** (≈550) | Definition and high-level groupings. |
| 3.2 | **Topic groupings** (≈556) | Math, Sets, Strings, Searches, Sorting, Linked Lists, Trees, Graphs, etc. |
| 3.3 | **Paradigm groupings** (≈573) | Brute Force, Greedy, Divide and Conquer, Dynamic Programming, Backtracking, Branch & Bound. |

---

## 4. Algorithm example: Quicksort

| # | Section | Description |
|---|---------|-------------|
| 4.1 | **Algorithm Example: Quicksort** (≈582) | Intro to the Quicksort section. |
| 4.2 | **Quicksort** (≈586) | Divide and conquer, pivot, partitioning, recursive sub-arrays. |
| 4.3 | **Quicksort complexity** (≈598) | Big O: best/average n log n, worst n², memory, stability. |
| 4.4 | **Big O notation and the polynomial-time benchmark** (≈612) | O(1), O(log n), O(n), O(n log n), O(n²); “efficient” = polynomial time. |
| 4.5 | **The example code** (≈653) | Trekhleb’s class-based Quicksort implementation. |
| 4.6 | **A functional TypeScript approach** (≈747) | Functional `quickSort` in TypeScript. |
| 4.7 | **Example usage of the quickSort function** (≈879) | Sample calls and behavior. |
| 4.8 | **Unit tests** (≈899) | Tests for the Quicksort implementation. |
| 4.9 | **The Binary Search Algorithms** (≈944) | Half-interval / logarithmic search / binary chop. |

---

## 5. Leaderboard & binary search

| # | Section | Description |
|---|---------|-------------|
| 5.1 | **The Leader board example** (≈997) | WIP: using BST + binary search for leaderboards. |
| 5.2 | **Binary Search** (≈1007) | Finding position of a score in a sorted list. |
| 5.3 | **Description** (≈1011) | Steps: binary search → in-order traversal → get surrounding scores. |
| 5.4 | **Example Process** (≈1021) | Find user score, traverse in-order, extract neighbors. |
| 5.5 | **Complexity** (≈1028) | Binary search O(log n) avg, in-order O(n). |

---

## 6. Interview focus & top lists

| # | Section | Description |
|---|---------|-------------|
| 6.1 | **Frequently asked about data structures and algorithm in frontend interviews** (≈1034) | Most-used DSA in frontend interviews. |
| 6.2 | **The Top Ten** (≈1068) | Table: top 10 data structures/algorithms with add/delete/index/get complexity and notes (Hash Table, Stack, Queue, Linked List, Doubly Linked List, BST, Heap, Priority Queue, Trie, Tree). |

---

## 7. LeetCode-style example: Two Sum

| # | Section | Description |
|---|---------|-------------|
| 7.1 | **An example LeetCode problem** (≈1091) | Two Sum: find two indices such that values add to target. |
| 7.2 | **Hint 1** (≈1109) | Brute force: nested loops, O(n²), O(1) space. |
| 7.3 | **Complexity Analysis** (≈1137) | Time O(n²), space O(1). |
| 7.4 | **Hint 2** (≈1149) | Two-pass hash table (Map): build map, then find complement. |
| 7.5 | **Hint 3** (≈1178) | Single-pass hash table: check complement while building map. |
| 7.6 | **Final complexity analysis** (≈1214) | O(n) time, O(n) space. |
| 7.7 | **Single-Pass Hash Table** (≈1226) | Two-Sum Hash Table algorithm, complement/pair-finding pattern, space–time tradeoff. |

---

## 8. Pareto problem set (NeetCode-style)

| # | Section | Description |
|---|---------|-------------|
| 8.1 | **Pareto Problem Set** (≈1242) | Aman Manazir’s focused list; “cook book trap”; learn by doing. |
| 8.2 | **ARRAYS & HASHING** (≈1258) | Contains Duplicate, Valid Anagram, Two Sum, Group Anagrams, Top K Frequent, etc. |
| 8.3 | **TWO POINTERS** (≈1269) | Valid Palindrome, Two Sum II, 3Sum, Container With Most Water. |
| 8.4 | **SLIDING WINDOW** (≈1276) | Best Time to Buy/Sell, Longest Substring Without Repeating, etc. |
| 8.5 | **STACK** (≈1282) | Valid Parentheses, Min Stack, Daily Temperatures. |
| 8.6 | **BINARY SEARCH** (≈1288) | Binary Search, Find Min in Rotated Sorted Array, Search in Rotated Sorted Array. |
| 8.7 | **LINKED LIST** (≈1294) | Reverse, Merge Two Sorted, Reorder, Remove Nth From End, Cycle, LRU Cache. |
| 8.8 | **TREES** (≈1303) | Invert Binary Tree, Max Depth, Diameter, Balanced, Same Tree, LCA, Level Order, etc. |
| 8.9 | **HEAP/PRIORITY QUEUE** (≈1318) | Kth Largest in Stream, Last Stone Weight, Kth Largest in Array. |
| 8.10 | **GRAPHS** (≈1324) | Number of Islands, Clone Graph, Course Schedule, etc. |

---

## 9. Summary

| # | Section | Description |
|---|---------|-------------|
| 9.1 | **Summary** (≈1342) | Wrap-up and hashtag for feedback. |

---

## Suggested example-page candidates (single-concept, demo-friendly)

- **Hash table / Map** (2.1, 2.5) — Interactive key/value demo.
- **Set & deduplication** (2.6) — “Remove duplicates” with `Set` + live array example.
- **Linked list** (2.3) — Simple visual list with nodes and pointers.
- **Binary Search Tree** (2.9, 2.12, 2.13) — Small BST with functional API, insert/traverse.
- **Quicksort** (4.2, 4.6) — Step-through or animated sort with functional TypeScript.
- **Binary Search** (4.9, 5.2) — Find index in sorted array with complexity note.
- **Two Sum (single-pass hash)** (7.1, 7.5, 7.7) — Input array + target, show indices and complement logic.
- **Big O notation** (4.4) — Short reference table (O(1), O(log n), O(n), O(n log n), O(n²)).
- **The Top Ten table** (6.2) — Data structure/algorithm complexity table as a reference page.

Tell me which section number (e.g. **2.6**, **4.2**, **7.1**) or topic you want, and I’ll draft the new example page and wire it into the app.
