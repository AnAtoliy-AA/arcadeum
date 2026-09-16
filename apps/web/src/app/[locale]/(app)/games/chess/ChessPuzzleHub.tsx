'use client';

import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { ChessPuzzleTeaser } from './ChessPuzzleTeaser';

interface ChessPuzzleHubProps {
  dailyPuzzleHref: string;
  ratedPuzzlesHref: string;
  puzzleRushHref: string;
  coordinatesHref: string;
}

export function ChessPuzzleHub({
  dailyPuzzleHref,
  ratedPuzzlesHref,
  puzzleRushHref,
  coordinatesHref,
}: ChessPuzzleHubProps) {
  const cards = [
    {
      icon: '📅',
      title: 'Daily Puzzle',
      description: 'New tactical challenge every day with streak tracking',
      href: dailyPuzzleHref,
      badge: 'DAILY',
    },
    {
      icon: '🎯',
      title: 'Rated Puzzles',
      description: 'Solve puzzles matched to your skill level and earn rating',
      href: ratedPuzzlesHref,
      badge: 'RATED',
    },
    {
      icon: '⚡',
      title: 'Puzzle Rush',
      description: 'Survive 3 lives or beat the clock: how many can you solve?',
      href: puzzleRushHref,
      badge: 'TIMED',
    },
    {
      icon: '🧭',
      title: 'Coordinates',
      description: 'Train board vision by naming square coordinates fast',
      href: coordinatesHref,
      badge: 'DRILL',
    },
  ];

  return (
    <section id="puzzles" className="box-border flex flex-col gap-6 pt-4 pb-8">
      <div className="box-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="box-border flex flex-col gap-1.5">
          <span className="box-border text-xs font-bold uppercase tracking-wider text-[var(--color)]">
            Tactics & Training
          </span>
          <h2 className="box-border m-0 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            Chess Puzzles & Tactics
          </h2>
          <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-90 max-w-2xl">
            Improve your tactical vision with daily puzzles, Elo-rated puzzle
            training, speed puzzle rush, and coordinate drills.
          </p>
        </div>

        <div className="box-border flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href={ratedPuzzlesHref} className="box-border inline-flex">
            <Button variant="primary" size="md">
              Rated Puzzles ➔
            </Button>
          </Link>
          <Link href={puzzleRushHref} className="box-border inline-flex">
            <Button variant="victory" size="md">
              Puzzle Rush ➔
            </Button>
          </Link>
        </div>
      </div>

      <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="box-border group flex flex-col gap-3 p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md transition-all duration-200 hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 no-underline"
          >
            <div className="box-border flex items-center justify-between">
              <span className="box-border flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-xl group-hover:scale-110 transition-transform">
                {card.icon}
              </span>
              {card.badge ? (
                <span className="box-border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {card.badge}
                </span>
              ) : null}
            </div>
            <div className="box-border flex flex-col gap-1">
              <h3 className="box-border m-0 text-base font-bold text-[var(--foreground)] group-hover:text-[var(--color)] transition-colors">
                {card.title}
              </h3>
              <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
                {card.description}
              </p>
            </div>
            <span className="box-border mt-auto text-xs font-semibold text-[var(--color)] inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              Start training →
            </span>
          </Link>
        ))}
      </div>

      <ChessPuzzleTeaser
        dailyPuzzleHref={dailyPuzzleHref}
        puzzleRushHref={puzzleRushHref}
      />
    </section>
  );
}
