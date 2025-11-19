// src/features/math/components/GameHeader.tsx
"use client";

import type { RoundOutcome } from "@/core/progress";
import type { GamePhase } from "@/core/state";

type Props = {
  level: number;
  phase: GamePhase;
  questionNumber: number;
  totalTasks: number;
  lastOutcome: RoundOutcome | null;
};

export function GameHeader({
  level,
  phase,
  questionNumber,
  totalTasks,
  lastOutcome,
}: Props) {
  return (
    <header className="mb-4">
      <h1 className="text-[24px] m-0">PikkuMatikka</h1>
      <p className="mt-1 text-sm text-gray-600">
        Taso {level} · {phase === "summary" ? "Kierros valmis" : `Tehtävä ${questionNumber} / ${totalTasks}`}
      </p>
      {lastOutcome && (
        <p className="mt-0.5 text-xs text-gray-500">
          Edellinen tulos: {lastOutcome.correct} / {lastOutcome.total}
        </p>
      )}
    </header>
  );
}
