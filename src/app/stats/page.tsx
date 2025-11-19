// src/app/stats/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Stats, LevelStats, RoundEntry } from '@/core/stats';
import { clearStats, loadStats } from '@/core/stats';

type ViewStats = Stats;

function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function LevelBlock({ level, stats }: { level: number; stats: LevelStats }) {
  const bestAcc = fmtPct(stats.bestAccuracy || 0);
  const roundsPlayed = stats.rounds.length;
  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-base">Taso {level}</h3>
        <div className="text-sm text-gray-600">Paras: {stats.bestCorrect}/{stats.bestTotal} ({bestAcc})</div>
      </div>
      {roundsPlayed > 0 ? (
        <ul className="mt-2 mb-0 text-sm text-gray-700 space-y-1">
          {stats.rounds.slice().reverse().slice(0, 10).map((r: RoundEntry, idx: number) => (
            <li key={idx} className="flex justify-between">
              <span>{new Date(r.ts).toLocaleString()}</span>
              <span>
                {r.correct}/{r.total} ({fmtPct(r.total ? r.correct / r.total : 0)})
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 mb-0 text-sm text-gray-500">Ei kierroksia vielä.</p>
      )}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<ViewStats | null>(() =>
    typeof window !== 'undefined' ? loadStats() : null
  );

  const overallPct = stats && stats.overall.total > 0 ? fmtPct(stats.overall.correct / stats.overall.total) : '0%';
  const levels = stats ? Object.keys(stats.byLevel).map(n => Number(n)).sort((a,b) => a-b) : [];

  return (
    <main className="min-h-screen flex justify-center items-start p-6 bg-gray-200 text-gray-900">
      <div className="bg-white rounded-2xl p-6 w-full max-w-[720px] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[24px] m-0">Tilastot</h1>
          <div className="flex gap-2">
            <Link href="/game" className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700">
              Takaisin peliin
            </Link>
            <button
              type="button"
              onClick={() => { clearStats(); setStats(loadStats()); }}
              className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
            >
              Tyhjennä tilastot
            </button>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-100 mb-4">
          <p className="m-0 text-lg">
            Yhteensä kierroksia: <strong>{stats?.overall.rounds ?? 0}</strong>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Oikein: {stats?.overall.correct ?? 0} / {stats?.overall.total ?? 0} ({overallPct})
          </p>
        </div>

        <div className="grid gap-3">
          {levels.length === 0 && (
            <p className="text-sm text-gray-600">Ei tilastoja vielä. Pelaa muutama kierros.</p>
          )}
          {levels.map((lvl) => (
            <LevelBlock key={lvl} level={lvl} stats={stats!.byLevel[lvl]} />
          ))}
        </div>
      </div>
    </main>
  );
}
