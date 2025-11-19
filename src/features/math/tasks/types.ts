// src/features/math/tasks/types.ts

export type Operation = 'add' | 'sub' | 'mul' | 'div';
export type AnswerTarget = 'a' | 'b' | 'result';

// Binary task (legacy/simple)
export type BinaryTask = {
  kind: 'binary';
  id: string;
  a: number;
  b: number;
  op: Operation;
  correctAnswer: number;
  // legacy field kept for backward-compat; prefer `answer`
  target?: AnswerTarget;
  answer: AnswerSpec;
};

// Expression task (multi-term with a single hole somewhere)
import type { ExpressionStatement } from './expression';
export type ExpressionTask = {
  kind: 'expression';
  id: string;
  tokens: ExpressionStatement; // includes '=' and either a number or a hole on RHS
  correctAnswer: number; // value for the single hole
  answer: AnswerSpec; // where is the hole (result or operand index)
};

export type Task = BinaryTask | ExpressionTask;

export type GeneratedRound = {
  roundId: string;
  tasks: Task[];
};

export type AnswerKind = 'result' | 'operand';
export type AnswerSpec =
  | { kind: 'result' }
  | { kind: 'operand'; operandIndex: number };
