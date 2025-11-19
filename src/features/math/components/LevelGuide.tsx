// src/features/math/components/LevelGuide.tsx
"use client";

import { getProfile } from "@/features/math/levels/profiles";
import { opChar } from "@/features/math/tasks/utils";

function opsText(level: number): string {
  const ops = getProfile(level).allowedOps;
  return ops.map(opChar).join(" ");
}

function rangesText(level: number): string {
  const p = getProfile(level);
  const parts: string[] = [];
  if (p.addMax > 0) parts.push(`+≤${p.addMax}`);
  if (p.subMax > 0) parts.push(`-≤${p.subMax}`);
  if (p.mulMax > 0) parts.push(`×≤${p.mulMax}`);
  if (p.divMax > 0) parts.push(`÷≤${p.divMax}`);
  return parts.join(" · ");
}

function targetText(level: number): string {
  const w = getProfile(level).targetWeights;
  const hasOperands = (w.a + w.b) > 0.0001;
  return hasOperands ? "tulos ja joskus operandit" : "tulos";
}

export function LevelGuide() {
  return (
    <div className="mt-4 p-3 rounded-lg border border-gray-200 bg-white">
      <h3 className="m-0 text-sm text-gray-700">Tasot</h3>
      <ul className="mt-2 mb-0 text-xs text-gray-600 space-y-1">
        {Array.from({ length: 6 }, (_, i) => i + 1).map((lvl) => (
          <li key={lvl}>
            <span className="font-medium">Taso {lvl}:</span>{" "}
            {opsText(lvl)} — {rangesText(lvl)} — {targetText(lvl)}
          </li>
        ))}
      </ul>
    </div>
  );
}

