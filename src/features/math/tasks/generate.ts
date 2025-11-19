// src/features/math/tasks/generate.ts
import { randomUUID } from 'crypto';
import type { GeneratedRound, Task, Operation, AnswerTarget } from './types';
import { computeResult } from './utils';
import { getProfile, pickOpFromProfile, pickTargetFromWeights } from '@/features/math/levels/profiles';

function randomInt(min: number, max: number): number {
  // [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Operation now derived from level profile
function pickOp(level: number): Operation {
  return pickOpFromProfile(level);
}

// result calculation moved to utils.ts

function pickTarget(level: number): AnswerTarget {
  const prof = getProfile(level);
  return pickTargetFromWeights(prof.targetWeights);
}

function generateSingleTask(level: number): Task {
  const op = pickOp(level);
  let a = 0;
  let b = 0;

  const prof = getProfile(level);
  if (op === 'add') {
    a = randomInt(0, prof.addMax);
    b = randomInt(0, prof.addMax);
  } else if (op === 'sub') {
    a = randomInt(0, prof.subMax);
    b = randomInt(0, a); // non-negative
  } else if (op === 'mul') {
    a = randomInt(0, prof.mulMax);
    b = randomInt(0, prof.mulMax);
  } else {
    // div: enforce integer result
    const divisor = Math.max(1, randomInt(1, Math.max(1, prof.divMax)));
    const quotient = randomInt(0, prof.divMax);
    a = divisor * quotient;
    b = divisor;
  }

  const result = computeResult(a, b, op);
  const target = pickTarget(level);

  let correctAnswer = result;
  if (target === 'a') correctAnswer = a;
  if (target === 'b') correctAnswer = b;

  return {
    id: randomUUID(),
    a,
    b,
    op,
    correctAnswer,
    target,
  };
}

export function generateRound(level: number, numTasks: number = 10): GeneratedRound {
  const roundId = randomUUID();
  const tasks: Task[] = [];

  for (let i = 0; i < numTasks; i++) {
    tasks.push(generateSingleTask(level));
  }

  return { roundId, tasks };
}
