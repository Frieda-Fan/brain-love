import type { MockUser } from "../types/user";

interface ChatModalProps {
  user: MockUser;
  onClose: () => void;
}

export default function ChatModal({ user, onClose }: ChatModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="chat-modal">
        <button className="icon-close" onClick={onClose} aria-label="close">
          x
        </button>
        <p className="eyebrow">Message to {user.name}</p>
        <div className="message-bubble">Hi，我感受到我们之间有一种相生引力。</div>
        <button className="primary-action" onClick={onClose}>
          发送
        </button>
      </section>
    </div>
  );
}
