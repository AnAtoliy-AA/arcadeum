import Link from 'next/link';

interface PuzzleCard {
  icon: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

interface ChessPuzzleQuickAccessProps {
  dailyPuzzleHref: string;
  ratedPuzzlesHref: string;
  puzzleRushHref: string;
  coordinatesHref: string;
}

export function ChessPuzzleQuickAccess({
  dailyPuzzleHref,
  ratedPuzzlesHref,
  puzzleRushHref,
  coordinatesHref,
}: ChessPuzzleQuickAccessProps) {
  const cards: PuzzleCard[] = [
    {
      icon: '📅',
      title: 'Daily Puzzle',
      description: 'New tactical challenge every day with streak tracking',
      href: dailyPuzzleHref,
      badge: 'Daily',
    },
    {
      icon: '🎯',
      title: 'Rated Puzzles',
      description: 'Solve puzzles matched to your skill level and earn rating',
      href: ratedPuzzlesHref,
    },
    {
      icon: '⚡',
      title: 'Puzzle Rush',
      description: 'Survive 3 lives or beat the clock: how many can you solve?',
      href: puzzleRushHref,
    },
    {
      icon: '🧭',
      title: 'Coordinates',
      description: 'Train board vision by naming square coordinates fast',
      href: coordinatesHref,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 sm:p-8 backdrop-blur-md">
      <header className="mb-6 flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color)]">
          Training Modes
        </span>
        <h2 className="m-0 text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Chess Puzzles & Training
        </h2>
        <p className="m-0 text-sm text-[var(--foreground)] opacity-95 max-w-2xl">
          Sharpen your tactics with daily puzzles, rated training, speed
          challenges, and coordinate drills.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex flex-col gap-3 p-5 rounded-2xl bg-[var(--surfaceBackground)]/60 border border-[var(--borderColor)] backdrop-blur-sm transition-all duration-200 hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-xl">
                {card.icon}
              </span>
              {card.badge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {card.badge}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-base font-bold text-[var(--foreground)] group-hover:text-[var(--color)] transition-colors">
                {card.title}
              </h3>
              <p className="m-0 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
                {card.description}
              </p>
            </div>
            <span className="mt-auto text-xs font-semibold text-[var(--color)] opacity-0 group-hover:opacity-100 transition-opacity">
              Start training →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
