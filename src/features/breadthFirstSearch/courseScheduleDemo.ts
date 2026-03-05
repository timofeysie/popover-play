/**
 * Course Schedule (Kahn's algorithm).
 * Returns true if all courses can be finished (no cycle in the dependency graph).
 * Optionally returns the topological order (order in which courses are "taken").
 */
export function canFinish(
  numCourses: number,
  prerequisites: number[][],
  order?: { taken: number[] }
): boolean {
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

  const taken: number[] = [];
  while (queue.length > 0) {
    const c = queue.shift()!; // take this course
    taken.push(c);
    // Finishing c satisfies one prerequisite for each dependent; enqueue any that become available
    for (const next of adj[c]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  if (order) order.taken = taken;
  return taken.length === numCourses; // took all => no cycle; otherwise remaining nodes are in a cycle
}
