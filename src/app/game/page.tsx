// src/app/game/page.tsx
import GameClient from '@/features/math/components/GameClient';
import { generateRound } from '@/features/math/tasks/generate';
import type { GeneratedRound } from '@/features/math/tasks/types';

export default function GamePage() {
  const initialLevel = 1;
  const initialRound: GeneratedRound = generateRound(initialLevel, 10);

  return <GameClient initialLevel={initialLevel} initialRound={initialRound} />;
}
