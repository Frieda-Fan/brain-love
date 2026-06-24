import { mockUsers } from "../../../data/mockUsers";
import type { BrainTypeId } from "../../../types/brain";
import type { MockUser } from "../../../types/user";
import { getElementRelation } from "../../../utils/fiveElements";
import {
  capVelocity,
  clampToBounds,
  distance,
  normalize,
  pairKey,
  peerRelationForce,
  relationForce,
  softBoundaryForce,
  type FloatingBall,
  type Vector2,
} from "../../../utils/physics";

export interface ForceLine {
  id: string;
  from: Vector2;
  to: Vector2;
  relation: ReturnType<typeof getElementRelation>;
  isPeer: boolean;
  isBonded: boolean;
}

export interface CommunitySnapshot {
  balls: FloatingBall[];
  mousePosition: Vector2;
  userPosition: Vector2;
  trails: Record<string, Vector2[]>;
  userTrail: Vector2[];
  bondedPairs: Set<string>;
  forceLines: ForceLine[];
}

interface StepOptions {
  width: number;
  height: number;
  time: number;
  selectedType: BrainTypeId;
  onCollide: (user: MockUser) => void;
}

const BALL_RADIUS = 19;
const COLLISION_DISTANCE = BALL_RADIUS * 2;
const BOND_DISTANCE = BALL_RADIUS * 2;
const BOND_BREAK_DISTANCE = BALL_RADIUS * 3.2;
const BOND_BREAK_SPEED = 1.15;
const TRAIL_LENGTH = 16;
const MOTION_MULTIPLIER = 2.5;
const SELF_PROPULSION = 0.018 * MOTION_MULTIPLIER;
const USER_SPEED_MULTIPLIER = 1.05;

export const communityUsers = mockUsers.slice(0, 18);

class BrainBallEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;

  constructor(user: MockUser, index: number) {
    this.id = user.id;
    this.position = {
      x: 90 + ((index * 83) % 760),
      y: 90 + ((index * 137) % 420),
    };
    this.velocity = {
      x: Math.sin(index + 1) * 0.35 * MOTION_MULTIPLIER,
      y: Math.cos(index + 2) * 0.35 * MOTION_MULTIPLIER,
    };
  }

  toFloatingBall(): FloatingBall {
    return {
      id: this.id,
      position: { ...this.position },
      velocity: { ...this.velocity },
    };
  }
}

export class CommunitySimulation {
  private balls: FloatingBall[];
  private bondedPairs = new Set<string>();
  private collidedId: string | null = null;
  private mousePosition: Vector2 = { x: 260, y: 240 };
  private mouseVelocity: Vector2 = { x: 0, y: 0 };
  private trails = new Map<string, Vector2[]>();
  private userPosition: Vector2 = { x: 260, y: 240 };
  private userTrail: Vector2[] = [];
  private userVelocity: Vector2 = { x: 0, y: 0 };
  private userById = new Map(communityUsers.map((user) => [user.id, user]));

  constructor() {
    this.balls = communityUsers.map((user, index) =>
      new BrainBallEntity(user, index).toFloatingBall(),
    );
  }

  setMousePosition(position: Vector2) {
    this.mouseVelocity = {
      x: position.x - this.mousePosition.x,
      y: position.y - this.mousePosition.y,
    };
    this.mousePosition = position;
  }

  step({ width, height, time, selectedType, onCollide }: StepOptions): CommunitySnapshot {
    const nextUserForce = {
      x: (this.mousePosition.x - this.userPosition.x) * 0.068 + Math.sin(time * 0.001) * 0.012,
      y: (this.mousePosition.y - this.userPosition.y) * 0.068 + Math.cos(time * 0.0012) * 0.012,
    };
    const accelerations = new Map<string, Vector2>();
    const nextBonds = new Set(this.bondedPairs);

    this.balls.forEach((ball) => {
      accelerations.set(ball.id, softBoundaryForce(ball.position, width, height));
    });

    this.applyPeerForces(accelerations, nextBonds);

    let nextBalls = this.balls.map((ball) =>
      this.integrateBall(ball, accelerations, nextBonds, selectedType, nextUserForce, width, height, time, onCollide),
    );
    nextBalls = this.resolvePeerCollisions(nextBalls, nextBonds);
    nextBalls = this.resolveUserCollisions(nextBalls, selectedType, width, height);

    this.trails = this.recordTrails(nextBalls);
    this.bondedPairs = nextBonds;
    this.balls = nextBalls;

    const boundary = softBoundaryForce(this.userPosition, width, height, 44);
    nextUserForce.x += boundary.x * 1.4;
    nextUserForce.y += boundary.y * 1.4;
    this.userVelocity = capVelocity(
      {
        x: (this.userVelocity.x + nextUserForce.x) * 0.78 * USER_SPEED_MULTIPLIER,
        y: (this.userVelocity.y + nextUserForce.y) * 0.78 * USER_SPEED_MULTIPLIER,
      },
      12 * USER_SPEED_MULTIPLIER,
    );
    this.userPosition = clampToBounds(
      {
        x: this.userPosition.x + this.userVelocity.x,
        y: this.userPosition.y + this.userVelocity.y,
      },
      width,
      height,
    );
    this.userTrail = [this.userPosition, ...this.userTrail].slice(0, TRAIL_LENGTH);

    return this.snapshot(selectedType);
  }

