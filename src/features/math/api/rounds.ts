// src/features/math/api/rounds.ts
import type { GeneratedRound } from '@/features/math/tasks/types';

export type GameMode = 'mixed' | 'add' | 'sub' | 'mul';

export async function fetchRound(
  level: number,
  num: number,
  mode: GameMode
): Promise<GeneratedRound> {
  const res = await fetch(`/api/tasks/new?level=${level}&num=${num}&mode=${mode}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch round (${res.status})`);
  }
  return (await res.json()) as GeneratedRound;
}

