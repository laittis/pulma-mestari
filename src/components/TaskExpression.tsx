// src/components/TaskExpression.tsx
'use client';

import type { Task } from '@/lib/tasks/types';

type Phase = 'question' | 'feedback';

type Props = {
  task: Task;
  value: string;
  onChange: (value: string) => void;
  phase: Phase;
};

function opChar(op: Task['op']): string {
  if (op === 'add') return '+';
  if (op === 'sub') return '-';
  if (op === 'mul') return '×';
  if (op === 'div') return '÷';
  return '?';
}

function computeResult(task: Task): number {
  const { a, b, op } = task;
  if (op === 'add') return a + b;
  if (op === 'sub') return a - b;
  if (op === 'mul') return a * b;
  return Math.floor(a / (b || 1));
}

export function TaskExpression({ task, value, onChange, phase }: Props) {
  const symbol = opChar(task.op);
  const result = computeResult(task);

  const inputField = (
    <input
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '6px 8px',
        fontSize: 22,
        width: 90,
        borderRadius: 8,
        border: '2px solid #d1d5db',
        outline: 'none',
        textAlign: 'center',
        background: '#ffffff',
      }}
    />
  );

  // Jos haetaan tulosta (result), näytetään vasta feedback-vaiheessa.
  // Jos haetaan operandia (a tai b), tulos näkyy heti (61 + __ = 70).
  const showResult =
    task.target === 'result'
      ? phase === 'feedback'
      : true;

  const resultSpan = (
    <span style={{ minWidth: 40, textAlign: 'center' }}>
      {showResult ? result : ' '}
    </span>
  );

  if (task.target === 'a') {
    return (
      <>
        {inputField}
        <span>{symbol}</span>
        <span>{task.b}</span>
        <span>=</span>
        {resultSpan}
      </>
    );
  }

  if (task.target === 'b') {
    return (
      <>
        <span>{task.a}</span>
        <span>{symbol}</span>
        {inputField}
        <span>=</span>
        {resultSpan}
      </>
    );
  }

  // target === 'result'
  return (
    <>
      <span>{task.a}</span>
      <span>{symbol}</span>
      <span>{task.b}</span>
      <span>=</span>
      {inputField}
    </>
  );
}

