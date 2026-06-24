import type { CSSProperties } from "react";
import BrainBall from "../../components/BrainBall";
import { brainTypes } from "../../data/brainTypes";
import type { BrainTypeId } from "../../types/brain";

interface BrainTypeSelectorProps {
  onSelect: (id: BrainTypeId) => void;
}

export default function BrainTypeSelector({ onSelect }: BrainTypeSelectorProps) {
  return (
    <section className="type-grid" aria-label="Brain type selector">
      {brainTypes.map((type) => (
        <button
          key={type.id}
          className="type-card"
          onClick={() => onSelect(type.id)}
          style={{ "--accent": type.color, "--accent-glow": type.glow } as CSSProperties}
        >
          <BrainBall color={type.color} glow={type.glow} size={88} label={type.enName} />
          <span className="type-title">
            {type.cnName} <small>{type.enName}</small>
          </span>
          <span className="type-copy">{type.summary}</span>
        </button>
      ))}
    </section>
  );
}
