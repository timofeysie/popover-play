# The Fish Stack Problem

N voracious fish are moving along a river. Calculate how many fish stay alive.

You are given two non-empty arrays `A` and `B` of length N. They represent N fish in a river, ordered **downstream** (index 0 is upstream, index N−1 is downstream). Each fish has a **unique position** and a **unique size**.

- **A[P]** — size of fish P (all elements unique).
- **B[P]** — direction: `0` = flowing **upstream**, `1` = flowing **downstream**.

When two fish moving in **opposite** directions meet (and there are no other living fish between them), the **larger** one eats the smaller; the survivor keeps moving in its original direction. Fish moving in the same direction never meet. All fish move at the same speed.

**Goal:** Return the number of fish that stay alive.

## Table of contents

- [Meeting rule](#meeting-rule)
- [Example](#example)
- [Constraints](#constraints)
- [Approach: Stack](#approach-stack)
- [Solution (TypeScript)](#solution-typescript)
- [Reference](#reference)

---

## Meeting rule

Two fish P and Q meet when:

- P < Q (P is upstream of Q),
- B[P] = 1 (P moves downstream),
- B[Q] = 0 (Q moves upstream),
- There are no living fish between them.

Then:

- If **A[P] > A[Q]**: P eats Q; P continues downstream.
- If **A[Q] > A[P]**: Q eats P; Q continues upstream.

---

## Example

- **A** = [4, 3, 2, 1, 5]
- **B** = [0, 1, 0, 0, 0]

So: fish 0 (size 4) upstream; fish 1 (size 3) downstream; fish 2, 3, 4 (sizes 2, 1, 5) upstream.

- Fish 1 (downstream) meets fish 2, eats it; meets fish 3, eats it; then meets fish 4 and is eaten (5 > 3).
- Fish 0 and fish 4 never meet.

**Output:** `2` (fish 0 and fish 4 survive).

---

## Constraints

- N is an integer in [1..100,000].
- Each element of A is in [0..1,000,000,000]; all distinct.
- Each element of B is 0 or 1.

---

## Approach: Stack

Process fish **from upstream to downstream** (left to right). The only possible meetings are: a **downstream** fish (1) to the left meeting an **upstream** fish (0) to the right (they move toward each other).

- **Downstream fish (B[i] = 1):** Push its size onto a stack. These are “pending” downstream fish that might later eat or be eaten by upstream fish to their right.
- **Upstream fish (B[i] = 0):** It will first meet the nearest downstream fish to its left — the **top** of the stack.

While the top is smaller than the current fish, the current fish eats it (pop).

If the stack becomes empty, this upstream fish survives.

If a larger downstream fish remains on top, it eats the current fish and we discard the current one.

**Result:** Survivors = (number of upstream fish that ever emptied the stack) + (number of downstream fish still on the stack).

---

## Solution (TypeScript)

```ts
function solution(A: number[], B: number[]): number {
  const downstreamStack: number[] = []; // sizes of downstream fish (B=1) still alive
  let upstreamSurvivors = 0;

  for (let i = 0; i < A.length; i++) {
    if (B[i] === 1) {
      downstreamStack.push(A[i]);
    } else {
      // Upstream fish: fight with downstream fish to its left (stack top)
      while (downstreamStack.length > 0 && downstreamStack[downstreamStack.length - 1] < A[i]) {
        downstreamStack.pop();
      }
      if (downstreamStack.length === 0) {
        upstreamSurvivors++;
      }
    }
  }

  return upstreamSurvivors + downstreamStack.length;
}
```

**Explanation:**

- The stack holds the sizes of downstream fish that have not yet been eaten by an upstream fish to their right.
- For each upstream fish, we pop (kill) every downstream fish on the stack that is smaller, until the stack is empty or we hit a larger one. If the stack becomes empty, this upstream fish survives.
- At the end, every fish still on the stack is a downstream fish that survived. So total survivors = `upstreamSurvivors + downstreamStack.length`.

**Time complexity:** O(N) — each fish is pushed at most once and popped at most once.

**Space complexity:** O(N) — the stack can hold all fish in the worst case (all downstream).

---

## Reference

- [Codility — 7. Stacks and Queues: Fish](https://app.codility.com/programmers/lessons/7-stacks_and_queues/) (free lesson)