  snapshot(selectedType: BrainTypeId): CommunitySnapshot {
    return {
      balls: this.balls,
      mousePosition: this.mousePosition,
      userPosition: this.userPosition,
      trails: Object.fromEntries(this.trails),
      userTrail: this.userTrail,
      bondedPairs: new Set(this.bondedPairs),
      forceLines: this.getForceLines(selectedType),
    };
  }

  private applyPeerForces(accelerations: Map<string, Vector2>, nextBonds: Set<string>) {
    this.balls.forEach((source, sourceIndex) => {
      const sourceUser = this.userById.get(source.id);
      if (!sourceUser) return;

      this.balls.slice(sourceIndex + 1).forEach((target) => {
        const targetUser = this.userById.get(target.id);
        if (!targetUser) return;

        const key = pairKey(source.id, target.id);
        const relation = getElementRelation(sourceUser.brainType, targetUser.brainType);
        const dist = Math.max(distance(source.position, target.position), 1);
        const direction = normalize(source.position, target.position);
        const sourceAcceleration = accelerations.get(source.id);
        const targetAcceleration = accelerations.get(target.id);
        if (!sourceAcceleration || !targetAcceleration) return;

        const relativeVelocity = {
          x: target.velocity.x - source.velocity.x,
          y: target.velocity.y - source.velocity.y,
        };
        const closingSpeed = relativeVelocity.x * direction.x + relativeVelocity.y * direction.y;
        const isBonded = nextBonds.has(key);
        const force =
          relation === "neutral" ? 0 : peerRelationForce(relation, dist) * (isBonded ? 2.2 : 1);

        sourceAcceleration.x += direction.x * force;
        sourceAcceleration.y += direction.y * force;
        targetAcceleration.x -= direction.x * force;
        targetAcceleration.y -= direction.y * force;

        if (relation === "attract" && dist < COLLISION_DISTANCE) nextBonds.add(key);

        if (isBonded) {
          const spring = (dist - BOND_DISTANCE) * 0.024;
          sourceAcceleration.x += direction.x * spring;
          sourceAcceleration.y += direction.y * spring;
          targetAcceleration.x -= direction.x * spring;
          targetAcceleration.y -= direction.y * spring;

          if (dist > BOND_BREAK_DISTANCE || Math.abs(closingSpeed) > BOND_BREAK_SPEED) {
            nextBonds.delete(key);
          }
        }

        if (!isBonded && dist < COLLISION_DISTANCE) {
          const overlap = COLLISION_DISTANCE - dist;
          const impulse =
            overlap * (relation === "repel" ? 0.024 : 0.018) +
            Math.max(0, -closingSpeed) * 0.16;
          sourceAcceleration.x -= direction.x * impulse;
          sourceAcceleration.y -= direction.y * impulse;
          targetAcceleration.x += direction.x * impulse;
          targetAcceleration.y += direction.y * impulse;
          if (relation !== "attract") nextBonds.delete(key);
        }
      });
    });
  }

