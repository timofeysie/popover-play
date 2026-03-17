import { describe, it, expect } from "vitest";
import { runFishAlgorithm, DEMO_SIZES, DEMO_DIRECTIONS } from "@/features/fishStack/FishStackDemo";

describe("fish stack solution", () => {
  it("returns 2 for the problem doc example (A = [4, 3, 2, 1, 5], B = [0, 1, 0, 0, 0])", () => {
    const sizes = [4, 3, 2, 1, 5];
    const directions = [0, 1, 0, 0, 0];
    const result = runFishAlgorithm(sizes, directions, () => {});
    expect(result).toBe(2);
  });

  it("returns 3 for the 12-fish demo (DEMO_SIZES, DEMO_DIRECTIONS)", () => {
    const result = runFishAlgorithm(DEMO_SIZES, DEMO_DIRECTIONS, () => {});
    expect(result).toBe(3);
  });
});
