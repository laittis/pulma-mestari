// src/core/stats.ts
import type { RoundOutcome } from "@/core/progress";

export type RoundEntry = {
  ts: number;
  correct: number;
  total: number;
};

export type LevelStats = {
  bestAccuracy: number; // 0..1
  bestCorrect: number;
  bestTotal: number;
  rounds: RoundEntry[]; // most-recent last
};

export type Stats = {
  byLevel: Record<number, LevelStats>;
  overall: { rounds: number; correct: number; total: number };
};

export function getEmptyStats(): Stats {
  return { byLevel: {}, overall: { rounds: 0, correct: 0, total: 0 } };
}

export function loadStats(): Stats {
  if (typeof window === 'undefined') return getEmptyStats();
  try {
    const raw = localStorage.getItem('pm.stats');
    if (!raw) return getEmptyStats();
    const parsed = JSON.parse(raw) as Stats;
    if (!parsed || typeof parsed !== 'object') return getEmptyStats();
    return parsed;
  } catch {
    return getEmptyStats();
  }
}

export function saveStats(stats: Stats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('pm.stats', JSON.stringify(stats));
  } catch {}
}

export function recordRound(level: number, outcome: RoundOutcome): Stats {
  const stats = loadStats();
  const { correct, total } = outcome;
  const acc = total > 0 ? correct / total : 0;
  const entry: RoundEntry = { ts: Date.now(), correct, total };

  // overall
  stats.overall.rounds += 1;
  stats.overall.correct += correct;
  stats.overall.total += total;

  // per level
  const existing: LevelStats =
    stats.byLevel[level] ?? { bestAccuracy: 0, bestCorrect: 0, bestTotal: 0, rounds: [] };

  const betterAcc = acc > existing.bestAccuracy;
  const bestCorrect = betterAcc ? correct : existing.bestCorrect;
  const bestTotal = betterAcc ? total : existing.bestTotal;
  const bestAccuracy = Math.max(existing.bestAccuracy, acc);

  const rounds = existing.rounds.slice();
  rounds.push(entry);
  const MAX = 20;
  while (rounds.length > MAX) rounds.shift();

  stats.byLevel[level] = { bestAccuracy, bestCorrect, bestTotal, rounds };
  saveStats(stats);
  return stats;
}

export function clearStats(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('pm.stats');
    localStorage.removeItem('pm.lastOutcome');
  } catch {}
}

