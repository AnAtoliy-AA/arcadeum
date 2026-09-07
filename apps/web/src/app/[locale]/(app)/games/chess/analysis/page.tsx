'use client';

import dynamic from 'next/dynamic';

const AnalysisBoard = dynamic(
  () =>
    import('@/widgets/BoardGames/ChessGame/ui/AnalysisBoard').then(
      (m) => m.AnalysisBoard,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--textSecondary)]">
          Loading analysis board...
        </div>
      </div>
    ),
  },
);

export default function ChessAnalysisPage() {
  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[1100px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-2 text-center">
          Analysis Board
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Set up positions, make moves, and analyze with Stockfish 19
        </p>
        <AnalysisBoard />
      </div>
    </main>
  );
}
