import type { CSSProperties } from "react";

interface BrainBallProps {
  color: string;
  glow?: string;
  size?: number;
  label?: string;
  className?: string;
}

export default function BrainBall({
  color,
  glow,
  size = 96,
  label,
  className = "",
}: BrainBallProps) {
  return (
    <div
      className={`brain-ball ${className}`}
      style={
        {
          "--ball-color": color,
          "--ball-glow": glow ?? color,
          width: size,
          height: size,
        } as CSSProperties
      }
      aria-label={label}
    >
      <span />
    </div>
  );
}
