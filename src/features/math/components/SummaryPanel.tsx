// src/features/math/components/SummaryPanel.tsx
"use client";

type Props = {
  correctCount: number;
  totalTasks: number;
  nextLevel: number;
};

export function SummaryPanel({ correctCount, totalTasks, nextLevel }: Props) {
  return (
    <div className="p-4 rounded-xl bg-gray-100 mb-4">
      <p className="m-0 text-lg">
        Kierros valmis! Tulos: <strong>{correctCount} / {totalTasks}</strong>
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Uusi taso seuraavalle kierrokselle: taso {nextLevel}
      </p>
    </div>
  );
}

