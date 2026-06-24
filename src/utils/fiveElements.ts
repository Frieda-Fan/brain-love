import type { BrainTypeId } from "../types/brain";

const generates: Record<BrainTypeId, BrainTypeId> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const controls: Record<BrainTypeId, BrainTypeId> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

export type ElementRelation = "self" | "attract" | "repel" | "neutral";

export const getElementRelation = (
  source: BrainTypeId,
  target: BrainTypeId,
): ElementRelation => {
  if (source === target) return "neutral";
  if (generates[source] === target || generates[target] === source) return "attract";
  if (controls[source] === target || controls[target] === source) return "repel";
  return "neutral";
};

export const relationLabel = (relation: ElementRelation) => {
  if (relation === "attract") return "相生引力";
  if (relation === "repel") return "相克斥力";
  if (relation === "self") return "同频共振";
  return "自由漂浮";
};
