import { useMemo, useState } from "react";
import ChatModal from "../../components/ChatModal";
import UserCard from "../../components/UserCard";
import { mockUsers } from "../../data/mockUsers";
import type { BrainType, BrainTypeId } from "../../types/brain";
import type { MockUser } from "../../types/user";
import FilterPanel from "./FilterPanel";
import GlobeView from "./GlobeView";

interface GlobePageProps {
  selectedType: BrainType;
}

export default function GlobePage({ selectedType }: GlobePageProps) {
  const [filter, setFilter] = useState<BrainTypeId | "all">("all");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [chatUser, setChatUser] = useState<MockUser | null>(null);

  const filteredUsers = useMemo(
    () => (filter === "all" ? mockUsers : mockUsers.filter((user) => user.brainType === filter)),
    [filter],
  );

  return (
    <div className="page globe-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Global Brain Field</p>
          <h1>地球脑纹分布</h1>
        </div>
        <p>
          你的 Brain Ball 已进入 {selectedType.cnName} 系频率。点击地球上的光点，查看附近的情绪连接。
        </p>
      </section>
      <div className="globe-layout">
        <FilterPanel value={filter} onChange={setFilter} />
        <GlobeView users={filteredUsers} onSelect={setSelectedUser} />
        {selectedUser && (
          <div className="floating-card">
            <UserCard
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onSayHi={setChatUser}
            />
          </div>
        )}
      </div>
      {chatUser && <ChatModal user={chatUser} onClose={() => setChatUser(null)} />}
    </div>
  );
}
