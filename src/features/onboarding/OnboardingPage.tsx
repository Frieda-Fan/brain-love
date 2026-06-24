import BrainBall from "../../components/BrainBall";
import type { BrainType, BrainTypeId } from "../../types/brain";
import BrainTypeSelector from "./BrainTypeSelector";

interface OnboardingPageProps {
  onSelect: (id: BrainTypeId) => void;
  selectedType: BrainType | null;
}

export default function OnboardingPage({ onSelect, selectedType }: OnboardingPageProps) {
  return (
    <div className="page onboarding-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">BrainBall Social</p>
          <h1>选择你的脑纹，进入五行情绪社交场。</h1>
          <p>
            用一个发光 Brain Ball 代表你的社交频率。这里的脑电数据先由模拟关系驱动，
            后续可替换为真实 EEG 输入。
          </p>
        </div>
        <div className="hero-orbit">
          <BrainBall
            color={selectedType?.color ?? "#65b7ff"}
            glow={selectedType?.glow ?? "rgba(101, 183, 255, 0.6)"}
            size={156}
            label="Your Brain Ball"
          />
          <span className="orbit-ring ring-a" />
          <span className="orbit-ring ring-b" />
        </div>
      </section>
      <BrainTypeSelector onSelect={onSelect} />
    </div>
  );
}
