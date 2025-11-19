// src/features/math/components/FeedbackText.tsx
"use client";

import type { GamePhase } from "@/core/state";

type Props = {
  phase: GamePhase;
  isCorrect: boolean;
  correctAnswer?: number;
};

export function FeedbackText({ phase, isCorrect, correctAnswer }: Props) {
  if (phase !== "feedback") return null;
  return (
    <p
      className={
        "-mt-1 mb-4 text-lg text-center " + (isCorrect ? "text-green-700" : "text-rose-700")
      }
    >
      {isCorrect ? "Hienoa, meni oikein!" : `Melkein! Oikea vastaus: ${correctAnswer}`}
    </p>
  );
}

