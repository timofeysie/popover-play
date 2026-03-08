# Number of Islands

This doc has details of the number of islands challenge from LeetCode.

I explore a Depth First Search Approach (same idea as tree DFS).
This involves recursion.
Scanning every cell. When we find a `'1'`, we have found the start of a new island — increment the count.
From that cell, run **DFS** to explore and “sink” all connected land (mark as visited so we never count it again). Here we reuse the same DFS idea as on a tree: **visit the current node, then recurse on each neighbor**. For the grid, “neighbors” are the four adjacent cells; we avoid revisiting by mutating the grid in place (flip `'1'` to `'0'`) instead of keeping a separate visited set.

Then I look at the Breadth First Search Approach (BFS).
This involves using a Queue.
Instead of recursing from each land cell, we can use a **queue** and explore the island level-by-level (breadth-first). Same idea: when we find a `'1'`, we have a new island; we sink the whole connected component by visiting all 4-neighbors in BFS order. Time and space remain O(m × n).

Finally we look at a Euclidean clustering approach.
Collect all land points: `points = [(r, c) for each (r, c) with grid[r][c] == '1']`.
Use **Union-Find (Disjoint Set Union):** start with each point in its own set. For each pair of land points that are within Euclidean distance 1 (i.e. 4-neighbors), `union` their sets.
Count the number of distinct roots (or the number of sets). That is the number of islands.

## Table of contents

