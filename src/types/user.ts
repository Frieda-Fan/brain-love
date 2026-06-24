import type { BrainTypeId } from "./brain";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
}

export interface MockUser {
  id: string;
  name: string;
  brainType: BrainTypeId;
  color: string;
  location: GeoLocation;
  matchScore: number;
}
