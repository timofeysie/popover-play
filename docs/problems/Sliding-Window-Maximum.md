# Sliding Window Maximum

## Problem

You are given an array of integers `nums` and a positive integer `k`. A **sliding window** of size `k` moves from the very left of the array to the very right. At every position you can only see the `k` numbers in the window, and on each step the window moves right by one position.

**Return** an array containing the **maximum** value inside the window at each position.

### Example

```text
nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3

Window position                Max
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7

Output: [3, 3, 5, 5, 6, 7]
```

A second tiny example: `nums = [1], k = 1` → `[1]`.

### Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `1 <= k <= nums.length`

That `10^5` upper bound on `nums.length` is the important one — it is exactly the regime where the obvious O(n·k) solution starts to time out and the linear-time deque solution becomes worth knowing.

---

## Terms

### Sliding window

A **sliding window** is a fixed-size (or variable-size) contiguous sub-range of an array — `nums[i..i+k-1]` — that we move one step at a time. Instead of recomputing some quantity (sum, max, count of distinct values, …) from scratch for every window, we **incrementally update** it as one element falls off the left and one element joins on the right. Done well, this turns an obvious O(n·k) approach into O(n).

### Deque (double-ended queue)

A **deque** (pronounced “deck”, short for *double-ended queue*) is a sequence container that supports four O(1) operations:


| Operation      | Effect                                       |
| -------------- | -------------------------------------------- |
| `pushFront(x)` | Insert `x` at the **front** of the sequence. |
| `pushBack(x)`  | Insert `x` at the **back** of the sequence.  |
| `popFront()`   | Remove and return the **front** element.     |
| `popBack()`    | Remove and return the **back** element.      |


Compared to its more famous siblings:

- A **stack** is a deque restricted to one end (LIFO — last in, first out).
- A **queue** is a deque restricted to push at one end and pop at the other (FIFO — first in, first out).
- A **deque** can do both — that flexibility is exactly what the sliding-window-maximum trick needs.

JavaScript does not ship a true deque type. The usual stand-ins are:

- `Array.push` / `Array.pop` are O(1) (back of the array), but `Array.shift` / `Array.unshift` (front of the array) are **O(n)** because every other element has to slide. So a JavaScript array can fake a deque correctly but not always with O(1) per operation.

- For a strict O(n) implementation you can use a small **ring buffer**, a **linked list**, or just keep a `head` index and never actually call `shift()` (mark elements as logically removed and advance the head). For interview-grade code on `n ≤ 10^5`, plain `Array.shift()` is normally fine.

### Monotonic deque

A **monotonic deque** is a deque whose contents are kept in **monotonic order** (strictly increasing, or strictly decreasing). For Sliding Window Maximum we maintain a **monotonic decreasing** deque of *indices* — the values `nums[deque[0]]`, `nums[deque[1]]`, … strictly decrease from front to back.

Two consequences:

1. The **front** of the deque is always the index of the **maximum** value currently in the deque.
2. Whenever a new value `nums[i]` arrives that is **bigger** than the value at the back, we can **pop the back** — that smaller, older value can never be the window’s maximum again, because `nums[i]` is both larger and more recent (it leaves the window strictly later).

That second property is what makes the algorithm O(n) — every index is pushed exactly once and popped at most once.

### Why store *indices*, not values

The deque stores **indices** rather than the values themselves so we can tell when an element has slid out of the window. The window covers `nums[i-k+1 .. i]`, so the front of the deque is out of the window exactly when `deque[0] <= i - k`. With only the value stored, we would not know its position in the array.

### Amortised analysis

The deque solution’s inner `while` loop looks unbounded — in the worst case a single iteration of the outer loop pops many elements. But every element is pushed onto the deque **once** and popped **at most once** across the entire run. So the *total* work across all `n` outer iterations is bounded by `2n`, giving O(n) overall. This style of reasoning — where one step is sometimes expensive but the total is cheap — is called **amortised analysis**.

---

## Approach 1: Brute force (O(n·k))

The most direct way: for every window position, scan the `k` elements and take the max.

```ts
function maxSlidingWindowBrute(nums: number[], k: number): number[] {
  const windowMaxes: number[] = [];
  const lastWindowStart = nums.length - k;

  for (let windowStart = 0; windowStart <= lastWindowStart; windowStart++) {
    const windowEndExclusive = windowStart + k;
    const currentWindow = nums.slice(windowStart, windowEndExclusive);
    const currentWindowMax = Math.max(...currentWindow);
    windowMaxes.push(currentWindowMax);
  }

  return windowMaxes;
}
```

What each name means:

- `windowStart` — the index in `nums` where the current window begins.
- `lastWindowStart` — the index of the last valid window start. A window of size `k` that starts here ends at the final element of the array, so any larger start would run off the end.
- `windowEndExclusive` — one past the index of the last element in the window. This is the convention `Array.slice` expects: `nums.slice(start, end)` returns indices `start ..  end − 1`.
- `currentWindow` — a fresh copy of the `k` elements in the window.
- `currentWindowMax` — the largest value in that copy.

So the loop reads as: *for every valid window start, copy the window, find its max, and append it to the answer*.

- **Time:** O(n·k) — `n − k + 1` windows, each scanned in O(k).
- **Space:** O(k) for the slice (plus O(n) for the output).

