'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FilterChip, Input } from '@arcadeum/ui';
import type { Locale } from '@/shared/i18n';
import { GamesCatalogCard } from './components/GamesCatalogCard';

export interface CatalogGameItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  genre: string;
  pace?: string;
  category: 'all' | 'board' | 'card' | 'casual' | 'puzzle';
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
  playLabel?: string;
  detailsLabel?: string;
}

const CATEGORIES: Array<{
  key: 'all' | 'board' | 'card' | 'casual' | 'puzzle';
  label: string;
  icon: string;
}> = [
  { key: 'all', label: 'All Games', icon: '🎮' },
  { key: 'board', label: 'Board Games', icon: '♟️' },
  { key: 'card', label: 'Card Games', icon: '🃏' },
  { key: 'puzzle', label: 'Puzzles', icon: '🧩' },
  { key: 'casual', label: 'Action & Casual', icon: '⚡' },
];

export function GamesCatalogClient({
  games,
  roomsHref,
  allLabel = 'All Games',
  boardLabel = 'Board Games',
  cardLabel = 'Card Games',
  casualLabel = 'Action & Casual',
  searchPlaceholder = 'Search games by name, genre or rules...',
  unavailableLabel = 'Disabled',
  demoBadgeLabel = 'Demo',
  playLabel = 'Play Now',
  detailsLabel = 'Rules',
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'board' | 'card' | 'casual' | 'puzzle'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryLabels: Record<string, string> = {
    all: allLabel,
    board: boardLabel,
    card: cardLabel,
    casual: casualLabel,
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: games.length,
      board: 0,
      card: 0,
      puzzle: 0,
      casual: 0,
    };
    for (const g of games) {
      if (counts[g.category] !== undefined) {
        counts[g.category]++;
      }
    }
    return counts;
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory =
        selectedCategory === 'all' || game.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        game.name.toLowerCase().includes(query) ||
        game.genre.toLowerCase().includes(query) ||
        (game.pace && game.pace.toLowerCase().includes(query)) ||
        game.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <div className="box-border flex flex-col gap-8">
      <div className="box-border flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md shadow-lg">
        <div className="box-border flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const count = categoryCounts[cat.key] ?? 0;
            return (
              <FilterChip
                key={cat.key}
                active={isSelected}
                onClick={() => setSelectedCategory(cat.key)}
                data-testid={`category-filter-${cat.key}`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                <span>{categoryLabels[cat.key] ?? cat.label}</span>
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 opacity-80">
                  {count}
                </span>
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

      {filteredGames.length > 0 ? (
        <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GamesCatalogCard
              key={game.id}
              game={game}
              playLabel={playLabel}
              demoBadgeLabel={demoBadgeLabel}
              unavailableLabel={unavailableLabel}
              detailsLabel={detailsLabel}
            />
          ))}
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

      <div className="box-border p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-xl">
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
          className="box-border px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primaryForeground,white)] text-sm font-semibold hover:opacity-90 transition-all shadow-lg whitespace-nowrap no-underline active:scale-[0.98]"
        >
          Browse Open Rooms →
        </Link>
      </div>
    </div>
  );
}
