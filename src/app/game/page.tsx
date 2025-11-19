// src/app/game/page.tsx
import GameClient from '@/components/GameClient';
import { generateRound } from '@/lib/tasks/generate';
import type { GeneratedRound } from '@/lib/tasks/types';

export default function GamePage() {
  const initialGrade = 2;
  const initialRound: GeneratedRound = generateRound(initialGrade, 10);

  return <GameClient initialGrade={initialGrade} initialRound={initialRound} />;
}

