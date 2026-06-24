import { getBrainType } from "../data/brainTypes";
import type { MockUser } from "../types/user";

interface UserCardProps {
  user: MockUser;
  onClose: () => void;
  onSayHi: (user: MockUser) => void;
  onViewProfile?: (user: MockUser) => void;
  showProfileButton?: boolean;
}

export default function UserCard({
  user,
  onClose,
  onSayHi,
  onViewProfile,
  showProfileButton = false,
}: UserCardProps) {
  const type = getBrainType(user.brainType);

  return (
    <article className="user-card">
      <button className="icon-close" onClick={onClose} aria-label="close">
        x
      </button>
      <div className="user-card-head">
        <span
          className="mini-ball"
          style={{ background: user.color, boxShadow: `0 0 24px ${type.glow}` }}
        />
        <div>
          <h3>{user.name}</h3>
          <p>
            {type.cnName} {type.enName} · {type.element}系脑纹
          </p>
        </div>
      </div>
      <dl className="user-stats">
        <div>
          <dt>匹配度</dt>
          <dd>{user.matchScore}%</dd>
        </div>
        <div>
          <dt>距离/城市</dt>
          <dd>{user.location.city}</dd>
        </div>
      </dl>
      <div className="card-actions">
        <button className="primary-action" onClick={() => onSayHi(user)}>
          打招呼
        </button>
        {showProfileButton && (
          <button className="ghost-action" onClick={() => onViewProfile?.(user)}>
            查看资料
          </button>
        )}
        <button className="ghost-action" onClick={onClose}>
          关闭
        </button>
      </div>
    </article>
  );
}
