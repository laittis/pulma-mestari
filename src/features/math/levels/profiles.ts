// src/features/math/levels/profiles.ts
import type { Operation } from "@/features/math/tasks/types";
import type { LevelConfig, LevelDefinition } from "@/features/math/levels/schema";
import rawConfig from "@/features/math/levels/config.json" assert { type: 'json' };

export type TargetWeights = { result: number; a: number; b: number };

export type LevelProfile = {
  level: number;
  allowedOps: Operation[];
  addMax: number;
  subMax: number;
  mulMax: number;
  divMax: number;
  targetWeights: TargetWeights;
  // keep patterns around for future use
  patterns?: LevelDefinition["patterns"];
  exprChance: number;
  totalMax?: number;
};

const cfg = rawConfig as LevelConfig;

function buildProfile(def: LevelDefinition): LevelProfile {
  return {
    level: def.level,
    allowedOps: def.ops,
    addMax: def.ranges.addMax,
    subMax: def.ranges.subMax,
    mulMax: def.ranges.mulMax,
    divMax: def.ranges.divMax,
    targetWeights: def.targetWeights,
    patterns: def.patterns,
    exprChance: def.exprChance ?? 0.4,
    totalMax: def.totalMax,
  };
}

export function getProfile(level: number): LevelProfile {
  const list = cfg.levels.slice().sort((a, b) => a.level - b.level);
  if (list.length === 0) {
    // fallback minimal profile
    return {
      level: 1,
      allowedOps: ["add"],
      addMax: 10,
      subMax: 0,
      mulMax: 0,
      divMax: 0,
      targetWeights: { result: 1, a: 0, b: 0 },
      exprChance: 0.3,
    };
  }
  const min = list[0].level;
  const max = list[list.length - 1].level;
  const clamped = Math.max(min, Math.min(max, level));
  const found = list.find((d) => d.level === clamped) ?? list[0];
  return buildProfile(found);
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
