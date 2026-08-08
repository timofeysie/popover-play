import { describe, it, expect } from "vitest";
import {
  STATIONS,
  sectorsForStation,
  destinationFormSchema,
} from "@/features/missionControlCargoManifest";

describe("sectorsForStation", () => {
  it("returns the sectors for a known station", () => {
    expect(sectorsForStation("Aegis Station")).toEqual(STATIONS[0].sectors);
  });

  it("returns an empty array for an unknown or undefined station", () => {
    expect(sectorsForStation("Nonexistent Station")).toEqual([]);
    expect(sectorsForStation(undefined)).toEqual([]);
  });
});

describe("destinationFormSchema", () => {
  const validBase = { station: "Aegis Station", sector: "Docking Ring" };

  it("requires a station and sector", () => {
    const result = destinationFormSchema(false).safeParse({ station: "", sector: "" });

    expect(result.success).toBe(false);
  });

  it("passes without a clearance code when there's no hazardous cargo", () => {
    const result = destinationFormSchema(false).safeParse(validBase);

    expect(result.success).toBe(true);
  });

  it("fails without a clearance code when there is hazardous cargo", () => {
    const result = destinationFormSchema(true).safeParse(validBase);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["clearanceCode"]);
    }
  });

  it("fails when the clearance code is only whitespace", () => {
    const result = destinationFormSchema(true).safeParse({ ...validBase, clearanceCode: "   " });

    expect(result.success).toBe(false);
  });

  it("passes once a clearance code is present alongside hazardous cargo", () => {
    const result = destinationFormSchema(true).safeParse({
      ...validBase,
      clearanceCode: "HAZMAT-7734",
    });

    expect(result.success).toBe(true);
  });
});
