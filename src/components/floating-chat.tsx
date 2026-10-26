"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { GripHorizontal, MessagesSquare, Minus, RotateCcw } from "lucide-react";
import { useFloatingPosition } from "@/hooks/use-floating-position";
export function FloatingChat({
  children,
  messageCount,
}: {
  children?: ReactNode;
  messageCount: number;
}) {
  const [minimized, setMinimized] = useState(true);
  const [seenCount, setSeenCount] = useState(messageCount);
  const follow = useRef(true);
  const { ref: widgetRef, style, dragProps, reset } = useFloatingPosition();
  const id = useId();
  const unread = minimized ? Math.max(0, messageCount - seenCount) : 0;
  useEffect(() => {
    const log = widgetRef.current?.querySelector<HTMLElement>(".chat-messages");
    if (!minimized && log && follow.current) log.scrollTop = log.scrollHeight;
  }, [messageCount, minimized, widgetRef]);
  return (
    <section
      ref={widgetRef}
      style={style}
      className={`floating-chat ${minimized ? "chat-minimized" : ""}`}
      aria-label="Chat del equipo"
    >
      <div className="floating-chat-bar">
        <button
          hidden={minimized}
          className="widget-drag-handle"
          {...dragProps}
          aria-label="Mover chat"
          title="Arrastra para mover; usa las flechas con el teclado y Inicio para restablecer"
        >
          <GripHorizontal size={17} />
          <span>Chat del equipo</span>
        </button>
        <button
          hidden={minimized}
          className="widget-icon-button"
          onClick={reset}
          aria-label="Restablecer posición del chat"
        >
          <RotateCcw size={16} />
        </button>
        <button
          {...(minimized ? dragProps : {})}
          className={`chat-toggle widget-icon-button ${minimized ? "widget-drag-handle" : ""}`}
          aria-label={
            minimized
              ? `Abrir chat del equipo${unread ? `, ${unread} mensajes nuevos` : ""}`
              : "Minimizar chat"
          }
          aria-expanded={!minimized}
          aria-controls={id}
          onClick={() => {
            setSeenCount(messageCount);
            follow.current = true;
            setMinimized(!minimized);
          }}
        >
          {minimized ? <MessagesSquare size={23} /> : <Minus size={18} />}
          {unread > 0 && (
            <span className="chat-unread">{unread > 99 ? "99+" : unread}</span>
          )}
        </button>
      </div>
      <div
        id={id}
        hidden={minimized}
        className="floating-chat-content"
        onScrollCapture={(event) => {
          const element = event.target as HTMLElement;
          if (element.classList.contains("chat-messages"))
            follow.current =
              element.scrollHeight - element.scrollTop - element.clientHeight <
              60;
        }}
      >
        {children}
      </div>
    </section>
  );
}
