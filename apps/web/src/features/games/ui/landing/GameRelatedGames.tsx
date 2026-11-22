'use client';

import Link from 'next/link';
import { Badge } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameSectionHeading } from './GameSectionHeading';
import { ArrowRightIcon } from './landingIcons';
import type { GameRelatedGamesProps } from './types';

export function GameRelatedGames({
  id = 'related',
  title,
  kicker,
  currentGameSlug,
  games,
}: GameRelatedGamesProps) {
  const { t } = useTranslation();
  const filtered = games.filter((g) => g.slug !== currentGameSlug);
  if (filtered.length === 0) return null;

  return (
    <section
      id={id}
      className="box-border scroll-mt-32 flex flex-col gap-8 py-10 sm:py-12 [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
    >
      <GameSectionHeading
        kicker={kicker ?? t('games.landing.relatedKicker')}
        title={title ?? t('games.landing.relatedTitle')}
      />

      <ul className="box-border m-0 p-0 list-none flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [scrollbar-width:thin]">
        {filtered.slice(0, 8).map((game) => (
          <li
            key={game.slug}
            className="box-border snap-start shrink-0 w-[78%] sm:w-72"
          >
            <Link
              href={game.href}
              className="box-border group flex flex-col justify-between h-full gap-4 p-5 rounded-3xl text-inherit no-underline bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md motion-safe:transition-all motion-safe:duration-200 hover:border-[var(--primary)] hover:shadow-lg motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
            >
              <div className="box-border flex flex-col gap-3">
                <div className="box-border flex items-center justify-between gap-2">
                  <Badge variant="neutral" size="sm">
                    {game.category}
                  </Badge>
                  <span className="box-border text-xs text-[var(--foreground)] opacity-75">
                    {game.players}
                  </span>
                </div>
                <h3 className="box-border m-0 text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] motion-safe:transition-colors">
                  {game.name}
                </h3>
                <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 line-clamp-3 leading-relaxed">
                  {game.description}
                </p>
              </div>
              <span className="box-border inline-flex items-center gap-1.5 text-sm font-bold text-[var(--primary)] motion-safe:transition-transform group-hover:translate-x-1">
                {t('games.landing.playGame', { name: game.name })}
                <ArrowRightIcon />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
