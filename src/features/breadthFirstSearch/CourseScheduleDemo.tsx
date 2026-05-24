import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { canFinish } from "./courseScheduleDemo";

/** Course numbers for display: index 0 = English 101, 1 = 102, 2 = 103 */
const COURSE_NUMBERS = [101, 102, 103];

function getLabel(index: number): string {
  return `English ${COURSE_NUMBERS[index]}`;
}

/** Passing: 101 → 102 → 103 (no cycle). Prerequisites [102, 101], [103, 102] → stored as indices [1,0], [2,1]. */
const PASSING_NUM_COURSES = 3;
const PASSING_PREREQUISITES: number[][] = [
  [1, 0], // 102 requires 101
  [2, 1], // 103 requires 102
];

/** Failing: same chain but 101 requires 103 → cycle. Prerequisites [1,0], [2,1], [0,2]. */
const FAILING_NUM_COURSES = 3;
const FAILING_PREREQUISITES: number[][] = [
  [1, 0], // 102 requires 101
  [2, 1], // 103 requires 102
  [0, 2], // 101 requires 103 (cycle)
];

/**
 * Directed dependency graph: nodes = courses, edge prereq → course means "course requires prereq".
 * Optional highlightEdge = [prereq, course] to mark the edge that causes failure (e.g. cycle back edge).
 */
