import { describe, it, expect, beforeEach } from "vitest";
import {
  useMccmStore,
  selectHasHazardousCargo,
  selectSubtotalUsd,
  type CargoItem,
} from "@/features/missionControlCargoManifest";

const fuel: CargoItem = {
  id: 1,
  title: "Rocket Fuel",
  category: "automotive",
  unitPriceUsd: 42,
  thumbnailUrl: "fuel.png",
  stock: 5,
  clearanceLevel: "hazmat",
};

const snack: CargoItem = {
  id: 2,
  title: "Space Snack",
  category: "groceries",
  unitPriceUsd: 3,
  thumbnailUrl: "snack.png",
  stock: 50,
  clearanceLevel: "public",
};

beforeEach(() => {
  useMccmStore.getState().reset();
});

describe("useMccmStore", () => {
  it("adds a new cargo item as a manifest line with default quantity 1", () => {
    useMccmStore.getState().addCargoItem(snack);

    expect(useMccmStore.getState().lines).toEqual([{ item: snack, quantity: 1 }]);
  });

  it("increments quantity when the same item is added again", () => {
    useMccmStore.getState().addCargoItem(snack);
    useMccmStore.getState().addCargoItem(snack, 2);

    expect(useMccmStore.getState().lines).toEqual([{ item: snack, quantity: 3 }]);
  });

  it("removes a manifest line by item id", () => {
    useMccmStore.getState().addCargoItem(fuel);
    useMccmStore.getState().addCargoItem(snack);

    useMccmStore.getState().removeCargoItem(fuel.id);

    expect(useMccmStore.getState().lines).toEqual([{ item: snack, quantity: 1 }]);
  });

  it("sets destination and clearance code", () => {
    useMccmStore.getState().setDestination({ station: "Orbital Dock 7", sector: "Kuiper Belt" });
    useMccmStore.getState().setClearanceCode("XJ-42");

    expect(useMccmStore.getState().destination).toEqual({
      station: "Orbital Dock 7",
      sector: "Kuiper Belt",
    });
    expect(useMccmStore.getState().clearanceCode).toBe("XJ-42");
  });

  it("reset clears the manifest back to initial state", () => {
    useMccmStore.getState().addCargoItem(fuel);
    useMccmStore.getState().setDestination({ station: "Orbital Dock 7", sector: "Kuiper Belt" });
    useMccmStore.getState().setClearanceCode("XJ-42");

    useMccmStore.getState().reset();

    expect(useMccmStore.getState()).toMatchObject({
      lines: [],
      destination: null,
      clearanceCode: null,
    });
  });
});

describe("selectHasHazardousCargo", () => {
  it("is false for an empty or all-public manifest", () => {
    expect(selectHasHazardousCargo(useMccmStore.getState())).toBe(false);

    useMccmStore.getState().addCargoItem(snack);
    expect(selectHasHazardousCargo(useMccmStore.getState())).toBe(false);
  });

  it("flips true as soon as any hazmat item is on the manifest", () => {
    useMccmStore.getState().addCargoItem(snack);
    useMccmStore.getState().addCargoItem(fuel);

    expect(selectHasHazardousCargo(useMccmStore.getState())).toBe(true);
  });

  it("flips back false once the hazmat item is removed", () => {
    useMccmStore.getState().addCargoItem(fuel);
    useMccmStore.getState().removeCargoItem(fuel.id);

    expect(selectHasHazardousCargo(useMccmStore.getState())).toBe(false);
  });
});

describe("selectSubtotalUsd", () => {
  it("sums unit price times quantity across all lines", () => {
    useMccmStore.getState().addCargoItem(fuel, 2);
    useMccmStore.getState().addCargoItem(snack, 5);

    expect(selectSubtotalUsd(useMccmStore.getState())).toBe(42 * 2 + 3 * 5);
  });

  it("is 0 for an empty manifest", () => {
    expect(selectSubtotalUsd(useMccmStore.getState())).toBe(0);
  });
});
