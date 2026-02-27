# Number of Islands

Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.

## Examples

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

Below is the algorithm only — no step recording. The live demo in the app uses a separate pass that records scan/dfs steps for animation.

```ts
function numIslands(grid: string[][]): number {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return 0;

  function dfs(r: number, c: number): void {
    // Out of bounds or not land: nothing to do
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    // Sink this cell so we never count it again (in-place "visited")
    grid[r][c] = "0";
    // Recurse on the four neighbors (up, down, left, right)
    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  }

  let count = 0;
  // Scan every cell; when we see land, we've found a new island — count it and sink the whole island
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}
```

---

## Discussion

- **Same DFS pattern as the tree demo:** In the DFS page we do “visit root, then recurse on children.” Here we “visit” the cell (sink it) and recurse on the four neighbors. The only difference is the graph structure (grid with 4-neighbors instead of a binary tree with left/right).
- **In-place “visited”:** Flipping `'1'` to `'0'` avoids an extra visited set and keeps space lower; the grid itself is the visited structure. If you cannot mutate the input, use a `Set<string>` of `"r,c"` or a boolean 2D array.
- **BFS alternative:** You can replace the DFS recursion with a queue and explore the island level-by-level; time and space complexity remain O(m × n). DFS is often shorter to write and matches the “go deep first” idea from the DFS page.
- **Diagonal connections:** The problem defines islands only via horizontal/vertical adjacency. If diagonals were allowed, you would add four more recursive calls (or neighbor directions) for the diagonal cells.
