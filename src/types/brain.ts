export type BrainTypeId = "metal" | "wood" | "water" | "fire" | "earth";

export interface BrainType {
  id: BrainTypeId;
  cnName: string;
  enName: string;
  element: string;
  color: string;
  glow: string;
  summary: string;
}

export interface SelectedBrainProfile {
  brainType: BrainTypeId;
  createdAt: string;
}
