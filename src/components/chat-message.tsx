import Image from "next/image";
import { characterFor } from "@/lib/characters";
import type { RoomSnapshot } from "@/lib/types";

export function ChatMessage({
  message,
  avatar,
  mine,
}: {
  message: RoomSnapshot["messages"][number];
  avatar?: string;
  mine: boolean;
}) {
  const character = characterFor(avatar ?? "lupa");
  return (
    <article className={`chat-message ${mine ? "mine" : ""}`}>
      <Image
        className="chat-message-avatar"
        src={character.image}
        alt=""
        aria-hidden="true"
        width={44}
        height={58}
        sizes="44px"
        draggable={false}
      />
      <div className="chat-message-bubble">
        <header>
          <b>{message.name}</b>
          <time dateTime={message.sent_at}>
            {new Date(message.sent_at).toLocaleTimeString("es-EC", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </header>
        <p>{message.body}</p>
      </div>
    </article>
  );
}
