import type { BrainType } from "../types/brain";

export const brainTypes: BrainType[] = [
  {
    id: "metal",
    cnName: "金",
    enName: "Metal",
    element: "金",
    color: "#f6c95f",
    glow: "rgba(246, 201, 95, 0.55)",
    summary: "清晰、果断，像一束稳定聚焦的频率。",
  },
  {
    id: "wood",
    cnName: "木",
    enName: "Wood",
    element: "木",
    color: "#55dc8d",
    glow: "rgba(85, 220, 141, 0.55)",
    summary: "生长、共情，容易和新的关系形成连接。",
  },
  {
    id: "water",
    cnName: "水",
    enName: "Water",
    element: "水",
    color: "#65b7ff",
    glow: "rgba(101, 183, 255, 0.6)",
    summary: "流动、敏感，擅长感知微妙的情绪变化。",
  },
  {
    id: "fire",
    cnName: "火",
    enName: "Fire",
    element: "火",
    color: "#ff626d",
    glow: "rgba(255, 98, 109, 0.56)",
    summary: "热烈、直接，靠近时会让连接迅速升温。",
  },
  {
    id: "earth",
    cnName: "土",
    enName: "Earth",
    element: "土",
    color: "#d6a84c",
    glow: "rgba(214, 168, 76, 0.56)",
    summary: "稳定、包容，给社交关系一种安定的重力。",
  },
];

export const getBrainType = (id: BrainType["id"]) =>
  brainTypes.find((type) => type.id === id) ?? brainTypes[0];
