// src/components/GameClient.tsx
'use client';

import { useState } from 'react';
import { nextGrade } from '@/lib/game/difficulty';
import type { GeneratedRound, Task } from '@/lib/tasks/types';
import { TaskExpression } from '@/components/TaskExpression';

type GamePhase = 'question' | 'feedback' | 'summary' | 'loading';

type Props = {
  initialGrade: number;
  initialRound: GeneratedRound;
};

export default function GameClient({ initialGrade, initialRound }: Props) {
  const [grade, setGrade] = useState<number>(initialGrade);
  const [phase, setPhase] = useState<GamePhase>('question');
  const [round, setRound] = useState<GeneratedRound>(initialRound);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [lastOutcome, setLastOutcome] = useState<{ correct: number; total: number } | null>(null);

  const currentTask: Task = round.tasks[currentIndex];
  const totalTasks = round.tasks.length;
  const questionNumber = currentIndex + 1;
  const isCorrect = lastCorrect === true;

  const handleSubmit = () => {
    const trimmed = answer.trim();
    if (trimmed === '') return;

    const given = Number(trimmed);
    const ok = !Number.isNaN(given) && given === currentTask.correctAnswer;

    if (ok) {
      setCorrectCount(c => c + 1);
    }

    setLastCorrect(ok);
    setPhase('feedback');
  };

  const handleNext = () => {
    if (currentIndex < totalTasks - 1) {
      setCurrentIndex(i => i + 1);
      setAnswer('');
      setLastCorrect(null);
      setPhase('question');
    } else {
      // kierros loppuu
      const outcome = { correct: correctCount, total: totalTasks };
      const newGrade = nextGrade(grade, outcome);

      setLastOutcome(outcome);
      setGrade(newGrade);
      setPhase('summary');
    }
  };

  const handleNewRound = async () => {
    setPhase('loading');
    setCurrentIndex(0);
    setAnswer('');
    setCorrectCount(0);
    setLastCorrect(null);

    const res = await fetch(`/api/tasks/new?grade=${grade}`);
    const json = (await res.json()) as GeneratedRound;
    setRound(json);
    setPhase('question');
  };

  if (phase === 'loading') {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#e5e7eb',
          color: '#111827',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div>Haetaan uutta kierrosta…</div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '24px',
        background: '#e5e7eb',
        color: '#111827',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          padding: '24px 20px 20px',
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        }}
      >
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>PikkuMatikka</h1>
          <p style={{ margin: '4px 0 0', color: '#4b5563', fontSize: 14 }}>
            Luokka {grade} ·{' '}
            {phase === 'summary'
              ? 'Kierros valmis'
              : `Tehtävä ${questionNumber} / ${totalTasks}`}
          </p>
          {lastOutcome && phase === 'summary' && (
            <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 12 }}>
              Edellinen tulos: {lastOutcome.correct} / {lastOutcome.total}
            </p>
          )}
        </header>

        {phase === 'summary' ? (
          <>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: '#f3f4f6',
                marginBottom: 16,
              }}
            >
              <p style={{ margin: 0, fontSize: 18 }}>
                Kierros valmis! Tulos:{' '}
                <strong>
                  {correctCount} / {totalTasks}
                </strong>
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#4b5563' }}>
                Uusi taso seuraavalle kierrokselle: luokka {grade}
              </p>
            </div>
            <button
              type="button"
              onClick={handleNewRound}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 18,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: '#2563eb',
                color: '#ffffff',
              }}
            >
              Uusi kierros
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                marginBottom: 16,
                padding: '14px 12px',
                borderRadius: 16,
                background:
                  phase === 'feedback'
                    ? isCorrect
                      ? '#dcfce7'
                      : '#fee2e2'
                    : '#f9fafb',
                border:
                  phase === 'feedback'
                    ? isCorrect
                      ? '2px solid #16a34a'
                      : '2px solid #dc2626'
                    : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 26,
              }}
            >
              <TaskExpression
                task={currentTask}
                value={answer}
                onChange={setAnswer}
                phase={phase === 'question' ? 'question' : 'feedback'}
              />
            </div>

            {phase === 'feedback' && (
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: 18,
                  color: isCorrect ? '#15803d' : '#b91c1c',
                  textAlign: 'center',
                }}
              >
                {isCorrect
                  ? 'Hienoa, meni oikein!'
                  : `Melkein! Oikea vastaus: ${currentTask.correctAnswer}`}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              {phase === 'question' ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    fontSize: 18,
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    background: '#22c55e',
                    color: '#ffffff',
                  }}
                >
                  Vastaa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    fontSize: 18,
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    background: '#2563eb',
                    color: '#ffffff',
                  }}
                >
                  Seuraava
                </button>
              )}

              <button
                type="button"
                onClick={handleNewRound}
                style={{
                  padding: '10px 12px',
                  fontSize: 14,
                  borderRadius: 999,
                  border: '1px solid #9ca3af',
                  cursor: 'pointer',
                  background: '#ffffff',
                  color: '#374151',
                  minWidth: 110,
                }}
              >
                Aloita alusta
              </button>
            </div>

            <p style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>
              Oikein tähän mennessä: {correctCount} / {questionNumber - 1}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

