// src/lib/game/state.ts
"use client";

import type { GeneratedRound } from "@/features/math/tasks/types";
import type { RoundOutcome } from "@/core/progress";
import { nextLevel } from "@/core/progress";

export type GamePhase = "question" | "feedback" | "summary" | "loading";
export type GameMode = 'mixed' | 'add' | 'sub' | 'mul';

export type GameState = {
  level: number;
  phase: GamePhase;
  round: GeneratedRound;
  currentIndex: number;
  answer: string;
  correctCount: number;
  lastCorrect: boolean | null;
  lastOutcome: RoundOutcome | null;
  error?: string | null;
  settingsOpen?: boolean;
  roundLength: number;
  mode: GameMode;
  autoAdvance: boolean;
};

type PersistedGameSubset = Pick<
  GameState,
  | "level"
  | "phase"
  | "round"
  | "currentIndex"
  | "answer"
  | "correctCount"
  | "lastCorrect"
  | "lastOutcome"
  | "roundLength"
  | "mode"
  | "autoAdvance"
>;

export function isValidPersistedState(value: PersistedGameSubset | null | undefined): value is PersistedGameSubset {
  if (!value) return false;
  if (!value.round || !Array.isArray(value.round.tasks) || value.round.tasks.length === 0) return false;
  if (!Number.isFinite(value.level) || value.level < 1) return false;
  if (!Number.isFinite(value.roundLength) || value.roundLength < 1) return false;
  return true;
}

export type GameAction =
  | { type: "SET_ANSWER"; value: string }
  | { type: "SUBMIT" }
  | { type: "NEXT" }
  | { type: "NEW_ROUND_REQUEST" }
  | { type: "NEW_ROUND_SUCCESS"; round: GeneratedRound }
  | { type: "NEW_ROUND_FAILURE"; error: string }
  | { type: "OPEN_SETTINGS" }
  | { type: "CLOSE_SETTINGS" }
  | { type: "APPLY_SETTINGS"; level: number; roundLength: number }
  | { type: "SET_LAST_OUTCOME"; outcome: RoundOutcome }
  | { type: "SET_MODE"; mode: GameMode }
  | {
      type: "LOAD_SAVED_GAME";
      state: PersistedGameSubset;
    };
  | { type: "SET_AUTO_ADVANCE"; value: boolean };

export function initGameState(level: number, round: GeneratedRound, mode: GameMode = 'mixed'): GameState {
  return {
    level,
    phase: "question",
    round,
    currentIndex: 0,
    answer: "",
    correctCount: 0,
    lastCorrect: null,
    lastOutcome: null,
    error: null,
    settingsOpen: false,
    roundLength: round.tasks.length || 10,
    mode,
    autoAdvance: true,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_ANSWER": {
      return { ...state, answer: action.value };
    }

    case "SUBMIT": {
      const trimmed = state.answer.trim();
      if (trimmed === "") return state; // ignore empty submits

      const given = Number(trimmed);
      const task = state.round.tasks[state.currentIndex];
      const ok = !Number.isNaN(given) && given === task.correctAnswer;
      return {
        ...state,
        phase: "feedback",
        lastCorrect: ok,
        correctCount: ok ? state.correctCount + 1 : state.correctCount,
      };
    }

    case "NEXT": {
      const totalTasks = state.round.tasks.length;
      const isLast = state.currentIndex >= totalTasks - 1;
      if (!isLast) {
        return {
          ...state,
          currentIndex: state.currentIndex + 1,
          answer: "",
          lastCorrect: null,
          phase: "question",
        };
      }

      const outcome: RoundOutcome = {
        correct: state.correctCount,
        total: totalTasks,
      };
      const newLevel = nextLevel(state.level, outcome);

      return {
        ...state,
        phase: "summary",
        level: newLevel,
        lastOutcome: outcome,
      };
    }

    case "NEW_ROUND_REQUEST": {
      return {
        ...state,
        phase: "loading",
        currentIndex: 0,
        answer: "",
        correctCount: 0,
        lastCorrect: null,
        lastOutcome: state.lastOutcome,
        error: null,
      };
    }

    case "NEW_ROUND_SUCCESS": {
      return {
        ...state,
        round: action.round,
        phase: "question",
      };
    }

    case "NEW_ROUND_FAILURE": {
      return {
        ...state,
        phase: "summary",
        error: action.error,
      };
    }

    case "OPEN_SETTINGS": {
      return { ...state, settingsOpen: true };
    }

    case "CLOSE_SETTINGS": {
      return { ...state, settingsOpen: false };
    }

    case "APPLY_SETTINGS": {
      return {
        ...state,
        level: action.level,
        roundLength: action.roundLength,
      };
    }

    case "SET_LAST_OUTCOME": {
      return { ...state, lastOutcome: action.outcome };
    }

    case "SET_MODE": {
      return { ...state, mode: action.mode };
    }

    case "LOAD_SAVED_GAME": {
      if (!isValidPersistedState(action.state)) {
        return state;
      }

      const totalTasks = action.state.round.tasks.length;
      const clampedIndex = Math.min(Math.max(action.state.currentIndex, 0), Math.max(totalTasks - 1, 0));
      const safePhase = action.state.phase === "feedback" ? "feedback" : "question";
      return {
        ...state,
        ...action.state,
        currentIndex: clampedIndex,
        phase: totalTasks > 0 ? safePhase : "question",
        answer: action.state.answer ?? "",
        settingsOpen: false,
        error: null,
      };
    case "SET_AUTO_ADVANCE": {
      return { ...state, autoAdvance: action.value };
    }

    default:
      return state;
  }
}

export const selectCurrentTask = (state: GameState) =>
  state.round.tasks[state.currentIndex];

export const selectTotals = (state: GameState) => ({
  totalTasks: state.round.tasks.length,
  questionNumber: state.currentIndex + 1,
});
