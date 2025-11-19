// src/features/math/components/SettingsPanel.tsx
"use client";

import { useState } from "react";
import { LevelGuide } from "@/features/math/components/LevelGuide";

type Props = {
  open: boolean;
  level: number;
  roundLength: number;
  onClose: () => void;
  onApply: (opts: { level: number; roundLength: number }) => void;
};

export function SettingsPanel({ open, level, roundLength, onClose, onApply }: Props) {
  const DEFAULT_LEVEL = 1;
  const DEFAULT_ROUND_LENGTH = 10;

  const [localLevel, setLocalLevel] = useState(level);
  const [localLen, setLocalLen] = useState(roundLength);

  if (!open) return null;

  return (
    <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium m-0">Asetukset</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setLocalLevel(DEFAULT_LEVEL);
              setLocalLen(DEFAULT_ROUND_LENGTH);
            }}
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
          >
            Palauta oletukset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
          >
            Sulje
          </button>
        </div>
      </div>

      <p className="-mt-2 mb-3 text-xs text-gray-500">
        Valitse taso ja tehtävien määrä. Pikavalinnat muuttavat valintaa; aloita uusi kierros painamalla &quot;Käytä&quot;.
      </p>

      <div className="grid grid-cols-1 gap-3">
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-700">Taso</span>
          <select
            value={localLevel}
            onChange={(e) => setLocalLevel(Number(e.target.value))}
            className="px-2 py-1 border rounded-md"
          >
            {Array.from({ length: 6 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-700">Tehtäviä kierroksessa</span>
          <input
            type="number"
            min={5}
            max={30}
            step={1}
            value={localLen}
            onChange={(e) => setLocalLen(Math.max(5, Math.min(30, Number(e.target.value))))}
            className="w-24 px-2 py-1 border rounded-md"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onApply({ level: localLevel, roundLength: localLen })}
            disabled={localLevel === level && localLen === roundLength}
            className={
              "px-3 py-2 text-sm rounded-full border-0 text-white " +
              (localLevel === level && localLen === roundLength ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600")
            }
          >
            Käytä ja aloita uusi kierros
          </button>
        </div>
      </div>

      <LevelGuide />
    </div>
  );
}
