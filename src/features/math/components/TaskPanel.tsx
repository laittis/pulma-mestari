// src/features/math/components/TaskPanel.tsx
"use client";

import type { GamePhase } from "@/core/state";
import { cn } from "@/ui/cn";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  phase: GamePhase;
  isCorrect: boolean;
}>;

export function TaskPanel({ phase, isCorrect, children }: Props) {
  const panelClass = cn(
    "mb-4 p-3 rounded-2xl border flex items-center justify-center gap-2 text-[26px]",
    phase === "feedback"
      ? isCorrect
        ? "bg-green-50 border border-green-500"
        : "bg-rose-50 border border-rose-500"
      : "bg-gray-50 border border-gray-200"
  );

  return <div className={panelClass}>{children}</div>;
}
