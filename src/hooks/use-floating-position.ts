"use client";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
type Point = { x: number; y: number };
export function clampPosition(
  point: Point,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
): Point {
  return {
    x: Math.max(8, Math.min(point.x, viewportWidth - width - 8)),
    y: Math.max(8, Math.min(point.y, viewportHeight - height - 8)),
  };
}
export function useFloatingPosition() {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<Point | null>(null);
  const suppressClick = useRef(false);
  const drag = useRef<{
    id: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  } | null>(null);
  function bounded(point: Point) {
    const rect = ref.current?.getBoundingClientRect();
    const viewport = window.visualViewport;
    return clampPosition(
      point,
      rect?.width ?? 0,
      rect?.height ?? 0,
      viewport?.width ?? window.innerWidth,
      viewport?.height ?? window.innerHeight,
    );
  }
  useEffect(() => {
    function fit() {
      setPosition((current) => (current ? bounded(current) : current));
    }
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    if (ref.current) observer?.observe(ref.current);
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, []);
  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    suppressClick.current = false;
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (drag.current?.id !== event.pointerId) return;
    if (
      Math.abs(event.clientX - drag.current.startX) +
        Math.abs(event.clientY - drag.current.startY) >
      5
    )
      suppressClick.current = true;
    setPosition(
      bounded({
        x: event.clientX - drag.current.offsetX,
        y: event.clientY - drag.current.offsetY,
      }),
    );
  }
  function stop(event: PointerEvent<HTMLElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Home") {
      event.preventDefault();
      setPosition(null);
      return;
    }
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const step = event.shiftKey ? 40 : 12;
    setPosition(
      bounded({
        x: rect.left + direction.x * step,
        y: rect.top + direction.y * step,
      }),
    );
  }
  return {
    ref,
    style: position
      ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
      : undefined,
    dragProps: {
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      },
      onPointerDown,
      onPointerMove,
      onPointerUp: stop,
      onPointerCancel: stop,
      onLostPointerCapture: () => {
        drag.current = null;
      },
      onKeyDown,
    },
    reset: () => setPosition(null),
  };
}
