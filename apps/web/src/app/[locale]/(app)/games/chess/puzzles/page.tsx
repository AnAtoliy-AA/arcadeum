'use client';

import { useState, use } from 'react';
import { PuzzleGame } from '@/widgets/BoardGames/ChessPuzzles/ui/Game';
import { ChessPuzzleTabs } from '@/widgets/BoardGames/ChessPuzzles/ui/ChessPuzzleTabs';
import { THEME_CATEGORIES } from '@/features/chess/lib/puzzle-api';
import { cx } from '@arcadeum/ui/utils/cx';

interface ChessPuzzlesPageProps {
  params: Promise<{ locale: string }>;
}

export default function ChessPuzzlesPage({ params }: ChessPuzzlesPageProps) {
  const { locale } = use(params);
  const [selectedTheme, setSelectedTheme] = useState('all');

  return (
    <main className="flex flex-col items-center min-h-screen py-6">
      <div className="w-full max-w-[900px] px-4">
        <h1 className="text-2xl font-bold text-[var(--color)] mb-4 text-center">
          Chess Training
        </h1>
        <p className="text-sm text-[var(--textSecondary)] text-center mb-6">
          Improve your chess with daily puzzles, rush mode, and coordinate
          training
        </p>
        <ChessPuzzleTabs activeTab="rated" locale={locale} />

        <div
          data-testid="puzzle-theme-filters"
          className="flex items-center justify-center gap-1.5 flex-wrap mb-6 max-w-2xl mx-auto"
        >
          {THEME_CATEGORIES.map((cat) => {
            const isActive = selectedTheme === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedTheme(cat.id)}
                data-testid={`theme-chip-${cat.id}`}
                className={cx(
                  'px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150',
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--textSecondary)] hover:bg-[var(--backgroundHover)] hover:text-[var(--foreground)]',
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <PuzzleGame
          key={selectedTheme}
          mode={selectedTheme === 'all' ? 'rated' : 'themed'}
          theme={selectedTheme === 'all' ? undefined : selectedTheme}
        />
      </div>
    </main>
  );
}
