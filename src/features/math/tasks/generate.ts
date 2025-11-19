// src/features/math/tasks/generate.ts
import { randomUUID } from 'crypto';
import type { GeneratedRound, Task, Operation, AnswerTarget, AnswerSpec } from './types';
import { computeResult } from './utils';
import { getProfile, pickOpFromProfile, pickTargetFromWeights } from '@/features/math/levels/profiles';
import type { ExpressionStatement } from './expression';

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

function maybeGenerateExpression(level: number): Task | null {
  const prof = getProfile(level);
  const patterns = prof.patterns ?? [];
  if (patterns.length === 0) return null;

  // chance to generate expression when patterns exist
  if (Math.random() > (prof.exprChance ?? 0.4)) return null;

  const pat = patterns[Math.floor(Math.random() * patterns.length)];
  const minT = Math.max(2, pat.minTerms);
  const maxT = Math.max(minT, pat.maxTerms);
  const terms = Math.floor(Math.random() * (maxT - minT + 1)) + minT;

  // For now support sum/sumdiff/mixed as + and - only
  function tryBuild(): { nums: number[]; ops: ('+' | '-')[]; total: number } | null {
    const nums: number[] = [];
    for (let i = 0; i < terms; i++) {
      const max = Math.max(1, Math.min(prof.addMax || 10, 100));
      nums.push(Math.floor(Math.random() * (max + 1)));
    }
    const ops: ('+' | '-')[] = [];
    for (let i = 0; i < terms - 1; i++) {
      if (pat.kind === 'sum') ops.push('+');
      else if (pat.kind === 'sumdiff' || pat.kind === 'mixed') ops.push(Math.random() < 0.7 ? '+' : '-');
      else ops.push('+');
    }

    let total = nums[0] || 0;
    for (let i = 0; i < ops.length; i++) {
      total = ops[i] === '+' ? total + (nums[i + 1] || 0) : total - (nums[i + 1] || 0);
      // enforce non-negative running total on early levels
      if (level <= 3 && total < 0) return null;
    }
    if (prof.totalMax !== undefined) {
      if (total < 0 || total > prof.totalMax) return null;
    }
    return { nums, ops, total };
  }

  let built: { nums: number[]; ops: ('+' | '-')[]; total: number } | null = null;
  for (let attempt = 0; attempt < 25 && !built; attempt++) {
    built = tryBuild();
  }
  if (!built) return null;
  const { nums, ops, total } = built;

  const makeTokens = (holeAtResult: boolean, holeIndex: number | null): ExpressionStatement => {
    const tokens: ExpressionStatement = [];
    // LHS
    for (let i = 0; i < terms; i++) {
      if (holeIndex === i) tokens.push({ type: 'hole', id: `h${i}` });
      else tokens.push({ type: 'number', value: nums[i] });
      if (i < ops.length) tokens.push({ type: 'op', op: ops[i] === '+' ? '+' : '-' });
    }
    // '='
    tokens.push({ type: 'op', op: '=' });
    if (holeAtResult) tokens.push({ type: 'hole', id: 'hr' });
    else tokens.push({ type: 'number', value: total });
    return tokens;
  };

  let correctAnswer = total;
  let tokens: ExpressionStatement;
  let answer: AnswerSpec = { kind: 'result' };
  if (pat.holes === 'resultOnly') {
    tokens = makeTokens(true, null);
    answer = { kind: 'result' };
  } else if (pat.holes === 'oneOperand') {
    const idx = Math.floor(Math.random() * terms);
    correctAnswer = nums[idx];
    tokens = makeTokens(false, idx);
    answer = { kind: 'operand', operandIndex: idx };
  } else {
    // resultOrOneOperand
    if (Math.random() < 0.5) {
      tokens = makeTokens(true, null);
      correctAnswer = total;
      answer = { kind: 'result' };
    } else {
      const idx = Math.floor(Math.random() * terms);
      correctAnswer = nums[idx];
      tokens = makeTokens(false, idx);
      answer = { kind: 'operand', operandIndex: idx };
    }
  }

  return {
    kind: 'expression',
    id: crypto.randomUUID(),
    tokens,
    correctAnswer,
    answer,
  };
}

function generateSingleTask(level: number): Task {
  const maybeExpr = maybeGenerateExpression(level);
  if (maybeExpr) return maybeExpr;
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
  const answer: AnswerSpec =
    target === 'result' ? { kind: 'result' } : { kind: 'operand', operandIndex: target === 'a' ? 0 : 1 };

  let correctAnswer = result;
  if (target === 'a') correctAnswer = a;
  if (target === 'b') correctAnswer = b;

  return {
    kind: 'binary',
    id: randomUUID(),
    a,
    b,
    op,
    correctAnswer,
    target,
    answer,
  } as Task;
}

export function generateRound(level: number, numTasks: number = 10): GeneratedRound {
  const roundId = randomUUID();
  const tasks: Task[] = [];

  for (let i = 0; i < numTasks; i++) {
    tasks.push(generateSingleTask(level));
  }

  return { roundId, tasks };
}
