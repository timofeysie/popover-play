import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { NumberOfIslandsDemo } from "@/features/depthFirstSearch/NumberOfIslandsDemo";
import { CourseScheduleDemo } from "@/features/breadthFirstSearch";
import { FishStackDemo } from "@/features/fishStack/FishStackDemo";
import { KthSmallestBstDemo } from "@/features/kthSmallestBst/KthSmallestBstDemo";
import { TwoSumDemo } from "@/features/twoSum/TwoSumDemo";
import { DonchianChannelDemo } from "@/features/slidingWindowMaximum/DonchianChannelDemo";

const DEMOS: { title: string; path: string; node: ReactNode }[] = [
  {
    title: "Depth-First Search",
    path: "/dfs",
    node: <NumberOfIslandsDemo autoPlay loop hideControls />,
  },
  {
    title: "Breadth-First Search",
    path: "/bfs",
    node: <CourseScheduleDemo autoRun hideControls />,
  },
  {
    title: "The Fish Stack Problem",
    path: "/fish-stack",
    node: <FishStackDemo autoPlay loop hideControls />,
  },
  {
    title: "Kth Smallest Element in a BST",
    path: "/kth-smallest-bst",
    node: <KthSmallestBstDemo autoPlay loop hideControls />,
  },
  {
    title: "Two Sum",
    path: "/two-sum",
    node: <TwoSumDemo autoPlay loop hideControls />,
  },
  {
    title: "Sliding Window Maximum",
    path: "/sliding-window-maximum",
    node: <DonchianChannelDemo autoPlay loop hideControls />,
  },
];

export default function Dashboard() {
  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Algorithm Demos</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Live algorithm visualizations — click any card to explore interactively.
        </p>
      </div>
      <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
        {DEMOS.map(({ title, path, node }) => (
          <div key={path} className="break-inside-avoid mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">{title}</span>
              <Link
                to={path}
                className="text-xs text-primary hover:underline font-medium shrink-0 ml-4"
              >
                Open →
              </Link>
            </div>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}