function DependencyGraph({
  numCourses,
  prerequisites,
  courseNumbers,
  highlightEdge,
}: {
  numCourses: number;
  prerequisites: number[][];
  courseNumbers: number[];
  highlightEdge?: [number, number];
}) {
  const nodeWidth = 88;
  const nodeHeight = 32;
  const gap = 48;
  const startX = 24;
  const centerY = 56;
  const nodePos = (i: number) => ({ x: startX + i * (nodeWidth + gap), y: centerY });

  const edgeToKey = (a: number, b: number) => `${a}-${b}`;
  const highlighted = highlightEdge ? edgeToKey(highlightEdge[0], highlightEdge[1]) : null;

  return (
    <figure className="mb-2">
      <svg
        viewBox={`0 0 ${startX * 2 + numCourses * (nodeWidth + gap) - gap} 112`}
        className="w-full max-w-md h-auto text-foreground"
        aria-label="Dependency graph: arrows point from prerequisite to course"
      >
        {/* Edges (arrows): prereq → course */}
        <defs>
          <marker
            id="arrow-normal"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" className="text-muted-foreground" />
          </marker>
          <marker
            id="arrow-cycle"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="hsl(var(--destructive))" />
          </marker>
        </defs>
        {prerequisites.map(([course, prereq]) => {
          const from = nodePos(prereq);
          const to = nodePos(course);
          const isCycleEdge = highlighted === edgeToKey(prereq, course);
          const midX = (from.x + nodeWidth + to.x) / 2;
          const isBackEdge = prereq > course;
          const path = isBackEdge
            ? `M ${from.x + nodeWidth} ${from.y} Q ${midX + 50} 16 ${to.x} ${to.y}`
            : `M ${from.x + nodeWidth} ${from.y} L ${to.x} ${to.y}`;
          return (
            <path
              key={edgeToKey(prereq, course)}
              d={path}
              fill="none"
              stroke={isCycleEdge ? "hsl(var(--destructive))" : "currentColor"}
              strokeWidth={isCycleEdge ? 2.5 : 1.5}
              strokeDasharray={isCycleEdge ? "4 2" : undefined}
              className={isCycleEdge ? "" : "text-muted-foreground"}
              markerEnd={isCycleEdge ? "url(#arrow-cycle)" : "url(#arrow-normal)"}
            />
          );
        })}
        {/* Nodes */}
        {Array.from({ length: numCourses }, (_, i) => {
          const pos = nodePos(i);
          return (
            <g key={i}>
              <rect
                x={pos.x}
                y={pos.y - nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx="6"
                className="fill-card stroke border-2 border-border"
              />
              <text
                x={pos.x + nodeWidth / 2}
                y={pos.y + 5}
                textAnchor="middle"
                className="fill-foreground text-xs font-medium"
              >
                {getLabel(i)}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="text-xs text-muted-foreground mt-1">
        Dependency graph: arrow from A to B means “B requires A”.{highlightEdge != null && " Red dashed arrow = back edge (creates cycle)."}
      </figcaption>
    </figure>
  );
}

function CourseTable({
  numCourses,
  prerequisites,
  courseNumbers,
}: {
  numCourses: number;
  prerequisites: number[][];
  courseNumbers: number[];
}) {
  const prereqByCourse = new Map<number, number[]>();
  for (const [course, prereq] of prerequisites) {
    if (!prereqByCourse.has(course)) prereqByCourse.set(course, []);
    prereqByCourse.get(course)!.push(prereq);
  }
  return (
    <table className="w-full text-sm border-collapse border border-border rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-muted/50">
          <th className="text-left font-semibold text-foreground p-3 border-b border-border">Course</th>
          <th className="text-left font-semibold text-foreground p-3 border-b border-border">Label</th>
          <th className="text-left font-semibold text-foreground p-3 border-b border-border">Prerequisites</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: numCourses }, (_, i) => (
          <tr key={i} className="border-b border-border last:border-b-0">
            <td className="p-3 font-mono text-foreground">{courseNumbers[i]}</td>
            <td className="p-3 text-foreground">{getLabel(i)}</td>
            <td className="p-3 text-muted-foreground">
              {prereqByCourse.get(i)?.map((p) => getLabel(p)).join(", ") || "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CourseScheduleDemo({ autoRun = false, hideControls = false }: { autoRun?: boolean; hideControls?: boolean } = {}) {
  const [resultPassing, setResultPassing] = useState<{ canFinish: boolean; order: number[] } | null>(null);
  const [resultFailing, setResultFailing] = useState<{ canFinish: boolean; order: number[] } | null>(null);

  const runPassing = () => {
    const order = { taken: [] as number[] };
    const finished = canFinish(PASSING_NUM_COURSES, PASSING_PREREQUISITES, order);
    setResultPassing({ canFinish: finished, order: order.taken });
  };

  const runFailing = () => {
    const order = { taken: [] as number[] };
    const finished = canFinish(FAILING_NUM_COURSES, FAILING_PREREQUISITES, order);
    setResultFailing({ canFinish: finished, order: order.taken });
  };

  useEffect(() => {
    if (autoRun) { runPassing(); runFailing(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex-1 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground">Course Schedule (Kahn’s algorithm)</span>
      </div>

      {/* Passing case: English 101 → 102 → 103 */}
      <section>
        <h4 className="text-sm font-semibold text-foreground mb-2">Passing case (no cycle)</h4>
        <p className="text-sm text-muted-foreground mb-3">
          English 101 has no prereq; 102 requires 101; 103 requires 102. Valid order: English 101 → 102 → 103.
        </p>
        <DependencyGraph
          numCourses={PASSING_NUM_COURSES}
          prerequisites={PASSING_PREREQUISITES}
          courseNumbers={COURSE_NUMBERS}
        />
        <div className="mb-3">
          <CourseTable
            numCourses={PASSING_NUM_COURSES}
            prerequisites={PASSING_PREREQUISITES}
            courseNumbers={COURSE_NUMBERS}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!hideControls && (
          <button
            type="button"
            onClick={runPassing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          )}
          {resultPassing && (
            <div className="text-sm">
              Can finish:{" "}
              <strong className={resultPassing.canFinish ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                {resultPassing.canFinish ? "Yes" : "No"}
              </strong>
              {resultPassing.order.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  Order: {resultPassing.order.map((i) => getLabel(i)).join(" → ")}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Failing case: cycle 101 → 102 → 103 → 101 */}
      <section>
        <h4 className="text-sm font-semibold text-foreground mb-2">Failing case (cycle)</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Same courses, but English 101 now requires 103. That creates a cycle (101 → 102 → 103 → 101), so you cannot finish all.
        </p>
        <DependencyGraph
          numCourses={FAILING_NUM_COURSES}
          prerequisites={FAILING_PREREQUISITES}
          courseNumbers={COURSE_NUMBERS}
          highlightEdge={[2, 0]}
        />
        <p className="text-xs text-muted-foreground mb-3">
          The <strong className="text-destructive">red dashed arrow</strong> (103 → 101) is the back edge: 101 cannot be taken until 103 is done, but 103 requires 102 and 102 requires 101, so no course can be taken first. That cycle is why Kahn’s algorithm leaves nodes in the queue and returns false.
        </p>
        <div className="mb-3">
          <CourseTable
            numCourses={FAILING_NUM_COURSES}
            prerequisites={FAILING_PREREQUISITES}
            courseNumbers={COURSE_NUMBERS}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!hideControls && (
          <button
            type="button"
            onClick={runFailing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          )}
          {resultFailing && (
            <div className="text-sm">
              Can finish:{" "}
              <strong className={resultFailing.canFinish ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                {resultFailing.canFinish ? "Yes" : "No"}
              </strong>
              {resultFailing.order.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  Order: {resultFailing.order.map((i) => getLabel(i)).join(" → ")}
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
