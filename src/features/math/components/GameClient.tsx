// src/features/math/components/GameClient.tsx
'use client';

import { useEffect, useReducer, useRef } from 'react';
import Link from 'next/link';
import type { GeneratedRound } from '@/features/math/tasks/types';
import { TaskRenderer } from '@/features/math/components/TaskRenderer';
import { gameReducer, initGameState, selectCurrentTask, selectTotals } from '@/core/state';
import { recordRound } from '@/core/stats';
import { GameHeader } from '@/features/math/components/GameHeader';
import { TaskPanel } from '@/features/math/components/TaskPanel';
import { FeedbackText } from '@/features/math/components/FeedbackText';
import { SummaryPanel } from '@/features/math/components/SummaryPanel';
import { Controls } from '@/features/math/components/Controls';
import { SettingsPanel } from '@/features/math/components/SettingsPanel';
import { fetchRound } from '@/features/math/api/rounds';

type Props = {
  initialLevel: number;
  initialRound: GeneratedRound;
  initialMode?: 'mixed' | 'add' | 'sub' | 'mul';
};

export default function GameClient({ initialLevel, initialRound, initialMode = 'mixed' }: Props) {
  const [state, dispatch] = useReducer(
    gameReducer,
    initGameState(initialLevel, initialRound, initialMode)
  );

  const currentTask = selectCurrentTask(state);
  const { totalTasks, questionNumber } = selectTotals(state);
  const isCorrect = state.lastCorrect === true;

  const handleSubmit = () => {
    if (state.answer.trim() === '') return;
    dispatch({ type: 'SUBMIT' });
  };

  const handleNext = () => dispatch({ type: 'NEXT' });

  const handleNewRound = async () => {
    dispatch({ type: 'NEW_ROUND_REQUEST' });
    try {
      const round = await fetchRound(state.level, state.roundLength, state.mode);
      dispatch({ type: 'NEW_ROUND_SUCCESS', round });
    } catch (err: unknown) {
      dispatch({ type: 'NEW_ROUND_FAILURE', error: (err as Error).message });
    }
  };

  const handleOpenSettings = () => dispatch({ type: 'OPEN_SETTINGS' });
  const handleCloseSettings = () => dispatch({ type: 'CLOSE_SETTINGS' });
  const handleApplySettings = async ({ level, roundLength, mode }: { level: number; roundLength: number; mode: 'mixed' | 'add' | 'sub' | 'mul' }) => {
    dispatch({ type: 'APPLY_SETTINGS', level, roundLength });
    if (mode !== state.mode) {
      dispatch({ type: 'SET_MODE', mode });
    }
    dispatch({ type: 'CLOSE_SETTINGS' });
    // Fetch round using new settings directly to avoid stale state reads.
    dispatch({ type: 'NEW_ROUND_REQUEST' });
    try {
      const round = await fetchRound(level, roundLength, mode);
      dispatch({ type: 'NEW_ROUND_SUCCESS', round });
    } catch (err: unknown) {
      dispatch({ type: 'NEW_ROUND_FAILURE', error: (err as Error).message });
    }
  };

  // Persist settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pm.level', String(state.level));
      localStorage.setItem('pm.roundLength', String(state.roundLength));
      localStorage.setItem('pm.mode', state.mode);
    } catch {}
  }, [state.level, state.roundLength, state.mode]);

  // Hydrate settings from localStorage once on mount
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    (async () => {
      try {
        const l = localStorage.getItem('pm.level');
        const len = localStorage.getItem('pm.roundLength');
        const lo = localStorage.getItem('pm.lastOutcome');
        const m = localStorage.getItem('pm.mode');
        const level = l ? Number(l) : NaN;
        const roundLength = len ? Number(len) : NaN;
        const validLevel = Number.isFinite(level) && level >= 1 && level <= 99 ? level : state.level;
        const validLen = Number.isFinite(roundLength) && roundLength >= 5 && roundLength <= 30 ? roundLength : state.roundLength;
        const validMode = m === 'add' || m === 'sub' || m === 'mul' || m === 'mixed' ? m : state.mode;
        if (validLevel !== state.level || validLen !== state.roundLength) {
          void handleApplySettings({ level: validLevel, roundLength: validLen, mode: state.mode });
        }
        if (validMode !== state.mode) {
          dispatch({ type: 'SET_MODE', mode: validMode });
          // start a new round with same level/length, new mode
          dispatch({ type: 'NEW_ROUND_REQUEST' });
          try {
            const round = await fetchRound(state.level, state.roundLength, validMode);
            dispatch({ type: 'NEW_ROUND_SUCCESS', round });
          } catch (err: unknown) {
            dispatch({ type: 'NEW_ROUND_FAILURE', error: (err as Error).message });
          }
        }
        if (lo) {
          try {
            const parsed = JSON.parse(lo) as { correct: number; total: number };
            if (
              parsed &&
              typeof parsed.correct === 'number' &&
              typeof parsed.total === 'number'
            ) {
              dispatch({ type: 'SET_LAST_OUTCOME', outcome: parsed });
            }
          } catch {}
        }
      } catch {}
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist last outcome when summary appears
  useEffect(() => {
    if (state.phase === 'summary' && state.lastOutcome) {
      try {
        localStorage.setItem('pm.lastOutcome', JSON.stringify(state.lastOutcome));
      } catch {}
      // update stats store
      try {
        recordRound(state.level, state.lastOutcome);
      } catch {}
    }
  }, [state.phase, state.lastOutcome, state.level]);

  // Global Enter handler during feedback to advance quickly
  useEffect(() => {
    if (state.phase !== 'feedback') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.phase]);

  if (state.phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-200 text-gray-900">
        <div>Haetaan uutta kierrosta…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-start p-6 bg-gray-200 text-gray-900">
      <div className="bg-white rounded-2xl p-6 w-full max-w-[500px] shadow-lg">
        <div className="flex justify-end mb-2 gap-2">
          <Link
            href="/stats"
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
          >
            Tilastot
          </Link>
          <button
            type="button"
            onClick={handleOpenSettings}
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
          >
            Asetukset
          </button>
        </div>
        <GameHeader
          level={state.level}
          phase={state.phase}
          questionNumber={questionNumber}
          totalTasks={totalTasks}
          lastOutcome={state.lastOutcome}
        />

        {state.phase === 'summary' ? (
          <>
            <SummaryPanel
              correctCount={state.correctCount}
              totalTasks={totalTasks}
              nextLevel={state.level}
            />
            <button
              type="button"
              onClick={handleNewRound}
              className="w-full px-3 py-2 text-lg rounded-full border-0 cursor-pointer bg-blue-600 text-white"
            >
              Uusi kierros
            </button>
          </>
        ) : (
          <>
            <TaskPanel phase={state.phase} isCorrect={isCorrect}>
              <TaskRenderer
                task={currentTask}
                value={state.answer}
                onChange={(v) => dispatch({ type: 'SET_ANSWER', value: v })}
                onEnter={state.phase === 'question' ? handleSubmit : handleNext}
                phase={state.phase === 'question' ? 'question' : 'feedback'}
              />
            </TaskPanel>

            <FeedbackText
              phase={state.phase}
              isCorrect={isCorrect}
              correctAnswer={currentTask.correctAnswer}
            />

            <Controls
              phase={state.phase}
              canSubmit={state.answer.trim() !== ''}
              onSubmit={handleSubmit}
              onNext={handleNext}
              onRestart={handleNewRound}
            />

            <p className="mt-3 text-sm text-gray-500">
              Oikein tähän mennessä: {state.correctCount} / {questionNumber - 1}
            </p>
          </>
        )}

        <SettingsPanel
          key={`${String(!!state.settingsOpen)}-${state.level}-${state.roundLength}-${state.mode}`}
          open={!!state.settingsOpen}
          level={state.level}
          roundLength={state.roundLength}
          mode={state.mode}
          onClose={handleCloseSettings}
          onApply={handleApplySettings}
        />
      </div>
    </main>
  );
}
