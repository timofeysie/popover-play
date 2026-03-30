/**
 * Single source of truth for the Kth Smallest BST demo.
 * Level-order (LeetCode-style) serialization: index i's left = 2i+1, right = 2i+2.
 */
export const INPUT_ARRAY: (number | null)[] = [
  5,
  3,
  7,
  2,
  4,
  6,
  8,
  1,
  null,
  null,
  null,
  null,
  null,
  null,
  9,
];

export function formatInputArray(arr: (number | null)[]): string {
  return "[" + arr.map((v) => (v === null ? "null" : String(v))).join(",") + "]";
}
