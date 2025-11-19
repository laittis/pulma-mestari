// src/features/math/tasks/utils.ts
import type { Operation } from "./types";

export function opChar(op: Operation): string {
  if (op === "add") return "+";
  if (op === "sub") return "-";
  if (op === "mul") return "×";
  if (op === "div") return "÷";
  return "?";
}

export function computeResult(a: number, b: number, op: Operation): number {
  if (op === "add") return a + b;
  if (op === "sub") return a - b;
  if (op === "mul") return a * b;
  // Integer-like division fallback (not used yet)
  return Math.floor(a / (b || 1));
}

