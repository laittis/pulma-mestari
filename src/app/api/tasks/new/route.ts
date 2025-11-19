// src/app/api/tasks/new/route.ts
import { NextResponse } from 'next/server';
import { generateRound } from '@/lib/tasks/generate';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gradeParam = searchParams.get('grade') ?? '2';
  const grade = Number(gradeParam);

  if (!Number.isFinite(grade) || grade < 1 || grade > 6) {
    return NextResponse.json({ error: 'Invalid grade parameter' }, { status: 400 });
  }

  const round = generateRound(grade, 10);

  return NextResponse.json(round);
}
