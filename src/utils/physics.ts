import type { ElementRelation } from "./fiveElements";

export interface Vector2 {
  x: number;
  y: number;
}

export interface FloatingBall {
  id: string;
  position: Vector2;
  velocity: Vector2;
}

export const distance = (a: Vector2, b: Vector2) => Math.hypot(a.x - b.x, a.y - b.y);

export const pairKey = (a: string, b: string) => [a, b].sort().join("__");

export const normalize = (from: Vector2, to: Vector2): Vector2 => {
  const value = Math.max(distance(from, to), 0.001);
  return {
    x: (to.x - from.x) / value,
    y: (to.y - from.y) / value,
  };
};

export const relationForce = (relation: ElementRelation, distanceValue: number) => {
  if (distanceValue > 74) return 0;
  if (relation === "attract") return 0.026;
  if (relation === "repel") return -0.038;
  return 0;
};

export const peerRelationForce = (relation: ElementRelation, distanceValue: number) => {
  if (distanceValue > 64) return 0;
  if (relation === "attract") return 0.018;
  if (relation === "repel") return -0.032;
  return 0;
};

export const capVelocity = (velocity: Vector2, maxSpeed: number): Vector2 => {
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed <= maxSpeed || speed === 0) return velocity;

  return {
    x: (velocity.x / speed) * maxSpeed,
    y: (velocity.y / speed) * maxSpeed,
  };
};

export const softBoundaryForce = (
  position: Vector2,
  width: number,
  height: number,
  margin = 34,
): Vector2 => {
  const force = { x: 0, y: 0 };
  const strength = 0.0028;

  if (position.x < margin) force.x += (margin - position.x) * strength;
  if (position.x > width - margin) force.x -= (position.x - (width - margin)) * strength;
  if (position.y < margin) force.y += (margin - position.y) * strength;
  if (position.y > height - margin) force.y -= (position.y - (height - margin)) * strength;

  return force;
};

export const clampToBounds = (point: Vector2, width: number, height: number): Vector2 => ({
  x: Math.min(Math.max(point.x, 24), width - 24),
  y: Math.min(Math.max(point.y, 24), height - 24),
});
