// src/features/math/components/TaskRenderer.tsx
'use client';

import { MultiTermExpression } from '@/features/math/components/MultiTermExpression';
import type { BinaryTask, ExpressionTask, Task } from '@/features/math/tasks/types';
import type { ExpressionStatement } from '@/features/math/tasks/expression';
import { computeResult } from '@/features/math/tasks/utils';

type Phase = 'question' | 'feedback';

type Props = {
  task: Task;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  phase: Phase;
};

function tokensFromBinary(t: BinaryTask): ExpressionStatement {
  const tokens: ExpressionStatement = [];
  const opMap: Record<string, '+' | '-' | '×' | '÷'> = { add: '+', sub: '-', mul: '×', div: '÷' } as const;
  const lhs: Array<{ hole: boolean; value: number }> = [
    { hole: t.answer.kind === 'operand' && t.answer.operandIndex === 0, value: t.a },
    { hole: t.answer.kind === 'operand' && t.answer.operandIndex === 1, value: t.b },
  ];
  // left operand
  tokens.push(lhs[0].hole ? { type: 'hole', id: 'ha' } : { type: 'number', value: lhs[0].value });
  // operator
  tokens.push({ type: 'op', op: opMap[t.op] });
  // right operand
  tokens.push(lhs[1].hole ? { type: 'hole', id: 'hb' } : { type: 'number', value: lhs[1].value });
  // equals
  tokens.push({ type: 'op', op: '=' });
  // rhs
  if (t.answer.kind === 'result') tokens.push({ type: 'hole', id: 'hr' });
  else tokens.push({ type: 'number', value: computeResult(t.a, t.b, t.op) });
  return tokens;
}

export function TaskRenderer({ task, value, onChange, onEnter, phase }: Props) {
  const expr: ExpressionTask =
    task.kind === 'expression'
      ? task
      : {
          kind: 'expression',
          id: task.id,
          tokens: tokensFromBinary(task as BinaryTask),
          correctAnswer: (task as BinaryTask).correctAnswer,
          answer: (task as BinaryTask).answer,
        };

  return (
    <MultiTermExpression
      task={expr}
      value={value}
      onChange={onChange}
      onEnter={onEnter}
      phase={phase}
    />
  );
}
