// src/features/math/components/SettingsPanel.tsx
"use client";

import { useState } from "react";
import { LevelGuide } from "@/features/math/components/LevelGuide";

type Mode = 'mixed' | 'add' | 'sub' | 'mul';

type Props = {
  open: boolean;
  roundOptions: { level: number; roundLength: number; mode: Mode };
  userSettings: { preferredLevel: number; preferredMode: Mode; defaultAutoAdvance: boolean };
  onClose: () => void;
  onApply: (opts: {
    roundOptions: { level: number; roundLength: number; mode: Mode };
    userSettings: { preferredLevel: number; preferredMode: Mode; defaultAutoAdvance: boolean };
  }) => void;
};

export function SettingsPanel({ open, roundOptions, userSettings, onClose, onApply }: Props) {
  const DEFAULT_LEVEL = 1;
  const DEFAULT_ROUND_LENGTH = 10;
  const DEFAULT_MODE: Mode = 'mixed';

  const [localLevel, setLocalLevel] = useState(roundOptions.level);
  const [localLen, setLocalLen] = useState(roundOptions.roundLength);
  const [localMode, setLocalMode] = useState<Mode>(roundOptions.mode);
  const [preferredLevel, setPreferredLevel] = useState(userSettings.preferredLevel);
  const [preferredMode, setPreferredMode] = useState<Mode>(userSettings.preferredMode);
  const [defaultAutoAdvance, setDefaultAutoAdvance] = useState(userSettings.defaultAutoAdvance);

  if (!open) return null;

  const roundOptionsChanged =
    localLevel !== roundOptions.level ||
    localLen !== roundOptions.roundLength ||
    localMode !== roundOptions.mode;
  const userSettingsChanged =
    preferredLevel !== userSettings.preferredLevel ||
    preferredMode !== userSettings.preferredMode ||
    defaultAutoAdvance !== userSettings.defaultAutoAdvance;

  return (
    <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium m-0">Asetukset</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPreferredLevel(DEFAULT_LEVEL);
              setPreferredMode(DEFAULT_MODE);
              setDefaultAutoAdvance(true);
              setLocalLevel(DEFAULT_LEVEL);
              setLocalLen(DEFAULT_ROUND_LENGTH);
              setLocalMode(DEFAULT_MODE);
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

      <div className="-mt-2 mb-5 space-y-2 text-xs text-gray-600">
        <p>
          Käytä käyttäjäasetuksia tallentaaksesi oletusarvot (tila, taso ja automaattinen eteneminen) tulevia istuntoja ja kierroksia varten.
        </p>
        <p>
          Kierroskohtaiset asetukset vaikuttavat vain seuraavaan kierrokseen. Ne voidaan poiketa käyttäjäasetuksista ilman, että oletukset muuttuvat.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Käyttäjäasetukset</h3>
          <p className="text-xs text-gray-600">
            Tallennetaan selaimen muistiin. Näitä käytetään oletuksina, kun palaat tai aloitat uuden kierroksen.
          </p>

          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700">Oletustila</span>
            <select
              value={preferredMode}
              onChange={(e) => setPreferredMode(e.target.value as Mode)}
              className="px-2 py-1 border rounded-md"
            >
              <option value="mixed">Sekoitettu</option>
              <option value="add">Yhteenlaskut</option>
              <option value="sub">Vähennyslaskut</option>
              <option value="mul">Kertolaskut</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700">Oletustaso</span>
            <select
              value={preferredLevel}
              onChange={(e) => setPreferredLevel(Number(e.target.value))}
              className="px-2 py-1 border rounded-md"
            >
              {Array.from({ length: 6 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700">Automaattinen eteneminen</span>
            <input
              type="checkbox"
              checked={defaultAutoAdvance}
              onChange={(e) => setDefaultAutoAdvance(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Kierroksen asetukset</h3>
          <p className="text-xs text-gray-600">Käytetään seuraavan kierroksen arvoina. Nämä eivät muuta yllä olevia oletuksia.</p>

          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-700">Pelitila</span>
            <select
              value={localMode}
              onChange={(e) => setLocalMode(e.target.value as Mode)}
              className="px-2 py-1 border rounded-md"
            >
              <option value="mixed">Sekoitettu</option>
              <option value="add">Yhteenlaskut</option>
              <option value="sub">Vähennyslaskut</option>
              <option value="mul">Kertolaskut</option>
            </select>
          </label>

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
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onApply({
                roundOptions: { level: localLevel, roundLength: localLen, mode: localMode },
                userSettings: {
                  preferredLevel,
                  preferredMode,
                  defaultAutoAdvance,
                },
              })
            }
            disabled={!roundOptionsChanged && !userSettingsChanged}
            className={
              "px-3 py-2 text-sm rounded-full border-0 text-white " +
              (!roundOptionsChanged && !userSettingsChanged
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600")
            }
          >
            Tallenna ja aloita uusi kierros
          </button>
        </div>
      </div>

      <LevelGuide />
    </div>
  );
}
