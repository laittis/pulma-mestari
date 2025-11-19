// src/features/math/components/TaskExpression.tsx
'use client';

import { useEffect, useRef } from 'react';
import type { Task } from '@/features/math/tasks/types';
import { opChar, computeResult } from '@/features/math/tasks/utils';

type Phase = 'question' | 'feedback';

type Props = {
  task: Task;
  value: string;
  onChange: (value: string) => void;
  phase: Phase;
  onEnter?: () => void;
};

function taskResult(task: Task): number {
  const { a, b, op } = task;
  return computeResult(a, b, op);
}

export function TaskExpression({ task, value, onChange, phase, onEnter }: Props) {
  const symbol = opChar(task.op);
  const result = taskResult(task);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [phase, task.id]);

  const inputField = (
    <input
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onEnter && !e.repeat) onEnter();
      }}
      ref={inputRef}
      className="px-2 py-1 text-[22px] w-[90px] rounded-lg border-2 border-gray-300 outline-none text-center bg-white"
    />
  );

  // Jos haetaan tulosta (result), näytetään vasta feedback-vaiheessa.
  // Jos haetaan operandia (a tai b), tulos näkyy heti (61 + __ = 70).
  const showResult =
    task.target === 'result'
      ? phase === 'feedback'
      : true;

  const resultSpan = (
    <span className="min-w-[40px] text-center inline-block">
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
