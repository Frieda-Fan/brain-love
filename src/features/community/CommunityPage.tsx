import { useState } from "react";
import ChatModal from "../../components/ChatModal";
import UserCard from "../../components/UserCard";
import type { BrainType } from "../../types/brain";
import type { MockUser } from "../../types/user";
import CommunitySpace from "./CommunitySpace";

interface CommunityPageProps {
  selectedType: BrainType;
}

export default function CommunityPage({ selectedType }: CommunityPageProps) {
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [chatUser, setChatUser] = useState<MockUser | null>(null);

  return (
    <div className="page community-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Neural Community</p>
          <h1>脑电社区</h1>
        </div>
        <p>
          移动鼠标牵引你的 Brain Ball。社区是一个平面弹球空间，Brain Ball 会碰撞、吸附并留下发光轨迹。
        </p>
      </section>
      <CommunitySpace selectedType={selectedType} onCollide={setSelectedUser} />
      {selectedUser && (
        <div className="floating-card community-card">
          <UserCard
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSayHi={setChatUser}
            onViewProfile={setSelectedUser}
            showProfileButton
          />
        </div>
      )}
      {chatUser && <ChatModal user={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
}
