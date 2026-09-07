'use client';

import { PuzzleRush } from '@/widgets/BoardGames/ChessPuzzles/ui/PuzzleRush';

export default function ChessPuzzleRushPage() {
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
        <PuzzleRush />
      </div>
    </main>
  );
}
