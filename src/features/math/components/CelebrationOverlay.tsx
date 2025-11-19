// src/features/math/components/CelebrationOverlay.tsx
'use client';

type Props = {
  show: boolean;
  kind: 'success' | 'error';
};

export function CelebrationOverlay({ show, kind }: Props) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 flex items-start justify-center pt-24 z-50">
      {kind === 'success' ? (
        <div className="animate-pop text-4xl">✅✨</div>
      ) : (
        <div className="animate-pop text-4xl">🙂➡️</div>
      )}
      <style jsx>{`
        .animate-pop { animation: pop 700ms ease-out both; }
        @keyframes pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

