export type ClearanceLevel = "public" | "hazmat";

export interface CargoItem {
  id: number;
  title: string;
  category: string;
  unitPriceUsd: number;
  thumbnailUrl: string;
  stock: number;
  clearanceLevel: ClearanceLevel;
}

export interface ManifestLine {
  item: CargoItem;
  quantity: number;
}

export interface Destination {
  station: string;
  sector: string;
}

export interface Manifest {
  lines: ManifestLine[];
  destination: Destination | null;
  clearanceCode: string | null;
}
