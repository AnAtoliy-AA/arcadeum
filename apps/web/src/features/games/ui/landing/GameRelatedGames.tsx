import Link from 'next/link';
import { Badge } from '@arcadeum/ui';
import type { GameRelatedGamesProps } from './types';

export function GameRelatedGames({
  title = 'More Multiplayer Games',
  kicker = 'Discover',
  currentGameSlug,
  games,
}: GameRelatedGamesProps) {
  const filtered = games.filter((g) => g.slug !== currentGameSlug);
  if (filtered.length === 0) return null;

  return (
    <section className="box-border flex flex-col gap-6 py-8">
      <div className="box-border flex flex-col gap-1">
        {kicker ? (
          <span className="box-border text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            {kicker}
          </span>
        ) : null}
        <h2 className="box-border m-0 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {title}
        </h2>
      </div>

      <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.slice(0, 4).map((game) => (
          <Link
            key={game.slug}
            href={game.href}
            className="box-border block text-inherit no-underline"
          >
            <article className="box-border flex flex-col justify-between h-full p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md transition-all duration-200 hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-0.5 group">
              <div className="box-border flex flex-col gap-3">
                <div className="box-border flex items-center justify-between gap-2">
                  <Badge variant="neutral" size="sm">
                    {game.category}
                  </Badge>
                  <span className="box-border text-xs text-[var(--foreground)] opacity-70">
                    {game.players}
                  </span>
                </div>

                <h3 className="box-border m-0 text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {game.name}
                </h3>

                <p className="box-border m-0 text-xs sm:text-sm text-[var(--foreground)] opacity-75 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <span className="box-border mt-4 text-xs font-bold text-[var(--primary)] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Play {game.name} →
              </span>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
