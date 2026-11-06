"use client";
import { useEffect, useRef, useState } from "react";
type CaseTab = "evidence" | "suspects" | "timeline";
/** New phases choose their initial view once; realtime refreshes preserve manual navigation. */
export function useCaseTab(gameId?: string, stage?: number) {
  const phase = `${gameId ?? "lobby"}:${stage ?? 0}`;
  const [choice, setChoice] = useState<{ phase: string; tab: CaseTab } | null>(
    null,
  );
  const voteTabRef = useRef<HTMLButtonElement>(null);
  const tab =
    choice?.phase === phase
      ? choice.tab
      : stage === 2
        ? "suspects"
        : "evidence";
  useEffect(() => {
    if (gameId && stage === 2) {
      voteTabRef.current?.scrollIntoView?.({
        block: "center",
        behavior: "instant",
      });
      voteTabRef.current?.focus({ preventScroll: true });
    }
  }, [gameId, stage]);
  return {
    tab,
    setTab: (tab: CaseTab) => setChoice({ phase, tab }),
    voteTabRef,
  };
}
