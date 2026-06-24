import type { BrainType } from "../types/brain";

interface NavigationBarProps {
  activePath: string;
  hasProfile: boolean;
  selectedType: BrainType | null;
  onNavigate: (path: string) => void;
  onReset: () => void;
}

export default function NavigationBar({
  activePath,
  hasProfile,
  selectedType,
  onNavigate,
  onReset,
}: NavigationBarProps) {
  return (
    <header className="navigation-bar">
      <button className="brand-mark" onClick={() => onNavigate("/")}>
        <span className="brand-orbit" />
        <span>BrainBall</span>
      </button>

      <nav className="nav-tabs" aria-label="BrainBall navigation">
        <button
          className={activePath === "/" ? "active" : ""}
          onClick={() => onNavigate("/")}
        >
          脑纹
        </button>
        <button
          className={activePath === "/globe" ? "active" : ""}
          disabled={!hasProfile}
          onClick={() => onNavigate("/globe")}
        >
          地球
        </button>
        <button
          className={activePath === "/community" ? "active" : ""}
          disabled={!hasProfile}
          onClick={() => onNavigate("/community")}
        >
          社区
        </button>
      </nav>

      <div className="profile-chip">
        {selectedType ? (
          <>
            <span style={{ background: selectedType.color }} />
            {selectedType.cnName} {selectedType.enName}
            <button onClick={onReset}>重选</button>
          </>
        ) : (
          "选择你的脑纹"
        )}
      </div>
    </header>
  );
}