  private integrateBall(
    ball: FloatingBall,
    accelerations: Map<string, Vector2>,
    nextBonds: Set<string>,
    selectedType: BrainTypeId,
    nextUserForce: Vector2,
    width: number,
    height: number,
    time: number,
    onCollide: (user: MockUser) => void,
  ): FloatingBall {
    const user = this.userById.get(ball.id);
    if (!user) return ball;

    const dist = Math.max(distance(this.userPosition, ball.position), 1);
    const relation = getElementRelation(selectedType, user.brainType);
    const direction = normalize(ball.position, this.userPosition);
    const userForce = relationForce(relation, dist);
    const peerForce = accelerations.get(ball.id) ?? { x: 0, y: 0 };
    const userSpeed = Math.hypot(this.mouseVelocity.x, this.mouseVelocity.y);

    if (dist < 180) {
      const feedback = relation === "repel" ? -0.42 : relation === "attract" ? 0.32 : 0.08;
      nextUserForce.x -= direction.x * userForce * feedback;
      nextUserForce.y -= direction.y * userForce * feedback;
    }

    if (dist < 64 && userSpeed > 8) {
      this.balls.forEach((other) => nextBonds.delete(pairKey(ball.id, other.id)));
      peerForce.x -= direction.x * Math.min(userSpeed * 0.018, 0.32);
      peerForce.y -= direction.y * Math.min(userSpeed * 0.018, 0.32);
    }

    if (dist < COLLISION_DISTANCE + 12 && relation === "repel") {
      const impulse = (COLLISION_DISTANCE + 12 - dist) * 0.02;
      peerForce.x -= direction.x * impulse;
      peerForce.y -= direction.y * impulse;
    }

    if (dist < COLLISION_DISTANCE && relation !== "attract") {
      const overlap = COLLISION_DISTANCE - dist;
      const userRelativeSpeed = this.userVelocity.x * direction.x + this.userVelocity.y * direction.y;
      const impulse =
        overlap * (relation === "repel" ? 0.05 : 0.034) + Math.max(0, userRelativeSpeed) * 0.08;
      peerForce.x -= direction.x * impulse;
      peerForce.y -= direction.y * impulse;
    }

    const ambientDrift = {
      x: Math.sin(time * 0.00025 + ball.position.y * 0.01) * 0.0015 * MOTION_MULTIPLIER,
      y: Math.cos(time * 0.00022 + ball.position.x * 0.01) * 0.0015 * MOTION_MULTIPLIER,
    };
    const selfDrive = {
      x: Math.sin(time * 0.0011 + ball.position.y * 0.013 + user.id.length) * SELF_PROPULSION,
      y: Math.cos(time * 0.0013 + ball.position.x * 0.011 + user.name.length) * SELF_PROPULSION,
    };

    let velocity = capVelocity(
      {
        x:
          (ball.velocity.x +
            direction.x * userForce +
            peerForce.x +
            ambientDrift.x +
            selfDrive.x) *
          0.992,
        y:
          (ball.velocity.y +
            direction.y * userForce +
            peerForce.y +
            ambientDrift.y +
            selfDrive.y) *
          0.992,
      },
      2.05 * MOTION_MULTIPLIER,
    );
    const position = clampToBounds(
      {
        x: ball.position.x + velocity.x,
        y: ball.position.y + velocity.y,
      },
      width,
      height,
    );

    if (position.x < 24 || position.x > width - 24) velocity = { ...velocity, x: velocity.x * -0.42 };
    if (position.y < 24 || position.y > height - 24) velocity = { ...velocity, y: velocity.y * -0.42 };

    if (dist < 48 && this.collidedId !== user.id) {
      this.collidedId = user.id;
      onCollide(user);
    }
    if (dist > 78 && this.collidedId === user.id) this.collidedId = null;

    return { ...ball, position, velocity };
  }

  private resolvePeerCollisions(balls: FloatingBall[], nextBonds: Set<string>) {
    let nextBalls = balls;
    for (let pass = 0; pass < 3; pass += 1) {
      nextBalls = nextBalls.map((ball) => ({
        ...ball,
        position: { ...ball.position },
        velocity: { ...ball.velocity },
      }));

      nextBalls.forEach((source, sourceIndex) => {
        nextBalls.slice(sourceIndex + 1).forEach((target) => {
          const sourceUser = this.userById.get(source.id);
          const targetUser = this.userById.get(target.id);
          if (!sourceUser || !targetUser) return;

          const key = pairKey(source.id, target.id);
          const relation = getElementRelation(sourceUser.brainType, targetUser.brainType);
          const dist = Math.max(distance(source.position, target.position), 1);
          const direction = normalize(source.position, target.position);

          if (nextBonds.has(key)) {
            const delta = dist - BOND_DISTANCE;
            source.position.x += direction.x * delta * 0.5;
            source.position.y += direction.y * delta * 0.5;
            target.position.x -= direction.x * delta * 0.5;
            target.position.y -= direction.y * delta * 0.5;
            return;
          }

          if (dist >= COLLISION_DISTANCE) return;

          const overlap = COLLISION_DISTANCE - dist;
          source.position.x -= direction.x * overlap * 0.5;
          source.position.y -= direction.y * overlap * 0.5;
          target.position.x += direction.x * overlap * 0.5;
          target.position.y += direction.y * overlap * 0.5;

          const relativeVelocity = {
            x: target.velocity.x - source.velocity.x,
            y: target.velocity.y - source.velocity.y,
          };
          const normalSpeed = relativeVelocity.x * direction.x + relativeVelocity.y * direction.y;
          if (normalSpeed < 0) {
            const bounce = relation === "repel" ? 0.82 : 0.58;
            const impulse = (-normalSpeed * bounce) / 2;
            source.velocity.x -= direction.x * impulse;
            source.velocity.y -= direction.y * impulse;
            target.velocity.x += direction.x * impulse;
            target.velocity.y += direction.y * impulse;
          }
        });
      });
    }
    return nextBalls;
  }

