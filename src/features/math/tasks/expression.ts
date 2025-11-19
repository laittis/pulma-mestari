// src/features/math/tasks/expression.ts

export type OpToken = '+' | '-' | '×' | '÷' | '=';

export type NumberNode = { type: 'number'; value: number };
export type HoleNode = { type: 'hole'; id: string };
export type OperatorNode = { type: 'op'; op: OpToken };

export type ExprNode = NumberNode | HoleNode | OperatorNode;

// An expression statement is a sequence like: 1 + 2 + 3 = ?
export type ExpressionStatement = ExprNode[];

// Result for evaluation may be number-only for now
export type Evaluation = {
  correctAnswer: number;
};