- [Examples](#examples)
- [Constraints](#constraints)
- [Approach: DFS (same idea as tree DFS)](#approach-dfs-same-idea-as-tree-dfs)
- [Solution (TypeScript)](#solution-typescript)
- [Discussion](#discussion)
- [DFS, backtracking, and what we are actually counting](#dfs-backtracking-and-what-we-are-actually-counting)
- [Base case / terminating situation](#base-case--terminating-situation)
- [5×5 grid](#55-grid)
- [BFS approach (TypeScript)](#bfs-approach-typescript)
- [Euclidean clustering view](#euclidean-clustering-view)
  - [Union-Find (clustering) solution (TypeScript)](#union-find-clustering-solution-typescript)

## The problem

Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.

### Examples

**Example 1:**

- **Input:** `grid = [
["1","1","1","1","0"], 
["1","1","0","1","0"], 
["1","1","0","0","0"], 
["0","0","0","0","0"]]`
- **Output:** `1`

**Example 2:**

- **Input:** `grid = [
["1","1","0","0","0"], 
["1","1","0","0","0"], 
["0","0","1","0","0"], 
["0","0","0","1","1"]]`
- **Output:** `3`

## Constraints

- `m == grid.length`
- `n == grid[i].length`
- `1 <= m, n <= 300`
- `grid[i][j]` is `'0'` or `'1'`

---

## Approach: DFS (same idea as tree DFS)

Treat the grid as a graph: each land cell `'1'` is a node; edges go to the four neighbors (up, down, left, right). An island is a **connected component** of land. We count components by:

1. Scanning every cell. When we find a `'1'`, we have found the start of a new island — increment the count.
2. From that cell, run **DFS** to explore and “sink” all connected land (mark as visited so we never count it again). Here we reuse the same DFS idea as on a tree: **visit the current node, then recurse on each neighbor**. For the grid, “neighbors” are the four adjacent cells; we avoid revisiting by mutating the grid in place (flip `'1'` to `'0'`) instead of keeping a separate visited set.

DFS from `(r, c)`:

- **Base case:** If `(r, c)` is out of bounds or `grid[r][c] !== '1'`, return (nothing to explore).
- **Visit:** Set `grid[r][c] = '0'` so this cell is not counted again.
- **Recurse:** Call DFS on `(r-1, c)`, `(r+1, c)`, `(r, c-1)`, `(r, c+1)`.

After the DFS from a starting `'1'`, the whole island is turned to `'0'`, so the outer loop will not count it again.

- **Time:** O(m × n) — each cell is considered at most once in the outer loop and at most once inside DFS.
- **Space:** O(m × n) in the worst case for the recursion stack (e.g. one long snake of land); O(min(m, n)) for a more typical shape. Often stated as O(m × n) to cover the worst case.

---

## Solution (TypeScript)

Below is the algorithm only — no step recording. The live demo in the app uses a separate pass that records scan and depth-first search steps for animation.

```ts
function depthFirstSearch(row: number, col: number): void {
  // Out of bounds or not land: nothing to do
  if (row < 0 || row >= rowCount || col < 0 || col >= colCount || grid[row][col] !== "1") return;
  // Sink this cell so we never count it again (in-place "visited")
  grid[row][col] = "0";
  // Recurse on the four neighbors (up, down, left, right)
  depthFirstSearch(row - 1, col);
  depthFirstSearch(row + 1, col);
  depthFirstSearch(row, col - 1);
  depthFirstSearch(row, col + 1);
}

function numIslands(grid: string[][]): number {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  if (rowCount === 0 || colCount === 0) return 0;

  let islandCount = 0;
  /* Scan every cell; 
   * when we see land, we've found a new island
   * count it and sink the whole island */
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      if (grid[row][col] === "1") {
        islandCount++;
        depthFirstSearch(row, col);
      }
    }
  }
  return islandCount;
}
```

Sinking works because the whole connected piece of land is sunk during one DFS, not just the first cell.

1. When we find a "1" and call depthFirstSearch(row, col):
2. We sink that cell: grid[row][col] = "0".
We recurse to its four neighbors. For each of those, we call depthFirstSearch again.
3. Inside each of those calls we do the same: if the neighbor is land, we sink it and recurse to its four neighbors.
4. So from “land next to the current four neighbors” we again recurse to its neighbors, and so on.

So we don’t stop at the immediate four cells. We keep recursing: every time we see a "1", we sink it and recurse to its four neighbors. That way we walk over every cell that is connected by a path of land (up/down/left/right). By the time the first depthFirstSearch(row, col) returns, the entire island — every connected land cell — has been sunk to "0".

The outer loop then continues to the next cell. Any cell that was part of that island is already "0", so we never see it as land again and never count it as a new island. The “more land next to the current four neighbors” is sunk inside those deeper recursive calls before the outer loop ever gets there.

---

## Discussion

- **Same DFS pattern as the tree demo:** In the DFS page we do “visit root, then recurse on children.” Here we “visit” the cell (sink it) and recurse on the four neighbors. The only difference is the graph structure (grid with 4-neighbors instead of a binary tree with left/right).
- **In-place “visited”:** Flipping `'1'` to `'0'` avoids an extra visited set and keeps space lower; the grid itself is the visited structure. If you cannot mutate the input, use a `Set<string>` of `"row,col"` or a boolean 2D array.
- **BFS alternative:** You can replace the DFS recursion with a queue and explore the island level-by-level; time and space complexity remain O(m × n). DFS is often shorter to write and matches the “go deep first” idea from the DFS page.
- **Diagonal connections:** The problem defines islands only via horizontal/vertical adjacency. If diagonals were allowed, you would add four more recursive calls (or neighbor directions) for the diagonal cells.

---

## DFS, backtracking, and what we are actually counting

**Does this solution use backtracking?** Yes — in the sense that **DFS always “backtracks” when it returns from a recursive call**. From a cell we recurse to one neighbor (e.g. up); when that entire branch is finished, we *return* and then recurse to the next neighbor (down, left, right). That *return* is the backtrack: we go back to the caller and try the next branch. We do **not** backtrack in the “undo your move” sense (e.g. un-sinking a cell). So: **DFS implies backtracking** (going back to try other branches); our solution does that via function return. We just don’t undo state.

**Technical definition of DFS here:** We treat the grid as a **graph**: nodes = cells, edges = adjacent (up/down/left/right) cells. **Depth-first search** means: from the current node, pick one neighbor, go there, and **recursively explore that node first** before trying other neighbors. So we go “as deep as possible” along one path (e.g. (0,0) → (1,0) → (2,0) → …) until we hit water or a boundary; then we return and try the next direction. That “go deep first, then return and try next” is exactly what our recursion does. So this **is** a DFS: we use the call stack, we explore one direction fully before others, and we “backtrack” by returning.

**Are we counting trees?** Not exactly. We are counting **connected components** of the grid graph (each component is one island). A “tree” is a connected graph with no cycles. An island can **have cycles** (e.g. a 2×2 block of land has a cycle). So each island is a connected subgraph that might not be a tree. We are **not** “counting trees”; we are counting how many separate connected components of land there are, and we use DFS to **explore** each component (sink it) once we’ve found one land cell in it.

**What do the “trees” look like?** The **DFS exploration order** does form a kind of tree: the **DFS tree** (or DFS spanning forest). Think of it as “who discovered whom”:

- **Root:** The first land cell we start DFS from for that island (the cell the outer loop just found).
- **Children:** From each cell we recurse to up to four neighbors. The first time we enter a neighbor, that neighbor becomes a “child” of the current cell in the exploration tree. We never enter the same cell twice (we sink it), so we never close a cycle in this tree.
- So the “tree” is not the physical island; it’s the **order we visit**: each node has at most four children (the neighbors we actually step into), and we go deep along one branch before returning to try the next.

**Example (small island, 2×2 block):**

```
Grid:    1 1
         1 1
```

If we start at top-left (0,0) and use order up, down, left, right:

- Root: (0,0). Recurse up → out of bounds; down → (1,0); left → out of bounds; right → (0,1).
- From (1,0): up → (0,0) already sunk; down → out of bounds; left → out of bounds; right → (1,1). So (1,1) is “child” of (1,0).
- From (0,1): up/down/left/right → (1,1) is land but we will already have sunk it when we get there from (1,0), so (0,1) has no new children in this order.

So the DFS tree of **visit order** might look like:

```
      (0,0)
      /   \
  (1,0)   (0,1)
    |
  (1,1)
```

The physical island is a 4-cycle; the DFS **traversal** is a tree because we never revisit a node. So: we use DFS to explore each **connected component**; the “tree” is the shape of our traversal, not the island’s shape.

---

## Base case / terminating situation

The recursion in `depthFirstSearch` must eventually stop; otherwise we would recurse forever. The **base case** is the guard at the start of the function:

```ts
if (row < 0 || row >= rowCount || col < 0 || col >= colCount || grid[row][col] !== "1") return;
```

We stop (return without recursing) when **any** of these is true:

1. **Out of bounds (row/col):** `row/col < 0` or `row/col >= row/col count` — we have walked off the grid.
2. **Not land:** `grid[row][col] !== "1"` — the cell is water (0) or has already been sunk to 0.

So recursion terminates in two ways: we hit the **grid boundary**, or we hit **water or already-visited (sunk) land**. Every recursive call either triggers one of these conditions (base case) or sinks the current cell and recurses to four neighbors. Because we sink as we go, we never visit the same land cell twice, and the grid is finite, so we eventually run out of new land to explore and all branches hit a base case and return.

## 5×5 grid

Here is another sample grid which shows a somewhat unexpected traversal order.

```
const DEMO_GRID: string[][] = [
  ["0", "0", "0", "0", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "1", "1", "1", "0"],
  ["0", "0", "0", "0", "0"],
];
```

The land is the 3×3 block in the middle (cells (1,1) through (3,3)). The outer loop hits (1,1) first and starts DFS there. 
The code recurses in order up, down, left, right (row−1, row+1, col−1, col+1).
In practice, this looks like a worm action where the worm starts going down, turns lefts and goes back up, then turns right and goes back down in a zig-zag manner.

The exact visit order looks like this:

- (1,1) → down to (2,1)
- (2,1) → down to (3,1)
- (3,1) → right to (3,2)
- (3,2) → right to (3,3)
- (3,3) → up to (2,3)
- (2,3) → up to (1,3)
- (1,3) → left to (1,2)

Back at (1,1): left (1,0) water; right → (1,2) already sunk (we reached it from (1,3))
Back at (2,1): right → (2,2) land, so we visit (2,2)
From (2,2): all neighbors are already sunk → done
So the “who discovered whom” order is: (1,1) → (2,1) → (3,1) → (3,2) → (3,3) → (2,3) → (1,3) → (1,2), and later (2,1) → (2,2). (2,2) and (1,2) are leaves (no children in the DFS tree).
DFS tree (parent → children)

ASCII picture
                    (1,1)
                   /     \
              (2,1)       (1,2)   ← leaf (reached from (1,3) earlier)
              /   \
         (3,1)    (2,2)   ← leaf
           |         (3,2)
           |         (3,3)
           |         (2,3)
           |         (1,3)
           |         (1,2)   ← leaf

The physical island is a 3×3 block (with cycles); the tree is the “who first stepped into whom” order, which is acyclic.

---

## BFS approach (TypeScript)

Instead of recursing from each land cell, we can use a **queue** and explore the island level-by-level (breadth-first). Same idea: when we find a `'1'`, we have a new island; we sink the whole connected component by visiting all 4-neighbors in BFS order. Time and space remain O(m × n).

```ts
function numIslands(grid: string[][]): number {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  if (rowCount === 0 || colCount === 0) return 0;

  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let islandCount = 0;

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      if (grid[row][col] !== "1") continue;
      islandCount++;
      // BFS from (row, col): sink this island using a queue
      const queue: [number, number][] = [[row, col]];
      grid[row][col] = "0";
      while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        for (const [dr, dc] of dirs) {
          const r2 = r + dr;
          const c2 = c + dc;
          if (r2 >= 0 && r2 < rowCount && c2 >= 0 && c2 < colCount && grid[r2][c2] === "1") {
            grid[r2][c2] = "0";
            queue.push([r2, c2]);
          }
        }
      }
    }
  }
  return islandCount;
}
```

We sink the starting cell before the loop, then for each dequeued cell we check its four neighbors: if a neighbor is land, we sink it and enqueue it. The queue ensures we process cells in breadth-first order (all cells at distance 1, then distance 2, etc.).

---

## Euclidean clustering view

The problem can be seen as **Euclidean clustering** (or geometric connected components): treat each land cell as a point with coordinates (row, col). Two land points are in the same **cluster** if they are within a chosen distance. The standard problem uses **4-connectivity** (horizontal/vertical only), which corresponds to:

- **Distance threshold 1:** two points (r₁, c₁) and (r₂, c₂) are in the same cluster if their **Euclidean distance** is ≤ 1. That holds exactly when they share an edge (distance 1), not when they are only diagonally adjacent (distance √2). So “Euclidean distance ≤ 1” gives the same adjacency as the problem.

**What a clustering solution looks like:**

1. Collect all land points: `points = [(r, c) for each (r, c) with grid[r][c] == '1']`.
2. Use **Union-Find (Disjoint Set Union):** start with each point in its own set. For each pair of land points that are within Euclidean distance 1 (i.e. 4-neighbors), `union` their sets.
3. Count the number of distinct roots (or the number of sets). That is the number of islands.

So the “clustering” is: **merge any two land points that are within distance 1**. The DFS/BFS approach does the same connectivity in place on the grid; the union-find approach makes the “points + distance” view explicit. Complexity is still O(m × n) for the grid (you only union 4-neighbors, so you don’t compare every pair of points).

**Variant — 8-connectivity:** If you use **Euclidean distance ≤ √2**, then diagonally adjacent land cells also merge. That counts “islands” with diagonal connections. The algorithm is the same (DFS, BFS, or union-find); only the neighbor set changes from 4 directions to 8.

### Union-Find (clustering) solution (TypeScript)

```ts
function numIslands(grid: string[][]): number {
  const rowCount = grid.length;
  const colCount = grid[0]?.length ?? 0;
  if (rowCount === 0 || colCount === 0) return 0;

  // One union-find node per cell; initially each cell is its own root
  const size = rowCount * colCount;
  const parent = Array.from({ length: size }, (_, i) => i);

  // Map (row, col) to linear index 0 .. size-1
  function index(row: number, col: number): number {
    return row * colCount + col;
  }

  // Find root of the set containing i, with path compression
  function find(i: number): number {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  }

  // Merge sets containing i and j (make one root point to the other)
  function union(i: number, j: number): void {
    const pi = find(i);
    const pj = find(j);
    if (pi !== pj) parent[pi] = pj;
  }

  // 4-neighbors: up, down, left, right (Euclidean distance 1)
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      if (grid[row][col] !== "1") continue;
      const idx = index(row, col);
      // Union this land cell with every adjacent land cell (same cluster)
      for (const [dr, dc] of dirs) {
        const r2 = row + dr;
        const c2 = col + dc;
        if (r2 >= 0 && r2 < rowCount && c2 >= 0 && c2 < colCount && grid[r2][c2] === "1") {
          union(idx, index(r2, c2));
        }
      }
    }
  }

  // Count distinct roots among land cells = number of connected components (islands)
  const roots = new Set<number>();
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      if (grid[row][col] === "1") roots.add(find(index(row, col)));
    }
  }
  return roots.size;
}
```

- Each cell is a node; `parent[i]` is the union-find parent of the node at linear index `i`.
- For every land cell, union with each 4-neighbor that is also land (Euclidean distance 1).
- Count distinct roots among all land cells → number of islands. Time O(m × n × α(m × n)) ≈ O(m × n); space O(m × n).
