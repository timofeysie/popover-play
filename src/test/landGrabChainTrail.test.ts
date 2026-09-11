import { describe, it, expect } from "vitest";
import {
  applyCaptureEvents,
  clearDeadChains,
  appendHeadHistory,
  chainPositions,
  type ChainMap,
} from "@/features/landGrab/chainTrail";

describe("applyCaptureEvents", () => {
  it("returns the same reference when there are no events", () => {
    const chains: ChainMap = { p1: ["p2"] };
    expect(applyCaptureEvents(chains, [])).toBe(chains);
  });

  it("prepends a captured victim to the front of the capturer's chain", () => {
    const chains: ChainMap = { p1: ["old"] };
    const next = applyCaptureEvents(chains, [{ capturerId: "p1", victimId: "p2" }]);
    expect(next).toEqual({ p1: ["p2", "old"], p2: [] });
  });

  it("folds the victim's own chain in behind them, and clears the victim's", () => {
    const chains: ChainMap = { p1: ["old-catch"], p2: ["ghost"] };
    const next = applyCaptureEvents(chains, [{ capturerId: "p1", victimId: "p2" }]);
    expect(next).toEqual({ p1: ["p2", "ghost", "old-catch"], p2: [] });
  });

  it("allows the same id to appear more than once across repeated captures", () => {
    let chains: ChainMap = {};
    chains = applyCaptureEvents(chains, [{ capturerId: "p1", victimId: "p2" }]);
    chains = applyCaptureEvents(chains, [{ capturerId: "p1", victimId: "p2" }]);
    expect(chains.p1).toEqual(["p2", "p2"]);
  });

  it("applies multiple events in order", () => {
    const next = applyCaptureEvents({}, [
      { capturerId: "p1", victimId: "p2" },
      { capturerId: "p3", victimId: "p1" },
    ]);
    // p3 captured p1 after p1 had already picked up p2 — p1's whole train follows.
    expect(next).toEqual({ p1: [], p2: [], p3: ["p1", "p2"] });
  });
});

describe("clearDeadChains", () => {
  it("empties a dead player's chain and leaves the living untouched", () => {
    const chains: ChainMap = { p1: ["p2"], p2: [] };
    const next = clearDeadChains(chains, new Set(["p2"]));
    expect(next).toEqual({ p1: [], p2: [] });
  });

  it("returns the same reference when nothing needs clearing", () => {
    const chains: ChainMap = { p1: [], p2: [] };
    expect(clearDeadChains(chains, new Set(["p1", "p2"]))).toBe(chains);
  });
});

describe("appendHeadHistory", () => {
  it("skips a repeated position (the player held still)", () => {
    const history = appendHeadHistory([{ row: 1, col: 1 }], { row: 1, col: 1 });
    expect(history).toEqual([{ row: 1, col: 1 }]);
  });

  it("appends a new position", () => {
    const history = appendHeadHistory([{ row: 1, col: 1 }], { row: 1, col: 2 });
    expect(history).toEqual([{ row: 1, col: 1 }, { row: 1, col: 2 }]);
  });

  it("trims to maxLen, keeping the most recent cells", () => {
    let history = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }];
    history = appendHeadHistory(history, { row: 0, col: 3 }, 2);
    expect(history).toEqual([{ row: 0, col: 2 }, { row: 0, col: 3 }]);
  });
});

describe("chainPositions", () => {
  it("places consecutive links immediately behind the head, no gaps", () => {
    const history = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }];
    expect(chainPositions(history, 3)).toEqual([
      { row: 0, col: 2 },
      { row: 0, col: 1 },
      { row: 0, col: 0 },
    ]);
  });

  it("bunches up at the oldest recorded cell when history is too short", () => {
    const history = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    expect(chainPositions(history, 3)).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 0 },
      { row: 0, col: 0 },
    ]);
  });

  it("returns nothing for an empty chain or empty history", () => {
    expect(chainPositions([{ row: 0, col: 0 }], 0)).toEqual([]);
    expect(chainPositions([], 3)).toEqual([]);
  });
});
