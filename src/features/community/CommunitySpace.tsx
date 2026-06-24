import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { BrainType } from "../../types/brain";
import type { MockUser } from "../../types/user";
import { getElementRelation, relationLabel } from "../../utils/fiveElements";
import type { Vector2 } from "../../utils/physics";
import {
  communityUsers,
  CommunitySimulation,
  type CommunitySnapshot,
} from "./models/CommunitySimulation";

interface CommunitySpaceProps {
  selectedType: BrainType;
  onCollide: (user: MockUser) => void;
}

const TRAIL_LENGTH = 16;
const initialSnapshot = (selectedType: BrainType): CommunitySnapshot => {
  const simulation = new CommunitySimulation();
  return simulation.snapshot(selectedType.id);
};

export default function CommunitySpace({ selectedType, onCollide }: CommunitySpaceProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const simulationRef = useRef(new CommunitySimulation());
  const [snapshot, setSnapshot] = useState<CommunitySnapshot>(() => initialSnapshot(selectedType));
  const userById = new Map(communityUsers.map((user) => [user.id, user]));

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const bounds = stageRef.current?.getBoundingClientRect();
      const nextSnapshot = simulationRef.current.step({
        width: bounds?.width ?? 960,
        height: bounds?.height ?? 560,
        time: Date.now(),
        selectedType: selectedType.id,
        onCollide,
      });

      setSnapshot(nextSnapshot);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [onCollide, selectedType.id]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    simulationRef.current.setMousePosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  const renderTrail = (
    point: Vector2,
    index: number,
    color: string,
    key: string,
    className = "ball-trail",
  ) => (
    <span
      key={key}
      className={className}
      style={
        {
          left: point.x,
          top: point.y,
          "--trail-color": color,
          "--trail-alpha": 1 - index / TRAIL_LENGTH,
          "--trail-scale": 1 - index / (TRAIL_LENGTH * 1.15),
        } as CSSProperties
      }
    />
  );

  return (
    <section className="community-stage" ref={stageRef} onPointerMove={handlePointerMove}>
      <svg
        className="force-lines"
        viewBox={`0 0 ${stageRef.current?.clientWidth ?? 960} ${
          stageRef.current?.clientHeight ?? 560
        }`}
      >
        {snapshot.forceLines.map(({ id, from, to, relation, isPeer, isBonded }) => (
          <line
            key={id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className={`${relation}${isPeer ? " peer-line" : ""}${
              isBonded ? " bonded-line" : ""
            }`}
          />
        ))}
        <line
          x1={snapshot.mousePosition.x}
          y1={snapshot.mousePosition.y}
          x2={snapshot.userPosition.x}
          y2={snapshot.userPosition.y}
          className="cursor-tension-line"
        />
      </svg>

      <div
        className="mouse-force-point"
        style={
          {
            left: snapshot.mousePosition.x,
            top: snapshot.mousePosition.y,
          } as CSSProperties
        }
      />

      <div className="trail-layer">
        {snapshot.userTrail.map((point, index) =>
          renderTrail(
            point,
            index,
            selectedType.color,
            `user-trail-${index}`,
            "ball-trail user-trail",
          ),
        )}
        {snapshot.balls.flatMap((ball) => {
          const user = userById.get(ball.id);
          const trail = snapshot.trails[ball.id] ?? [];
          if (!user) return [];
          return trail.map((point, index) =>
            renderTrail(point, index, user.color, `${ball.id}-trail-${index}`),
          );
        })}
      </div>

      <div
        className="controlled-ball"
        style={
          {
            left: snapshot.userPosition.x,
            top: snapshot.userPosition.y,
            "--ball-color": selectedType.color,
            "--ball-glow": selectedType.glow,
          } as CSSProperties
        }
      >
        <span />
      </div>

      {snapshot.balls.map((ball) => {
        const user = userById.get(ball.id);
        if (!user) return null;
        const relation = getElementRelation(selectedType.id, user.brainType);
        const isBonded = Array.from(snapshot.bondedPairs).some((key) =>
          key.split("__").includes(ball.id),
        );

        return (
          <button
            key={ball.id}
            className={`floating-brain ${relation}${isBonded ? " bonded" : ""}`}
            onClick={() => onCollide(user)}
            style={
              {
                left: ball.position.x,
                top: ball.position.y,
                "--ball-color": user.color,
              } as CSSProperties
            }
            title={relationLabel(relation)}
          >
            <span />
          </button>
        );
      })}

      <div className="relation-legend">
        <span className="attract">相生引力</span>
        <span className="repel">相克斥力</span>
      </div>
    </section>
  );
}
