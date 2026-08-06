import { create } from "zustand";
import type { CargoItem, Destination, ManifestLine } from "../types";

export interface MccmState {
  lines: ManifestLine[];
  destination: Destination | null;
  clearanceCode: string | null;
}

export interface MccmActions {
  addCargoItem: (item: CargoItem, quantity?: number) => void;
  removeCargoItem: (itemId: number) => void;
  setDestination: (destination: Destination) => void;
  setClearanceCode: (code: string | null) => void;
  reset: () => void;
}

export type MccmStore = MccmState & MccmActions;

const initialState: MccmState = {
  lines: [],
  destination: null,
  clearanceCode: null,
};

export const useMccmStore = create<MccmStore>()((set) => ({
  ...initialState,

  addCargoItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.lines.find((line) => line.item.id === item.id);
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.item.id === item.id
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          ),
        };
      }
      return { lines: [...state.lines, { item, quantity }] };
    }),

  removeCargoItem: (itemId) =>
    set((state) => ({
      lines: state.lines.filter((line) => line.item.id !== itemId),
    })),

  setDestination: (destination) => set({ destination }),

  setClearanceCode: (code) => set({ clearanceCode: code }),

  reset: () => set(initialState),
}));

export function selectHasHazardousCargo(state: MccmState): boolean {
  return state.lines.some((line) => line.item.clearanceLevel === "hazmat");
}

export function selectSubtotalUsd(state: MccmState): number {
  return state.lines.reduce((sum, line) => sum + line.item.unitPriceUsd * line.quantity, 0);
}
