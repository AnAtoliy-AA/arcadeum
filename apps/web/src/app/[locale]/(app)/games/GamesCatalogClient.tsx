'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FilterChip, Input } from '@arcadeum/ui';
import { GameArt } from '@/features/games/ui/create/redesign/art/GameArt';
import type { GameId } from '@/features/games/ui/create/redesign/data/themes';
import type { Locale } from '@/shared/i18n';

export interface CatalogGameItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  genre: string;
  category: 'all' | 'board' | 'card' | 'casual';
  categoryLabel: string;
  players: string;
  duration: string;
  landingHref: string;
  accentColor: string;
  isPlayable: boolean;
  isDemo?: boolean;
}

interface Props {
  locale: Locale;
  games: CatalogGameItem[];
  roomsHref: string;
  allLabel?: string;
  boardLabel?: string;
  cardLabel?: string;
  casualLabel?: string;
  searchPlaceholder?: string;
  unavailableLabel?: string;
  demoBadgeLabel?: string;
}

const CATEGORIES: Array<{
  key: 'all' | 'board' | 'card' | 'casual';
  label: string;
  icon: string;
}> = [
  { key: 'all', label: 'All Games', icon: '🎮' },
  { key: 'board', label: 'Board Games', icon: '♟️' },
  { key: 'card', label: 'Card Games', icon: '🃏' },
  { key: 'casual', label: 'Action & Casual', icon: '⚡' },
];

export function GamesCatalogClient({
  games,
  roomsHref,
  allLabel = 'All Games',
  boardLabel = 'Board Games',
  cardLabel = 'Card Games',
  casualLabel = 'Action & Casual',
  searchPlaceholder = 'Search games by name or genre...',
  unavailableLabel = 'Disabled',
  demoBadgeLabel = 'Demo',
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'board' | 'card' | 'casual'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryLabels: Record<string, string> = {
    all: allLabel,
    board: boardLabel,
    card: cardLabel,
    casual: casualLabel,
  };

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory =
        selectedCategory === 'all' || game.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        game.name.toLowerCase().includes(query) ||
        game.genre.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <div className="box-border flex flex-col gap-8">
      {/* Category filter pills & Search bar */}
      <div className="box-border flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md">
        <div className="box-border flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <FilterChip
                key={cat.key}
                active={isSelected}
                onClick={() => setSelectedCategory(cat.key)}
                data-testid={`category-filter-${cat.key}`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                <span>{categoryLabels[cat.key] ?? cat.label}</span>
              </FilterChip>
            );
          })}
        </div>

        <div className="box-border relative flex-1 max-w-md">
          <Input
            size="sm"
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            aria-label={searchPlaceholder}
            data-testid="games-catalog-search"
          />
        </div>
      </div>

      {/* Games Catalog Grid */}
      {filteredGames.length > 0 ? (
        <div className="box-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGames.map((game) => {
            const isDisabled = !game.isPlayable;

            return (
              <Link
                key={game.id}
                href={game.landingHref}
                aria-label={game.name}
                className={`box-border flex flex-col justify-between rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group no-underline ${
                  isDisabled ? 'opacity-70' : ''
                }`}
              >
                {/* Visual Cover Poster */}
                <div className="box-border relative h-48 w-full bg-black/40 border-b border-[var(--borderColor)] flex items-center justify-center overflow-hidden p-2 group-hover:bg-black/60 transition-colors">
                  <div className="box-border w-full h-full flex items-center justify-center scale-95 group-hover:scale-100 transition-transform">
                    <GameArt
                      gameId={game.slug as GameId}
                      themeId="classic"
                      size="sm"
                    />
                  </div>

                  {/* Status badges */}
                  <div className="box-border absolute top-3 right-3 flex items-center gap-1.5">
                    {isDisabled ? (
                      <span className="box-border text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/25 text-rose-200 border border-rose-500/50 backdrop-blur-md">
                        {unavailableLabel}
                      </span>
                    ) : game.isDemo ? (
                      <span className="box-border text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-200 border border-amber-500/50 backdrop-blur-md">
                        {demoBadgeLabel}
                      </span>
                    ) : null}
                  </div>

                  <span className="box-border absolute bottom-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-black/75 text-white border border-white/15 backdrop-blur-md shadow-sm">
                    {game.genre}
                  </span>
                </div>

                {/* Metadata & Description */}
                <div className="box-border p-4 sm:p-5 flex flex-col gap-2.5">
                  <div className="box-border text-lg font-bold text-white group-hover:text-[var(--primary)] transition-colors truncate">
                    {game.name}
                  </div>

                  <p className="box-border m-0 text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>

                  <div className="box-border flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="box-border text-[11px] px-2.5 py-0.5 rounded-md bg-white/5 text-white/90 border border-white/10">
                      👥 {game.players}
                    </span>
                    <span className="box-border text-[11px] px-2.5 py-0.5 rounded-md bg-white/5 text-white/90 border border-white/10">
                      ⏱ {game.duration}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="box-border flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)]">
          <span className="text-4xl mb-3">🔍</span>
          <h3 className="box-border m-0 text-lg font-bold text-[var(--foreground)]">
            No games found
          </h3>
          <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-70 mt-1 max-w-sm">
            Try adjusting your search query or selecting a different category
            filter.
          </p>
        </div>
      )}

      {/* Floating CTA Banner pointing to /rooms */}
      <div className="box-border p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="box-border flex flex-col gap-1 text-center sm:text-left">
          <h3 className="box-border m-0 text-base sm:text-lg font-bold text-[var(--foreground)]">
            Looking for live multiplayer action?
          </h3>
          <p className="box-border m-0 text-xs sm:text-sm text-[var(--foreground)] opacity-80">
            Browse open rooms with real players or host your own match in
            seconds.
          </p>
        </div>
        <Link
          href={roomsHref}
          className="box-border px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primaryForeground,white)] text-sm font-semibold hover:opacity-90 transition-all shadow-lg whitespace-nowrap no-underline"
        >
          Browse Open Rooms →
        </Link>
      </div>
    </div>
  );
}
