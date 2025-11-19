// src/app/api/tasks/new/route.ts
import { NextResponse } from 'next/server';
import { generateRound } from '@/features/math/tasks/generate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const levelParam = searchParams.get('level') ?? '1';
  const level = Number(levelParam);
  const numParam = searchParams.get('num') ?? '10';
  const num = Number(numParam);
  const modeParam = (searchParams.get('mode') ?? 'mixed').toLowerCase();
  const mode = modeParam === 'add' || modeParam === 'sub' || modeParam === 'mul' ? modeParam : 'mixed';

  if (!Number.isFinite(level) || level < 1 || level > 99) {
    return NextResponse.json({ error: 'Invalid level parameter' }, { status: 400 });
  }

  const count = Number.isFinite(num) && num >= 1 && num <= 50 ? Math.floor(num) : 10;
  const round = generateRound(level, count, { mode });

  return NextResponse.json(round);
}
