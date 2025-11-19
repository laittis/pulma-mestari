// src/features/math/components/GameHeader.tsx
"use client";

import type { RoundOutcome } from "@/core/progress";
import type { GamePhase, GameMode } from "@/core/state";

type Props = {
  level: number;
  phase: GamePhase;
  questionNumber: number;
  totalTasks: number;
  lastOutcome: RoundOutcome | null;
  mode: GameMode;
};

function modeLabel(mode: GameMode): string {
  if (mode === 'add') return 'Yhteenlaskut';
  if (mode === 'sub') return 'Vähennyslaskut';
  if (mode === 'mul') return 'Kertolaskut';
  return 'Sekoitettu';
}

export function GameHeader({ level, phase, questionNumber, totalTasks, lastOutcome, mode }: Props) {
  return (
    <header className="mb-4">
      <h1 className="text-[24px] m-0">Pulmamestarit</h1>
      <p className="mt-1 text-sm text-gray-600">
        Taso {level} · {modeLabel(mode)} · {phase === "summary" ? "Kierros valmis" : `Tehtävä ${questionNumber} / ${totalTasks}`}
      </p>
      {lastOutcome && (
        <p className="mt-0.5 text-xs text-gray-500">
          Edellinen tulos: {lastOutcome.correct} / {lastOutcome.total}
        </p>
      )}
    </header>
  );
}
