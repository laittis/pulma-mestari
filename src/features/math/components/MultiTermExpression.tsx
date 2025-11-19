// src/features/math/components/MultiTermExpression.tsx
'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ExpressionTask } from '@/features/math/tasks/types';
import type { ExprNode, NumberNode, OperatorNode, HoleNode } from '@/features/math/tasks/expression';

type Phase = 'question' | 'feedback';

type Props = {
  task: ExpressionTask;
  value: string;
  onChange: (value: string) => void;
  phase: Phase;
  onEnter?: () => void;
};

function isHole(node: ExprNode): node is HoleNode {
  return node.type === 'hole';
}
function isNumber(node: ExprNode): node is NumberNode {
  return node.type === 'number';
}
function isOp(node: ExprNode): node is OperatorNode {
  return node.type === 'op';
}

export function MultiTermExpression({ task, value, onChange, phase, onEnter }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const nodes = task.tokens;

  const holeIndex = useMemo(() => nodes.findIndex(isHole), [nodes]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [phase, task.id]);

  return (
    <div className="flex items-center gap-2 text-[26px] flex-wrap justify-center">
      {nodes.map((node, idx) => {
        if (isNumber(node)) {
          return (
            <span key={idx} className="min-w-[20px] text-center">
              {node.value}
            </span>
          );
        }
        if (isOp(node)) {
          return (
            <span key={idx} className="min-w-[20px] text-center">
              {node.op}
            </span>
          );
        }
        // hole
        return (
          <span key={idx} className="min-w-[40px] text-center inline-block">
            {phase === 'feedback' ? (
              <span>{task.correctAnswer}</span>
            ) : (
              <input
                ref={idx === holeIndex ? inputRef : undefined}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onEnter && !e.repeat) onEnter();
                }}
                aria-label="Vastaus"
                className="px-2 py-1 text-[22px] w-[90px] rounded-lg border-2 border-gray-300 outline-none text-center bg-white"
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
