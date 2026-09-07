'use client';

import dynamic from 'next/dynamic';

const CoordinateTrainer = dynamic(
  () => import('@/widgets/BoardGames/ChessGame/ui/CoordinateTrainer').then((m) => m.CoordinateTrainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--textSecondary)]">Loading coordinate trainer...</div>
      </div>
    ),
  },
);

export default function ChessLearnPage() {
  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[600px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-2 text-center">
          Chess Training
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Master chess coordinates to improve your speed and communication
        </p>
        <CoordinateTrainer />
      </div>
    </main>
  );
}