  private resolveUserCollisions(balls: FloatingBall[], selectedType: BrainTypeId, width: number, height: number) {
    return balls.map((ball) => {
      const user = this.userById.get(ball.id);
      if (!user) {
        return {
          ...ball,
          position: clampToBounds(ball.position, width, height),
          velocity: capVelocity(ball.velocity, 1.85 * MOTION_MULTIPLIER),
        };
      }

      const relation = getElementRelation(selectedType, user.brainType);
      const dist = Math.max(distance(this.userPosition, ball.position), 1);
      const direction = normalize(ball.position, this.userPosition);
      let nextPosition = ball.position;
      let nextVelocity = ball.velocity;

      if (dist < COLLISION_DISTANCE) {
        const overlap = COLLISION_DISTANCE - dist;

        if (relation === "attract") {
          const bondDelta = dist - BOND_DISTANCE;
          nextPosition = {
            x: ball.position.x + direction.x * bondDelta * 0.42,
            y: ball.position.y + direction.y * bondDelta * 0.42,
          };
          this.userPosition = {
            x: this.userPosition.x - direction.x * bondDelta * 0.18,
            y: this.userPosition.y - direction.y * bondDelta * 0.18,
          };
        } else {
          nextPosition = {
            x: ball.position.x - direction.x * overlap * 0.58,
            y: ball.position.y - direction.y * overlap * 0.58,
          };
          this.userPosition = {
            x: this.userPosition.x + direction.x * overlap * 0.42,
            y: this.userPosition.y + direction.y * overlap * 0.42,
          };
          const bounce = relation === "repel" ? 0.72 : 0.52;
          nextVelocity = {
            x: ball.velocity.x - direction.x * bounce,
            y: ball.velocity.y - direction.y * bounce,
          };
          this.userVelocity = {
            x: this.userVelocity.x + direction.x * bounce * 0.72,
            y: this.userVelocity.y + direction.y * bounce * 0.72,
          };
        }
      }

      return {
        ...ball,
        position: clampToBounds(nextPosition, width, height),
        velocity: capVelocity(nextVelocity, 1.85 * MOTION_MULTIPLIER),
      };
    });
  }

  private recordTrails(balls: FloatingBall[]) {
    const nextTrails = new Map(this.trails);
    balls.forEach((ball) => {
      const trail = nextTrails.get(ball.id) ?? [];
      nextTrails.set(ball.id, [ball.position, ...trail].slice(0, TRAIL_LENGTH));
    });
    return nextTrails;
  }

  private getForceLines(selectedType: BrainTypeId): ForceLine[] {
    const userLines = this.balls
      .map((ball) => {
        const user = this.userById.get(ball.id);
        if (!user) return null;

        const dist = distance(this.userPosition, ball.position);
        const relation = getElementRelation(selectedType, user.brainType);
        if (dist > 190 || relation === "neutral") return null;

        return {
          id: `user-${ball.id}`,
          from: this.userPosition,
          to: ball.position,
          relation,
          isPeer: false,
          isBonded: false,
        };
      })
      .filter(Boolean);

    const peerLines = this.balls.flatMap((source, sourceIndex) =>
      this.balls.slice(sourceIndex + 1).map((target) => {
        const sourceUser = this.userById.get(source.id);
        const targetUser = this.userById.get(target.id);
        if (!sourceUser || !targetUser) return null;

        const key = pairKey(source.id, target.id);
        const dist = distance(source.position, target.position);
        const relation = getElementRelation(sourceUser.brainType, targetUser.brainType);
        if (dist > 78 && !this.bondedPairs.has(key)) return null;
        if (relation === "neutral" && !this.bondedPairs.has(key)) return null;

        return {
          id: `peer-${key}`,
          from: source.position,
          to: target.position,
          relation,
          isPeer: true,
          isBonded: this.bondedPairs.has(key),
        };
      }),
    );

    return [...userLines, ...peerLines.filter(Boolean)].slice(0, 42) as ForceLine[];
  }
}
