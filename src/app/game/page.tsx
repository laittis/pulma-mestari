// src/app/game/page.tsx
import GameClient from '@/features/math/components/GameClient';
import { generateRound } from '@/features/math/tasks/generate';
import type { GeneratedRound } from '@/features/math/tasks/types';

export default function GamePage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const initialLevel = 1;
  const modeParam = (typeof searchParams?.mode === 'string' ? searchParams?.mode : 'mixed').toLowerCase();
  const initialMode: 'mixed' | 'add' | 'sub' | 'mul' =
    modeParam === 'add' || modeParam === 'sub' || modeParam === 'mul' ? (modeParam as 'add' | 'sub' | 'mul') : 'mixed';
  const initialRound: GeneratedRound = generateRound(initialLevel, 10, { mode: initialMode });

  return <GameClient initialLevel={initialLevel} initialRound={initialRound} initialMode={initialMode} />;
}
