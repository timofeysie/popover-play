import { describe, it, expect } from "vitest";
import { kthSmallest, arrayToTree } from "./kthSmallest";

describe("kthSmallest", () => {
  describe("problem examples", () => {
    it("Example 1: root = [3,1,4,null,2], k = 1 returns 1", () => {
      const root = arrayToTree([3, 1, 4, null, 2]);
      expect(kthSmallest(root, 1)).toBe(1);
    });

    it("Example 2: root = [5,3,6,2,4,null,null,1], k = 3 returns 3", () => {
      const root = arrayToTree([5, 3, 6, 2, 4, null, null, 1]);
      expect(kthSmallest(root, 3)).toBe(3);
    });
  });

  describe("arrayToTree + kthSmallest", () => {
    it("returns kth smallest for k = 1..n on a balanced tree", () => {
      const root = arrayToTree([5, 3, 7, 2, 4, 6, 8, 1, null, null, null, null, null, null, 9]);
      const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      expected.forEach((val, i) => {
        expect(kthSmallest(root, i + 1)).toBe(val);
      });
    });

    it("returns the only value for a single-node tree", () => {
      const root = arrayToTree([42]);
      expect(kthSmallest(root, 1)).toBe(42);
    });

    it("handles left-skewed tree", () => {
      const root = arrayToTree([3, 2, null, 1]);
      expect(kthSmallest(root, 1)).toBe(1);
      expect(kthSmallest(root, 3)).toBe(3);
    });
  });
});
