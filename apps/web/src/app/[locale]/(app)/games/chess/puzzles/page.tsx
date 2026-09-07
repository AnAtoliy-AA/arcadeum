'use client';

import Link from 'next/link';
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
        <div className="flex justify-center gap-3 mb-6">
          <Link
            href="/games/chess/puzzles"
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Rated Puzzles
          </Link>
          <Link
            href="/games/chess/puzzles/rush"
            className="px-4 py-2 rounded-lg bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--text)] text-sm font-semibold hover:bg-[var(--backgroundHover)] transition-colors"
          >
            Puzzle Rush
          </Link>
        </div>
        <PuzzleGame mode="rated" />
      </div>
    </main>
  );
}
