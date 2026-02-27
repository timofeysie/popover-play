# Two Sum

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

## Approach

Use a **hash map** (value → index). In one pass, for each `nums[i]` compute `complement = target - nums[i]`. If `complement` is already in the map, return `[map.get(complement), i]`; otherwise set `map.set(nums[i], i)`.

- **Time:** O(n)
- **Space:** O(n)

## Solution (TypeScript)

```ts
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }

  return []; // unreachable given "exactly one solution"
}
```

The `!` asserts to TypeScript that `seen.get(complement)` is defined when `seen.has(complement)` is true.
