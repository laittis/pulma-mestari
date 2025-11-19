// src/features/math/tasks/types.ts

export type Operation = 'add' | 'sub' | 'mul' | 'div';
export type AnswerTarget = 'a' | 'b' | 'result';

export type Task = {
  id: string;
  a: number;
  b: number;
  op: Operation;

  correctAnswer: number;

  target: AnswerTarget;
};

export type GeneratedRound = {
  roundId: string;
  tasks: Task[];
};

