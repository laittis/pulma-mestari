// src/features/math/levels/schema.ts
import type { Operation } from "@/features/math/tasks/types";

export type HolePolicy =
  | "resultOnly"
  | "oneOperand"
  | "resultOrOneOperand";

export type Pattern =
  | {
      kind: "sum" | "sumdiff" | "mixed";
      minTerms: number; // e.g., 2
      maxTerms: number; // e.g., 5
      holes: HolePolicy;
    };

export type LevelDefinition = {
  level: number;
  ops: Operation[];
  ranges: { addMax: number; subMax: number; mulMax: number; divMax: number };
  targetWeights: { result: number; a: number; b: number };
  patterns?: Pattern[];
  exprChance?: number; // 0..1 chance to prefer expression tasks when patterns exist
  totalMax?: number;   // optional cap for expression total (e.g., <= 20)
};

export type LevelConfig = { levels: LevelDefinition[] };
