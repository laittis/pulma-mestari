// src/lib/game/difficulty.ts

export type RoundOutcome = {
  correct: number;
  total: number;
};

export function calculateAccuracy(outcome: RoundOutcome): number {
  if (outcome.total === 0) return 0;
  return outcome.correct / outcome.total;
}

// yksinkertainen versio, 1–6 lk
export function nextGrade(current: number, outcome: RoundOutcome): number {
  const acc = calculateAccuracy(outcome);

  let next = current;

  if (acc >= 0.85) {
    next = current + 1;        // nosta tasoa
  } else if (acc <= 0.4) {
    next = current - 1;        // lasketaan tasoa
  } else {
    next = current;            // pidä taso
  }

  if (next < 1) next = 1;
  if (next > 6) next = 6;

  return next;
}

