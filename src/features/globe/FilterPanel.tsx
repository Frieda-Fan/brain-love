import { brainTypes } from "../../data/brainTypes";
import type { BrainTypeId } from "../../types/brain";

interface FilterPanelProps {
  value: BrainTypeId | "all";
  onChange: (value: BrainTypeId | "all") => void;
}

export default function FilterPanel({ value, onChange }: FilterPanelProps) {
  return (
    <aside className="filter-panel">
      <p className="eyebrow">Filter</p>
      <div className="filter-row">
        <button className={value === "all" ? "active" : ""} onClick={() => onChange("all")}>
          全部
        </button>
        {brainTypes.map((type) => (
          <button
            key={type.id}
            className={value === type.id ? "active" : ""}
            onClick={() => onChange(type.id)}
          >
            <span style={{ background: type.color }} />
            {type.cnName}
          </button>
        ))}
      </div>
    </aside>
  );
}
