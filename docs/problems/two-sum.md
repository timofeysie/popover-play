# Two Sum

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

## My initial brute force attempt

Here is my initial approach of two nested loops.

```ts
function twoSum(nums: number[], target: number): number[] {
  nums.forEach((num, index) => {
    for (let i = 0; i < nums.length; i++) {
      if (index !== i) {
        const sum = nums[index] + nums[i];
        if (sum === target) {
          return [index, i];
        }
      }
    }
  });
}
```

### Correctness bug: `return` inside `forEach`

In JavaScript/TypeScript, `return [index, i]` only returns from the **callback** passed to `forEach`, not from `twoSum`. The outer function’s return value is `undefined`, which does not satisfy `number[]`. So even when a pair is found, the caller does not get the indices.

Ways to keep a similar structure:

- Use a **`for`** loop (or `for...of` with indices) and **`return`** from `twoSum` directly.
- Or accumulate a result in a variable outside the callback and break early—but `forEach` cannot be stopped cleanly with `break`; prefer a normal loop.

### Syntax note

As originally written, the `forEach` call also needed to close with `});` before the function’s closing `}` so the file parses.

### Complexity (if returns were fixed)

With an outer pass over indices and an inner full scan, you examine **O(n²)** pairs in the worst case.

- **Time:** O(n²)
- **Extra space:** O(1) aside from the input (only a few locals)

That matches the brute-force idea but not the follow-up goal of beating O(n²).

### Algorithmic observation

The problem guarantees **exactly one** valid pair. A single forward scan with a **map** from value → index avoids re-scanning the whole array: for each `i`, check whether `target - nums[i]` was seen at an earlier index. That yields **O(n)** time and **O(n)** space.

## A better approach

Use a **hash map** (value → index). Walk the array once. At index `i`, the current value is `nums[i]`; if some **earlier** element should pair with it to hit `target`, that earlier value must be `target - nums[i]` (the *other addend* in `current + other = target`). If that value is already in the map, return its stored index together with `i`; otherwise record `nums[i]` at `i` for future steps.

- **Time:** O(n)
- **Space:** O(n)

## Solution

Same algorithm, but **one `Map#get`**, then test for `undefined` instead of `has` + `get` + `!`:

```ts
function twoSum(nums: number[], target: number): number[] {
  const valueToIndex = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const current = nums[i];
    const otherAddend = target - current;
    const earlierIndex = valueToIndex.get(otherAddend);
    if (earlierIndex !== undefined) {
      return [earlierIndex, i];
    }
    valueToIndex.set(current, i);
  }
  return []; // unreachable given "exactly one solution"
}
```

## A refactored version

The subtraction `target - nums[i]` is easier to read if you spell out what it means: *the value that must appear earlier in the array so that it plus the current value equals `target`*. Longer names and a short comment make that explicit; **`get` once** and compare to `undefined` avoids non-null assertions (`!`).

```ts
function twoSum(nums: number[], target: number): number[] {
  // value -> index of the first time we saw that value
  const firstIndexByValue = new Map<number, number>();
  for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
    const valueAtCurrentIndex = nums[currentIndex];
    // We need: valueAtCurrentIndex + (some earlier value) === target
    // so that earlier value must be:
    const valueWeNeedFromEarlierInArray = target - valueAtCurrentIndex;
    const indexWhereWeSawThatValue = firstIndexByValue.get(
      valueWeNeedFromEarlierInArray,
    );
    if (indexWhereWeSawThatValue !== undefined) {
      return [indexWhereWeSawThatValue, currentIndex];
    }
    firstIndexByValue.set(valueAtCurrentIndex, currentIndex);
  }

  return []; // unreachable given "exactly one solution"
}
```

## A non-subtraction version

I find `return [seen.get(complement)!, i];` hard to read.
Also, `complement = target - nums[i];` is a little counterintuitive.

However, designing a solution that is easier to read has dire performance consequences.

The usual **O(n)** map solution needs the *other addend* `target - nums[i]` as a lookup key. 
If you want to avoid that expression entirely, use **sort + two pointers**: only ever form the candidate sum with **`+`**, then compare it to `target` with `<` / `>` / `===`.

You pay **O(n log n)** time and **O(n)** extra space for the indexed copy. Sorting uses a comparator with comparisons only (no `a - b`).

```ts
function twoSum(nums: number[], target: number): number[] {
  const withIndex = nums.map((value, originalIndex) => ({
    value,
    originalIndex,
  }));

  withIndex.sort((a, b) => {
    if (a.value < b.value) return -1;
    if (a.value > b.value) return 1;
    return 0;
  });

  let left = 0;
  let right = withIndex.length - 1;

  while (left < right) {
    const sum = withIndex[left].value + withIndex[right].value;

    if (sum === target) {
      return [
        withIndex[left].originalIndex,
        withIndex[right].originalIndex,
      ];
    }

    if (sum < target) {
      left += 1;
    } else {
      right -= 1;
    }
  }

  return []; // unreachable if exactly one solution exists
}
```

**Idea:** With values sorted, if the sum of the ends is too small, the only way to increase it is to move `left` rightward; if too large, move `right` leftward. That reasoning uses **order**, not **subtraction**.
