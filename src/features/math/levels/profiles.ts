// src/features/math/levels/profiles.ts
import type { Operation } from "@/features/math/tasks/types";

export type TargetWeights = { result: number; a: number; b: number };

export type LevelProfile = {
  level: number;
  allowedOps: Operation[];
  addMax: number;
  subMax: number;
  mulMax: number;
  divMax: number;
  targetWeights: TargetWeights;
};

const profiles: Record<number, LevelProfile> = {
  1: {
    level: 1,
    allowedOps: ["add"],
    addMax: 10,
    subMax: 0,
    mulMax: 0,
    divMax: 0,
    targetWeights: { result: 1, a: 0, b: 0 },
  },
  2: {
    level: 2,
    allowedOps: ["add", "sub"],
    addMax: 20,
    subMax: 20,
    mulMax: 0,
    divMax: 0,
    targetWeights: { result: 1, a: 0, b: 0 },
  },
  3: {
    level: 3,
    allowedOps: ["add", "sub"],
    addMax: 100,
    subMax: 100,
    mulMax: 0,
    divMax: 0,
    targetWeights: { result: 0.8, a: 0.1, b: 0.1 },
  },
  4: {
    level: 4,
    allowedOps: ["add", "sub", "mul"],
    addMax: 100,
    subMax: 100,
    mulMax: 10,
    divMax: 0,
    targetWeights: { result: 0.75, a: 0.125, b: 0.125 },
  },
  5: {
    level: 5,
    allowedOps: ["add", "sub", "mul"],
    addMax: 100,
    subMax: 100,
    mulMax: 12,
    divMax: 0,
    targetWeights: { result: 0.7, a: 0.15, b: 0.15 },
  },
  6: {
    level: 6,
    allowedOps: ["add", "sub", "mul", "div"],
    addMax: 100,
    subMax: 100,
    mulMax: 12,
    divMax: 12,
    targetWeights: { result: 0.6, a: 0.2, b: 0.2 },
  },
};

export function getProfile(level: number): LevelProfile {
  if (level <= 1) return profiles[1];
  if (level >= 6) return profiles[6];
  return profiles[level as 2 | 3 | 4 | 5];
}

export function pickOpFromProfile(level: number): Operation {
  const prof = getProfile(level);
  const ops = prof.allowedOps;
  return ops[Math.floor(Math.random() * ops.length)];
}

export function pickTargetFromWeights(weights: TargetWeights): "result" | "a" | "b" {
  const r = Math.random();
  const { result, a } = weights;
  if (r < result) return "result";
  if (r < result + a) return "a";
  return "b";
}

