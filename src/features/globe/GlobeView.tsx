import { useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import type { MockUser } from "../../types/user";

interface GlobeViewProps {
  users: MockUser[];
  onSelect: (user: MockUser) => void;
}

interface Rotation {
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  rotation: Rotation;
}

const degreesToRadians = (value: number) => (value * Math.PI) / 180;

const projectGeo = (latitude: number, longitude: number, rotation: Rotation) => {
  const lat = degreesToRadians(latitude);
  const lon = degreesToRadians(longitude + rotation.x);
  const tilt = degreesToRadians(rotation.y);

  const baseX = Math.cos(lat) * Math.sin(lon);
  const baseY = Math.sin(lat);
  const baseZ = Math.cos(lat) * Math.cos(lon);

  const y = baseY * Math.cos(tilt) - baseZ * Math.sin(tilt);
  const z = baseY * Math.sin(tilt) + baseZ * Math.cos(tilt);
  const visible = z > -0.08;

  return {
    x: 50 + baseX * 46,
    y: 50 - y * 46,
    depth: Math.max(0, (z + 1) / 2),
    visible,
  };
};

export default function GlobeView({ users, onSelect }: GlobeViewProps) {
  const [rotation, setRotation] = useState<Rotation>({ x: -18, y: -8 });
  const dragRef = useRef<DragState | null>(null);

  const points = useMemo(
    () =>
      users.map((user) => ({
        user,
        position: projectGeo(user.location.latitude, user.location.longitude, rotation),
      })),
    [rotation, users],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rotation,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setRotation({
      x: drag.rotation.x + (event.clientX - drag.startX) * 0.42,
      y: Math.max(-62, Math.min(62, drag.rotation.y - (event.clientY - drag.startY) * 0.32)),
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  return (
    <section className="globe-stage">
      <div
        className="globe"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={
          {
            "--globe-rotate-x": `${rotation.x}deg`,
            "--globe-rotate-y": `${rotation.y}deg`,
            "--land-shift-x": `${Math.max(-10, Math.min(10, rotation.x * 0.05))}%`,
            "--land-shift-y": `${Math.max(-8, Math.min(8, rotation.y * 0.08))}%`,
          } as CSSProperties
        }
      >
        <div className="globe-map" />
        <div className="globe-grid" />
        {points.map(({ user, position }) => (
          <button
            key={user.id}
            className="globe-point"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => position.visible && onSelect(user)}
            style={
              {
                left: `${position.x}%`,
                top: `${position.y}%`,
                "--point-color": user.color,
                "--point-depth": position.depth,
                opacity: position.visible ? 0.36 + position.depth * 0.64 : 0,
                pointerEvents: position.visible ? "auto" : "none",
              } as CSSProperties
            }
            aria-label={user.name}
          />
        ))}
      </div>
      <div className="globe-hint">按住地球拖动查看 BrainBall 分布</div>
    </section>
  );
}
