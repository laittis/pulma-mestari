// src/features/math/components/GameClient.tsx
'use client';

import { useEffect, useReducer, useRef, useState, type MouseEvent } from 'react';
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
import { trackAnswer, trackRoundComplete, trackRoundStart } from '@/core/analytics';
import { CelebrationOverlay } from '@/features/math/components/CelebrationOverlay';

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

  const [userSettings, setUserSettings] = useState({
    preferredLevel: initialLevel,
    preferredMode: initialMode,
    defaultAutoAdvance: true,
  });

  const currentTask = selectCurrentTask(state);
  const { totalTasks, questionNumber } = selectTotals(state);
  const isCorrect = state.lastCorrect === true;

  const handleSubmit = () => {
    if (state.answer.trim() === '') return;
    try {
      const given = Number(state.answer.trim());
      const ok = !Number.isNaN(given) && given === currentTask.correctAnswer;
      trackAnswer({
        correct: ok,
        mode: state.mode,
        level: state.level,
        kind: currentTask.kind,
        index: state.currentIndex + 1,
      });
    } catch {}
    dispatch({ type: 'SUBMIT' });
  };

  const handleNext = () => dispatch({ type: 'NEXT' });

  const applyRoundOptions = async ({
    level,
    roundLength,
    mode,
    autoAdvanceDefault,
  }: {
    level: number;
    roundLength: number;
    mode: 'mixed' | 'add' | 'sub' | 'mul';
    autoAdvanceDefault?: boolean;
  }) => {
    dispatch({ type: 'APPLY_SETTINGS', level, roundLength });
    if (mode !== state.mode) {
      dispatch({ type: 'SET_MODE', mode });
    }
    const autoAdvanceValue = autoAdvanceDefault ?? userSettings.defaultAutoAdvance;
    dispatch({ type: 'SET_AUTO_ADVANCE', value: autoAdvanceValue });
    dispatch({ type: 'CLOSE_SETTINGS' });
    dispatch({ type: 'NEW_ROUND_REQUEST' });
    try {
      const round = await fetchRound(level, roundLength, mode);
      dispatch({ type: 'NEW_ROUND_SUCCESS', round });
    } catch (err: unknown) {
      dispatch({ type: 'NEW_ROUND_FAILURE', error: (err as Error).message });
    }
  };

  const handleNewRound = async () => {
    dispatch({ type: 'SET_AUTO_ADVANCE', value: userSettings.defaultAutoAdvance });
    dispatch({ type: 'NEW_ROUND_REQUEST' });
    try {
      const round = await fetchRound(state.level, state.roundLength, state.mode);
      dispatch({ type: 'NEW_ROUND_SUCCESS', round });
      trackRoundStart({ level: state.level, mode: state.mode, length: state.roundLength });
    } catch (err: unknown) {
      dispatch({ type: 'NEW_ROUND_FAILURE', error: (err as Error).message });
    }
  };

  const handleToggleSettings = () => dispatch({ type: state.settingsOpen ? 'CLOSE_SETTINGS' : 'OPEN_SETTINGS' });
  const handleCloseSettings = () => dispatch({ type: 'CLOSE_SETTINGS' });
  const handleAutoAdvanceChange = (value: boolean) => dispatch({ type: 'SET_AUTO_ADVANCE', value });
  const handleBackToMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    const hasActiveRound = state.phase === 'question' || state.phase === 'feedback';
    if (hasActiveRound && !window.confirm('Poistutaanko kierrokselta? Edistymistä ei tallenneta.')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const handleApplySettings = async ({
    userSettings: newUserSettings,
    roundOptions,
  }: {
    userSettings: { preferredLevel: number; preferredMode: 'mixed' | 'add' | 'sub' | 'mul'; defaultAutoAdvance: boolean };
    roundOptions: { level: number; roundLength: number; mode: 'mixed' | 'add' | 'sub' | 'mul' };
  }) => {
    setUserSettings(newUserSettings);
    if (state.autoAdvance !== newUserSettings.defaultAutoAdvance) {
      dispatch({ type: 'SET_AUTO_ADVANCE', value: newUserSettings.defaultAutoAdvance });
    }

    const userSettingsChanged =
      newUserSettings.preferredLevel !== userSettings.preferredLevel ||
      newUserSettings.preferredMode !== userSettings.preferredMode ||
      newUserSettings.defaultAutoAdvance !== userSettings.defaultAutoAdvance;

    const roundModeChanged = roundOptions.mode !== state.mode;
    const roundChanged =
      roundOptions.level !== state.level || roundOptions.roundLength !== state.roundLength || roundModeChanged;

    const nextRoundOptions = roundChanged
      ? roundOptions
      : { ...roundOptions, level: newUserSettings.preferredLevel, mode: newUserSettings.preferredMode };

    if (roundChanged || userSettingsChanged) {
      await applyRoundOptions({ ...nextRoundOptions, autoAdvanceDefault: newUserSettings.defaultAutoAdvance });
    } else {
      dispatch({ type: 'CLOSE_SETTINGS' });
    }
  };

  // Persist user settings
  useEffect(() => {
    try {
      localStorage.setItem('pm.user.preferredLevel', String(userSettings.preferredLevel));
      localStorage.setItem('pm.user.preferredMode', userSettings.preferredMode);
      localStorage.setItem('pm.user.defaultAutoAdvance', String(userSettings.defaultAutoAdvance));
    } catch {}
  }, [userSettings]);

  // Persist round options separately
  useEffect(() => {
    try {
      localStorage.setItem('pm.round.level', String(state.level));
      localStorage.setItem('pm.round.length', String(state.roundLength));
      localStorage.setItem('pm.round.mode', state.mode);
      localStorage.setItem('pm.round.autoAdvance', String(state.autoAdvance));
    } catch {}
  }, [state.level, state.roundLength, state.mode, state.autoAdvance]);

  // Hydrate settings from localStorage once on mount
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    (async () => {
      try {
        const preferredLevelRaw = localStorage.getItem('pm.user.preferredLevel') ?? localStorage.getItem('pm.level');
        const preferredModeRaw = localStorage.getItem('pm.user.preferredMode') ?? localStorage.getItem('pm.mode');
        const preferredAutoAdvanceRaw = localStorage.getItem('pm.user.defaultAutoAdvance') ?? localStorage.getItem('pm.autoAdvance');
        const lastOutcomeRaw = localStorage.getItem('pm.lastOutcome');

        const parsedPreferredLevel = preferredLevelRaw ? Number(preferredLevelRaw) : NaN;
        const parsedPreferredMode = preferredModeRaw as 'mixed' | 'add' | 'sub' | 'mul' | null;
        const parsedPreferredAutoAdvance = preferredAutoAdvanceRaw === 'true' || preferredAutoAdvanceRaw === 'false'
          ? preferredAutoAdvanceRaw === 'true'
          : null;

        const preferredLevel = Number.isFinite(parsedPreferredLevel) && parsedPreferredLevel >= 1 && parsedPreferredLevel <= 99
          ? parsedPreferredLevel
          : state.level;
        const preferredMode = parsedPreferredMode && ['mixed', 'add', 'sub', 'mul'].includes(parsedPreferredMode)
          ? parsedPreferredMode
          : state.mode;
        const defaultAutoAdvance = parsedPreferredAutoAdvance ?? state.autoAdvance;

        setUserSettings({ preferredLevel, preferredMode, defaultAutoAdvance });

        const roundLevelRaw = localStorage.getItem('pm.round.level') ?? localStorage.getItem('pm.level');
        const roundLengthRaw = localStorage.getItem('pm.round.length') ?? localStorage.getItem('pm.roundLength');
        const roundModeRaw = localStorage.getItem('pm.round.mode') ?? localStorage.getItem('pm.mode');
        const roundAutoAdvanceRaw = localStorage.getItem('pm.round.autoAdvance') ?? preferredAutoAdvanceRaw;

        const parsedRoundLevel = roundLevelRaw ? Number(roundLevelRaw) : NaN;
        const parsedRoundLength = roundLengthRaw ? Number(roundLengthRaw) : NaN;
        const parsedRoundMode = roundModeRaw as 'mixed' | 'add' | 'sub' | 'mul' | null;
        const parsedRoundAutoAdvance = roundAutoAdvanceRaw === 'true' || roundAutoAdvanceRaw === 'false'
          ? roundAutoAdvanceRaw === 'true'
          : defaultAutoAdvance;

        const validRoundLevel = Number.isFinite(parsedRoundLevel) && parsedRoundLevel >= 1 && parsedRoundLevel <= 99
          ? parsedRoundLevel
          : preferredLevel;
        const validRoundLength = Number.isFinite(parsedRoundLength) && parsedRoundLength >= 5 && parsedRoundLength <= 30
          ? parsedRoundLength
          : state.roundLength;
        const validRoundMode = parsedRoundMode && ['mixed', 'add', 'sub', 'mul'].includes(parsedRoundMode)
          ? parsedRoundMode
          : preferredMode;

        const shouldUpdateRoundSettings =
          validRoundLevel !== state.level || validRoundLength !== state.roundLength || validRoundMode !== state.mode;

        if (parsedRoundAutoAdvance !== state.autoAdvance) {
          dispatch({ type: 'SET_AUTO_ADVANCE', value: parsedRoundAutoAdvance });
        }

        if (shouldUpdateRoundSettings) {
          await applyRoundOptions({
            level: validRoundLevel,
            roundLength: validRoundLength,
            mode: validRoundMode,
            autoAdvanceDefault: parsedRoundAutoAdvance,
          });
        }

        if (lastOutcomeRaw) {
          try {
            const parsed = JSON.parse(lastOutcomeRaw) as { correct: number; total: number };
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
      trackRoundComplete({
        level: state.level,
        mode: state.mode,
        correct: state.lastOutcome.correct,
        total: state.lastOutcome.total,
      });
    }
  }, [state.phase, state.lastOutcome, state.level, state.mode]);

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

  // Auto-advance after brief delay on feedback (dopamine feedback)
  useEffect(() => {
    if (state.phase !== 'feedback' || !state.autoAdvance) return;
    const delay = state.lastCorrect ? 800 : 1400; // shorter when correct
    const t = setTimeout(() => {
      handleNext();
    }, delay);
    return () => clearTimeout(t);
  }, [state.phase, state.lastCorrect, state.autoAdvance]);

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
        <CelebrationOverlay show={state.phase === 'feedback' && isCorrect} kind={isCorrect ? 'success' : 'error'} />
        <div className="flex justify-end mb-2 gap-2">
          <Link
            href="/"
            onClick={handleBackToMenu}
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
          >
            Takaisin päävalikkoon
          </Link>
          <Link
            href="/stats"
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
          >
            Tilastot
          </Link>
          <button
            type="button"
            onClick={handleToggleSettings}
            className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700"
          >
            {state.settingsOpen ? 'Sulje' : 'Asetukset'}
          </button>
        </div>
        <GameHeader
          level={state.level}
          phase={state.phase}
          questionNumber={questionNumber}
          totalTasks={totalTasks}
          lastOutcome={state.lastOutcome}
          mode={state.mode}
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
            {state.phase === 'question' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <TaskPanel phase={state.phase} isCorrect={isCorrect}>
                  <TaskRenderer
                    task={currentTask}
                    value={state.answer}
                    onChange={(v) => dispatch({ type: 'SET_ANSWER', value: v })}
                    onEnter={undefined}
                    phase="question"
                  />
                </TaskPanel>
                <Controls
                  phase={state.phase}
                  canSubmit={state.answer.trim() !== ''}
                  onSubmit={handleSubmit}
                  onNext={handleNext}
                  onRestart={handleNewRound}
                  autoAdvance={state.autoAdvance}
                  onToggleAutoAdvance={handleAutoAdvanceChange}
                  submitType="submit"
                />
              </form>
            ) : (
              <>
                <TaskPanel phase={state.phase} isCorrect={isCorrect}>
                  <TaskRenderer
                    task={currentTask}
                    value={state.answer}
                    onChange={(v) => dispatch({ type: 'SET_ANSWER', value: v })}
                    onEnter={handleNext}
                    phase="feedback"
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
                  autoAdvance={state.autoAdvance}
                  onToggleAutoAdvance={handleAutoAdvanceChange}
                />
              </>
            )}

            <p className="mt-3 text-sm text-gray-500">
              Oikein tähän mennessä: {state.correctCount} / {questionNumber - 1}
            </p>
          </>
        )}

        <SettingsPanel
          key={`${String(!!state.settingsOpen)}-${state.level}-${state.roundLength}-${state.mode}-${userSettings.defaultAutoAdvance}-${userSettings.preferredLevel}-${userSettings.preferredMode}`}
          open={!!state.settingsOpen}
          roundOptions={{ level: state.level, roundLength: state.roundLength, mode: state.mode }}
          userSettings={userSettings}
          onClose={handleCloseSettings}
          onApply={handleApplySettings}
        />
      </div>
    </main>
  );
}
