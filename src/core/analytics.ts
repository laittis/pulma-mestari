// src/core/analytics.ts
import { track as vercelTrack } from '@vercel/analytics';

export type GameMode = 'mixed' | 'add' | 'sub' | 'mul';

export function trackAnswer(payload: {
  correct: boolean;
  mode: GameMode;
  level: number;
  kind: 'binary' | 'expression';
  index: number;
}) {
  try {
    vercelTrack('answer', payload);
  } catch {}
}

export function trackRoundStart(payload: { level: number; mode: GameMode; length: number }) {
  try {
    vercelTrack('round_start', payload);
  } catch {}
}

export function trackRoundComplete(payload: { level: number; mode: GameMode; correct: number; total: number }) {
  try {
    vercelTrack('round_complete', payload);
  } catch {}
}

