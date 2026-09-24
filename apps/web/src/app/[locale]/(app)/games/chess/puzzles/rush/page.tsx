'use client';

import { use } from 'react';
import { PuzzleRush } from '@/widgets/BoardGames/ChessPuzzles/ui/PuzzleRush';
import { ChessPuzzleTabs } from '@/widgets/BoardGames/ChessPuzzles/ui/ChessPuzzleTabs';

interface ChessPuzzleRushPageProps {
  params: Promise<{ locale: string }>;
}

export default function ChessPuzzleRushPage({
  params,
}: ChessPuzzleRushPageProps) {
  const { locale } = use(params);

  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[900px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-4 text-center">
          Puzzle Rush
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Solve as many puzzles as you can before time runs out or you lose 3
          lives
        </p>
        <ChessPuzzleTabs activeTab="rush" locale={locale} />
        <PuzzleRush />
      </div>
    </main>
  );
}
