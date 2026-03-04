
# Solution (Python 3)

Same algorithm with in-place sinking and a nested DFS helper. Uses a mutable list of lists so we can flip `'1'` to `'0'`.

```python
def num_islands(grid: list[list[str]]) -> int:
    row_count = len(grid)
    if row_count == 0:
        return 0
    col_count = len(grid[0])
    if col_count == 0:
        return 0

    def depth_first_search(row: int, col: int) -> None:
        # Out of bounds or not land: nothing to do
        if row < 0 or row >= row_count or col < 0 or col >= col_count or grid[row][col] != "1":
            return
        # Sink this cell so we never count it again (in-place "visited")
        grid[row][col] = "0"
        # Recurse on the four neighbors (up, down, left, right)
        depth_first_search(row - 1, col)
        depth_first_search(row + 1, col)
        depth_first_search(row, col - 1)
        depth_first_search(row, col + 1)

    island_count = 0
    # Scan every cell; when we see land, we've found a new island — count it and sink the whole island
    for row in range(row_count):
        for col in range(col_count):
            if grid[row][col] == "1":
                island_count += 1
                depth_first_search(row, col)
    return island_count
```

For Python 3.8 and earlier, use `List[List[str]]` from `typing` instead of `list[list[str]]` for the type hint.
