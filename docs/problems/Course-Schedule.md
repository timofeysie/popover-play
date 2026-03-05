# Course Schedule

## Problem

There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a_i, b_i]` indicates that you must take course `b_i` first if you want to take course `a_i`.

For example, the pair `[0, 1]` means: to take course 0 you must first take course 1.

**Return** `true` if you can finish all courses; otherwise return `false`.

**Note:** This is equivalent to asking whether the directed graph of course dependencies has a **cycle**. If there is a cycle, no valid order exists and you cannot finish all courses.

---

## Terms

### Directed graph

A **directed graph** (digraph) is a set of **nodes** (vertices) and **edges** where each edge has a direction: it goes *from* one node *to* another. We write an edge as `u → v` (from `u` to `v`).

- In this problem, **nodes** = courses (0 to numCourses − 1).
- **Edge** `b → a` means “b is a prerequisite of a” (you must take b before a). So for each pair `[a_i, b_i]` we have an edge **from b_i to a_i**.

So the graph is “prerequisite → course that depends on it”: when you finish a prerequisite, you “unlock” the next course.

### Topological sort

A **topological ordering** of a directed graph is a linear order of the nodes such that for every edge `u → v`, node `u` appears **before** `v` in the order. So “all arrows point forward” in the sequence.

- **Topological sort** is the algorithm that produces such an ordering (when one exists).
- A topological ordering exists **if and only if** the graph has **no directed cycle**. If there is a cycle (e.g. A → B → C → A), you can never put all of them “before” each other, so no valid order exists.

So “can I finish all courses?” = “does the dependency graph have a topological ordering?” = “is the graph **acyclic**?”

---

## Approach: BFS (Kahn’s algorithm) — “Take a class, see what opens up”

A natural way to think about it is the real-world process:

1. Some courses have **no prerequisites** (or you’ve already satisfied them). Those are “available” to take.
2. You **take one** of those courses. That course is now “done.”
3. Finishing that course may **satisfy the last prerequisite** for other courses — so those courses become newly available.
4. Repeat: keep taking courses that are available until you’ve taken everything or you’re stuck (nothing available but you haven’t finished all).

If you can take all courses this way, there is a valid order (and the graph is acyclic). If you’re stuck — some courses left but none of them are available — then some of them form a **cycle** in the dependency graph (each one “waits on” another in a loop), so you return `false`.

**Kahn’s algorithm** is exactly this process, implemented with a queue and in-degree counts:

1. **In-degree** of a node = number of edges pointing *into* it = number of prerequisites that must be finished before that course. So “in-degree 0” = no prerequisites left = available to take.
2. Build the graph (adjacency list: from each prerequisite, list the courses that depend on it) and compute every node’s in-degree.
3. Enqueue all nodes with in-degree 0 (courses you can take right away).
4. **BFS:** Dequeue a node (we “take” that course). For each of its outgoing edges (each course that had this one as a prerequisite), decrement that neighbor’s in-degree. If a neighbor’s in-degree becomes 0, enqueue it — it’s now available.
5. Count how many nodes we actually process. If we process **all** nodes, we found a valid order → return `true`. If the queue becomes empty before we’ve processed all nodes, the remaining nodes lie in cycles (they always have in-degree &gt; 0) → return `false`.

So “take a class, see what opens up” = dequeue a course, reduce the in-degree of every course that depended on it, and add any that become 0 to the “available” queue.

---

## Solution outline (Kahn’s algorithm)

1. **Build graph and in-degrees**
   - `adj[b]` = list of courses that have `b` as a prerequisite (edges from b to those courses).
   - `inDegree[a]` = number of prerequisites of course `a` (number of edges into `a`).
   - For each pair `[a, b]`: add `a` to `adj[b]`, and increment `inDegree[a]`.

2. **Initialize queue**
   - Enqueue every course `c` with `inDegree[c] === 0`.

3. **BFS**
   - While the queue is not empty: dequeue a course `c`; count it as “taken.” For each neighbor `next` in `adj[c]`, do `inDegree[next]--`; if `inDegree[next] === 0`, enqueue `next`.

4. **Result**
   - If the count of taken courses equals `numCourses`, return `true` (no cycle, valid order). Otherwise return `false`.

**Time:** O(V + E) (nodes + edges). **Space:** O(V + E) for the graph and queue.

### Solution (TypeScript)

```ts
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // inDegree[c] = number of prerequisites course c still needs (edges pointing into c)
  const inDegree = new Array<number>(numCourses).fill(0);
  // adj[b] = list of courses that have b as a prerequisite (outgoing edges from b)
  const adj: number[][] = Array.from({ length: numCourses }, () => []);

  // Build graph and in-degrees: for each [course, prereq], edge goes from prereq → course
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    inDegree[course]++;
  }

  // Queue = courses with no remaining prerequisites ("available" to take)
  const queue: number[] = [];
  for (let c = 0; c < numCourses; c++) {
    if (inDegree[c] === 0) queue.push(c);
  }

  let taken = 0;
  while (queue.length > 0) {
    const c = queue.shift()!; // take this course
    taken++;
    // Finishing c satisfies one prerequisite for each dependent; enqueue any that become available
    for (const next of adj[c]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return taken === numCourses; // took all => no cycle; otherwise remaining nodes are in a cycle
}
```

- `adj[prereq]` = list of courses that require `prereq` (outgoing edges from prereq).
- `inDegree[course]` = number of prerequisites for that course.
- Queue holds courses with no remaining prerequisites; we dequeue (“take” a course), decrement in-degrees of dependents, and enqueue any that become 0. If we take all courses, the graph is acyclic.

---

## Other approaches

- **DFS:** You can also detect cycles / compute a topological order with DFS (e.g. “visit” nodes and mark when you finish; a back edge indicates a cycle). Kahn’s algorithm (BFS) matches the “take a class, see what opens up” intuition; DFS is another standard way to solve the same problem.
