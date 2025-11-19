// src/core/progress.ts

export type RoundOutcome = {
  correct: number;
  total: number;
};

export function calculateAccuracy(outcome: RoundOutcome): number {
  if (outcome.total === 0) return 0;
  return outcome.correct / outcome.total;
}

// simple 1–6 clamped level progression
export function nextLevel(current: number, outcome: RoundOutcome): number {
  const acc = calculateAccuracy(outcome);
  let next = current;

  if (acc >= 0.85) next = current + 1; // level up
  else if (acc <= 0.4) next = current - 1; // level down

  if (next < 1) next = 1;
  if (next > 6) next = 6;
  return next;
}

