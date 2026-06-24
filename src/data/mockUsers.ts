import { brainTypes, getBrainType } from "./brainTypes";
import type { MockUser } from "../types/user";
import type { BrainTypeId } from "../types/brain";
import { randomGeo, seededRandom } from "../utils/randomGeo";

const names = [
  "Nova",
  "Echo",
  "Mira",
  "Orion",
  "Luna",
  "Kai",
  "Iris",
  "Sol",
  "Aster",
  "Niko",
  "Vera",
  "Rune",
  "Cyan",
  "Lyra",
  "Noel",
  "Sora",
  "Juno",
  "Elio",
  "Rhea",
  "Yuki",
  "Ari",
  "Nami",
  "Tao",
  "Zeno",
  "Lin",
  "Halo",
  "Kira",
  "Eden",
  "Mo",
  "Nox",
];

export const mockUsers: MockUser[] = Array.from({ length: 46 }, (_, index) => {
  const brainType = brainTypes[index % brainTypes.length].id as BrainTypeId;
  const profile = getBrainType(brainType);
  return {
    id: `bb-${String(index + 1).padStart(3, "0")}`,
    name: names[index % names.length],
    brainType,
    color: profile.color,
    location: randomGeo(index + 7),
    matchScore: Math.round(62 + seededRandom(index + 101) * 36),
  };
});
