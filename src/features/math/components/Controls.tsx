// src/features/math/components/Controls.tsx
"use client";

import type { GamePhase } from "@/core/state";

type Props = {
  phase: GamePhase;
  canSubmit: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onRestart: () => void;
  onExit: () => void;
  submitType?: 'button' | 'submit';
};

export function Controls({ phase, canSubmit, onSubmit, onNext, onRestart, onExit, submitType = 'button' }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
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
  autoAdvance: boolean;
  onToggleAutoAdvance: (value: boolean) => void;
  submitType?: 'button' | 'submit';
};

export function Controls({
  phase,
  canSubmit,
  onSubmit,
  onNext,
  onRestart,
  autoAdvance,
  onToggleAutoAdvance,
  submitType = 'button',
}: Props) {
  return (
    <div className="flex flex-col gap-2">
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

      <button
        type="button"
        onClick={onRestart}
        className="px-3 py-2 text-sm rounded-full border border-gray-400 cursor-pointer bg-white text-gray-700 min-w-[110px]"
        aria-label="Aloita kierros alusta"
      >
        Aloita alusta
      </button>

      <button
        type="button"
        onClick={onExit}
        className="px-3 py-2 text-sm rounded-full border border-gray-400 cursor-pointer bg-white text-gray-700 min-w-[110px]"
        aria-label="Palaa päävalikkoon"
      >
        Päävalikko
      </button>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={autoAdvance}
          onChange={(e) => onToggleAutoAdvance(e.target.checked)}
        />
        <div className="leading-tight">
          <div>Automaattinen eteneminen</div>
          <div className="text-[11px] text-gray-500">Kierroskohtainen asetus, vaikuttaa heti</div>
        </div>
      </label>
    </div>
  );
}
