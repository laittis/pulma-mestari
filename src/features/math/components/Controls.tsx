// src/features/math/components/Controls.tsx
"use client";

import type { GamePhase } from "@/core/state";

type Props = {
  phase: GamePhase;
  canSubmit: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onRestart: () => void;
  submitType?: 'button' | 'submit';
};

export function Controls({ phase, canSubmit, onSubmit, onNext, onRestart, submitType = 'button' }: Props) {
  return (
    <div className="flex gap-2">
      {phase === "question" ? (
        <button
          type={submitType}
          onClick={onSubmit}
          disabled={!canSubmit}
          className={
            "flex-1 px-3 py-2 text-lg rounded-full border-0 cursor-pointer text-white " +
            (canSubmit ? "bg-green-500" : "bg-green-300 cursor-not-allowed")
          }
        >
          Vastaa
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-3 py-2 text-lg rounded-full border-0 cursor-pointer bg-blue-600 text-white"
        >
          Seuraava
        </button>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="px-3 py-2 text-sm rounded-full border border-gray-400 cursor-pointer bg-white text-gray-700 min-w-[110px]"
      >
        Aloita alusta
      </button>
    </div>
  );
}
