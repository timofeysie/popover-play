export interface StationOption {
  station: string;
  sectors: string[];
}

export const STATIONS: StationOption[] = [
  {
    station: "Aegis Station",
    sectors: ["Docking Ring", "Cargo Bay", "Reactor Core"],
  },
  {
    station: "Kepler Outpost",
    sectors: ["Habitat Ring", "Solar Array", "Research Wing"],
  },
  {
    station: "Meridian Relay",
    sectors: ["Comms Array", "Fuel Depot"],
  },
  {
    station: "Void's Edge Platform",
    sectors: ["Quarantine Bay", "Salvage Yard", "Observation Deck"],
  },
];

export function sectorsForStation(station: string | undefined): string[] {
  return STATIONS.find((option) => option.station === station)?.sectors ?? [];
}
