'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  FilterChip,
  Input,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { featuredGames } from '@/app/[locale]/home/data/games';
import { GamePickerCard, type GamePickerItem } from './GamePickerCard';

interface GamePickerModalProps {
  open: boolean;
  onClose: () => void;
  inviteUserId?: string;
  title?: string;
}

type GameCategoryKey = 'all' | 'board' | 'card' | 'casual' | 'puzzle';

const CATEGORIES: Array<{
  key: GameCategoryKey;
  label: string;
  icon: string;
}> = [
  { key: 'all', label: 'All', icon: '🎮' },
  { key: 'board', label: 'Board', icon: '♟️' },
  { key: 'card', label: 'Cards', icon: '🃏' },
  { key: 'puzzle', label: 'Puzzle', icon: '🧩' },
  { key: 'casual', label: 'Action', icon: '⚡' },
];

function resolveCategory(
  type: string,
  genre: string,
): 'board' | 'card' | 'casual' | 'puzzle' {
  if (type === 'card') return 'card';
  if (type === 'puzzle') return 'puzzle';
  if (
    genre.toLowerCase().includes('race') ||
    genre.toLowerCase().includes('arcade')
  ) {
    return 'casual';
  }
  return 'board';
}

export function GamePickerModal({
  open,
  onClose,
  inviteUserId,
  title,
}: GamePickerModalProps) {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<GameCategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [comingSoonIds, setComingSoonIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    gamesApi.getCatalog().then((catalog) => {
      if (cancelled) return;
      setComingSoonIds(
        new Set(catalog.games.filter((g) => g.comingSoon).map((g) => g.gameId)),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const games: GamePickerItem[] = useMemo(() => {
    return featuredGames
      .filter((g) => !inviteUserId || g.players !== '1')
      .map((g) => {
        const isComingSoon = comingSoonIds?.has(g.id) ?? false;
        return {
          id: g.id,
          slug: g.id,
          name: t(g.nameKey as TranslationKey),
          description: t(g.descriptionKey as TranslationKey),
          genre: g.genre,
          pace: g.pace,
          category: resolveCategory(g.type, g.genre),
          players: g.players,
          duration: g.duration,
          isPlayable: g.isPlayable && !isComingSoon,
          isDemo: g.isDemo,
          landingHref: g.landingHref,
        };
      });
  }, [t, comingSoonIds, inviteUserId]);

  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategoryKey, number> = {
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

  const handleSelectGame = useCallback(
    async (gameId: string) => {
      const game = games.find((g) => g.slug === gameId);
      if (game?.players === '1' && game.landingHref) {
        onClose();
        router.push(game.landingHref);
        return;
      }
      setLoadingGame(gameId);
      try {
        if (inviteUserId) {
          const { room } = await gamesApi.createRoom(
            {
              gameId,
              name: `${snapshot.accessToken ? snapshot.displayName || snapshot.username || 'Player' : 'Player'}'s game`,
              visibility: 'public',
            },
            { token: snapshot.accessToken || undefined },
          );
          if (room?.id && snapshot.accessToken) {
            await gamesApi.invitePlayers(room.id, [inviteUserId], {
              token: snapshot.accessToken,
            });
          }
          onClose();
          router.push(routes.gameRoom(room.id));
        } else {
          const { room } = await gamesApi.quickplay(gameId, undefined, {
            token: snapshot.accessToken || undefined,
          });
          onClose();
          router.push(routes.gameRoom(room.id));
        }
      } catch (err) {
        console.warn(`Game creation failed for ${gameId}:`, err);
        setLoadingGame(null);
      }
    },
    [
      snapshot.accessToken,
      snapshot.displayName,
      snapshot.username,
      routes,
      router,
      onClose,
      games,
      inviteUserId,
    ],
  );

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={960} data-testid="game-picker-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle data-testid="game-picker-title">
            {title || t('games.gamePicker.title')}
          </ModalTitle>
        </ModalHeader>
        <ModalBody data-testid="game-picker-body">
          <div className="box-border flex flex-col gap-5">
            <div className="box-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--borderColor)]">
              <div className="box-border flex flex-wrap items-center gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  const count = categoryCounts[cat.key] ?? 0;
                  return (
                    <FilterChip
                      key={cat.key}
                      active={isSelected}
                      onClick={() => setSelectedCategory(cat.key)}
                      data-testid={`game-picker-category-${cat.key}`}
                    >
                      <span className="mr-1.5">{cat.icon}</span>
                      <span>
                        {cat.key === 'all'
                          ? t('games.gamePicker.allCategory')
                          : cat.label}
                      </span>
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 opacity-80">
                        {count}
                      </span>
                    </FilterChip>
                  );
                })}
              </div>

              <div className="box-border relative w-full sm:w-64">
                <Input
                  size="sm"
                  type="search"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                  aria-label="Search games"
                  data-testid="game-picker-search"
                />
              </div>
            </div>

            {filteredGames.length > 0 ? (
              <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <GamePickerCard
                    key={game.id}
                    game={game}
                    isLoading={loadingGame === game.slug}
                    disabled={loadingGame !== null && loadingGame !== game.slug}
                    onSelect={() => handleSelectGame(game.slug)}
                    startingLabel={t('games.gamePicker.starting')}
                  />
                ))}
              </div>
            ) : (
              <div className="box-border flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)]">
                <span className="text-4xl mb-3">🔍</span>
                <h3 className="box-border m-0 text-base font-bold text-white">
                  No games found
                </h3>
                <p className="box-border m-0 text-xs text-white/70 mt-1 max-w-xs">
                  Try adjusting your search query or choosing another category.
                </p>
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
