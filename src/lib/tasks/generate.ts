// src/lib/tasks/generate.ts
import { randomUUID } from 'crypto';
import type { GeneratedRound, Task, Operation, AnswerTarget } from './types';

function randomInt(min: number, max: number): number {
  // [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick operation based on grade level -- dummy-ish but fine for POC
function pickOp(grade: number): Operation {
  if (grade <= 2) return 'add';
  if (grade <= 3) return Math.random() < 0.7 ? 'add' : 'sub';
  // 4+ -> add/sub/mul
  const r = Math.random();
  if (r < 0.4) return 'add';
  if (r < 0.8) return 'sub';
  return 'mul';
}

function computeResult(a: number, b: number, op: Operation): number {
  if (op === 'add') return a + b;
  if (op === 'sub') return a - b;
  if (op === 'mul') return a * b;
  // div ei käytössä vielä, mutta täytetään:
  return Math.floor(a / (b || 1));
}

function pickTarget(grade: number): AnswerTarget {
  // 1–2 lk: aina vastataan tulokseen: 2 + 3 = __
  if (grade <= 2) return 'result';

  // 3 lk alkaen: välillä tulos, välillä vasen/oikea puoli
  const r = Math.random();
  if (r < 0.5) return 'result';
  if (r < 0.75) return 'a';
  return 'b';
}

function generateSingleTask(grade: number): Task {
  const op = pickOp(grade);
  let a = 0;
  let b = 0;

  if (op === 'add') {
    const max = grade <= 2 ? 20 : 100;
    a = randomInt(0, max);
    b = randomInt(0, max);
  } else if (op === 'sub') {
    const max = grade <= 2 ? 20 : 100;
    a = randomInt(0, max);
    b = randomInt(0, a); // ei negatiivista tulosta
  } else {
    // mul
    const max = grade <= 3 ? 10 : 15;
    a = randomInt(0, max);
    b = randomInt(0, max);
  }

  const result = computeResult(a, b, op);
  const target = pickTarget(grade);

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

export function generateRound(grade: number, numTasks: number = 10): GeneratedRound {
  const roundId = randomUUID();
  const tasks: Task[] = [];

  for (let i = 0; i < numTasks; i++) {
    tasks.push(generateSingleTask(grade));
  }

  return { roundId, tasks };
}