Easy to write under time pressure, but with `n` up to `10^5` and `k` up to `n`, this is `10^10` operations in the worst case. Time-limit territory on most judges. We need a way to **reuse work** between windows.

---

## Approach 2: Monotonic deque (O(n))

The key insight: when scanning left to right, **smaller, older values are useless** as soon as a larger, newer value appears. They can never be the max of any current or future window — the larger value dominates them and stays in the window strictly longer.

So we keep a **monotonic decreasing deque of indices**. At every step `i`:

1. **Drop the front if it has slid out of the window.** If `deque[0] <= i - k`, that index is no longer in `[i-k+1, i]`. Shift it off.
2. **Pop smaller values from the back.** While the value at the back is `< nums[i]`, pop it. Those values are dominated by `nums[i]` and can never be the max again.
3. **Push the current index to the back.** The deque stays monotonically decreasing because step 2 cleared anything smaller.
4. **Record the window max.** Once `i >= k - 1` the window is full, so the front of the deque is the index of the max — push `nums[deque[0]]` onto the result.

### Walk-through on `nums = [1, 3, -1, -3, 5, 3, 6, 7]`, `k = 3`

The deque stores indices; values shown in brackets for readability.


| `i` | `nums[i]` | drop-out front | pop back (smaller than `nums[i]`)  | push | deque (values) | result               |
| --- | --------- | -------------- | ---------------------------------- | ---- | -------------- | -------------------- |
| 0   | 1         | —              | —                                  | 0    | `[1]`          | (warming up)         |
| 1   | 3         | —              | pop 0 (`1 < 3`)                    | 1    | `[3]`          | (warming up)         |
| 2   | −1        | —              | —                                  | 2    | `[3, -1]`      | `[3]`                |
| 3   | −3        | —              | —                                  | 3    | `[3, -1, -3]`  | `[3, 3]`             |
| 4   | 5         | shift idx 1    | pop 3 (`-3 < 5`), pop 2 (`-1 < 5`) | 4    | `[5]`          | `[3, 3, 5]`          |
| 5   | 3         | —              | —                                  | 5    | `[5, 3]`       | `[3, 3, 5, 5]`       |
| 6   | 6         | —              | pop 5 (`3 < 6`), pop 4 (`5 < 6`)   | 6    | `[6]`          | `[3, 3, 5, 5, 6]`    |
| 7   | 7         | —              | pop 6 (`6 < 7`)                    | 7    | `[7]`          | `[3, 3, 5, 5, 6, 7]` |


Notice how rows 4 and 6 do extra work in step 2 — but every popped index was pushed exactly once on an earlier row. That is the amortised argument in action.

### Solution (TypeScript)

```ts
function maxSlidingWindow(nums: number[], k: number): number[] {
  // deque holds indices; values nums[deque[0]] > nums[deque[1]] > ...
  const deque: number[] = [];
  const result: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    // 1. drop the front if it has slid out of the window
    if (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }

    // 2. pop smaller values from the back — they are dominated by nums[i]
    while (
      deque.length > 0 &&
      nums[deque[deque.length - 1]] < nums[i]
    ) {
      deque.pop();
    }

    // 3. push current index
    deque.push(i);

    // 4. once the window is full, the front is the index of the max
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}
```

- **Time:** O(n). Each index is pushed once and popped at most once.
- **Space:** O(k) auxiliary (the deque holds at most `k` indices). The output `result` is part of the required answer, so it is usually counted separately.

### A note on `Array.shift()`

In JavaScript, `Array.shift()` is O(n) — the engine has to slide every other element down by one. The code above is therefore *not* strictly O(n) in JavaScript. For a clean linear-time implementation you have two easy fixes:

1. Track a **head index** instead of physically removing the front:
  ```ts
   let head = 0;
   const deque: number[] = [];
   // …
   if (head < deque.length && deque[head] <= i - k) head++;
   // and use deque[head] in place of deque[0]
  ```
2. Use a **linked list / ring buffer / library deque** with O(1) push/pop on both ends.

In practice, for `n ≤ 10^5` and small-to-moderate `k`, the simple `Array.shift()` version passes comfortably on LeetCode.

---

## Other approaches

- **Two passes with a max-heap** (priority queue keyed by value, with “lazy deletion” of indices that fell out of the window) — O(n log k) time, O(k) space. Less elegant than the deque, but a good fallback if you don’t spot the monotonic-deque trick.
- **Sparse table / segment tree** for arbitrary range-max queries — O(n log n) preprocessing, then O(1) or O(log n) per window. Massive overkill for this problem, but the same data structures show up in problems where windows are not contiguous or are queried in arbitrary order.
- **Block decomposition** (split the array into blocks of size `k`, precompute prefix and suffix maxima within each block) — also O(n), and a nice alternative if you want to avoid a deque entirely.

The monotonic deque is the canonical answer because it is linear, in-place modulo O(k) extra memory, and generalises directly to the **sliding window minimum** (use a monotonic increasing deque) and to **shortest subarray with sum at least k** (monotonic deque on the prefix-sum array).

---

## Reference

- [LeetCode — 239. Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)
- The hints on the LeetCode page nudge you in exactly this direction:
  1. *How about using a data structure such as deque (double-ended queue)?*
  2. *The queue size need not be the same as the window’s size.*
  3. *Remove redundant elements and the queue should store only elements that need to be considered.*

