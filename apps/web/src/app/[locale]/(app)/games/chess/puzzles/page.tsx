'use client';

import { PuzzleGame } from '@/widgets/BoardGames/ChessPuzzles/ui/Game';

export default function ChessPuzzlesPage() {
  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[900px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-4 text-center">
          Chess Puzzles
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Solve tactical puzzles to improve your rating
        </p>
        <PuzzleGame mode="rated" />
      </div>
    </main>
  );
}
