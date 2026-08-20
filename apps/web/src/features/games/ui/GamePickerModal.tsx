'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import dynamic from 'next/dynamic';
import {
  gameMetadata,
  gameLoaders,
  getCategoryLabelKey,
} from '@/features/games/registry';
import { GameArt } from '@/features/games/ui/create/redesign/art/GameArt';
import { CriticalMiniCluster } from '@/features/games/ui/create/redesign/art/CriticalMiniCluster';
import { SeaBattleBoardPoster } from '@/features/games/ui/create/redesign/art/SeaBattleBoardPoster';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  findSeaBattleTheme,
  type GameId,
} from '@/features/games/ui/create/redesign/data/themes';

const SeaBattleRealPreview = dynamic(
  () => import('@/features/games/ui/create/redesign/SeaBattleRealPreview'),
  { ssr: false },
);

interface GamePickerModalProps {
  open: boolean;
  onClose: () => void;
}

const ALL_AI_GAMES = Object.values(gameMetadata).filter(
  (g) => g.supportsAI && g.slug in gameLoaders,
);

function GameTilePreview({ gameId }: { gameId: GameId }) {
  if (gameId === 'critical_v1') {
    return (
      <CriticalMiniCluster themeId={CRITICAL_THEMES[0].id} cardWidth={48} />
    );
  }
  if (gameId === 'sea_battle_v1') {
    const theme = findSeaBattleTheme(SEA_BATTLE_THEMES[0].id);
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SeaBattleBoardPoster theme={theme} size="sm" />
        <div style={{ position: 'absolute', inset: 0 }}>
          <SeaBattleRealPreview
            themeId={theme.id}
            cellSize={12}
            background={theme.palette.bg}
          />
        </div>
      </div>
    );
  }
  return <GameArt gameId={gameId} size="sm" />;
}

export function GamePickerModal({ open, onClose }: GamePickerModalProps) {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
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

  const games = useMemo(
    () => (comingSoonIds === null ? [] : ALL_AI_GAMES),
    [comingSoonIds],
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(games.map((g) => g.category)))],
    [games],
  );

  const filteredGames = useMemo(
    () =>
      activeCategory === 'All'
        ? games
        : games.filter((g) => g.category === activeCategory),
    [activeCategory, games],
  );

  const handleSelectGame = useCallback(
    async (gameId: string) => {
      setLoadingGame(gameId);
      try {
        const { room } = await gamesApi.quickplay(gameId, {
          token: snapshot.accessToken || undefined,
        });
        onClose();
        router.push(routes.gameRoom(room.id));
      } catch (err) {
        console.warn(`Quickplay failed for ${gameId}:`, err);
        setLoadingGame(null);
      }
    },
    [snapshot.accessToken, routes, router, onClose],
  );

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={720}>
        <ModalHeader onClose={onClose}>
          <ModalTitle data-testid="game-picker-title">
            {t('games.gamePicker.title')}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                type="button"
                style={{
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor:
                    activeCategory === cat
                      ? 'rgba(56, 189, 248, 0.5)'
                      : 'rgba(255,255,255,0.1)',
                  background:
                    activeCategory === cat
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: activeCategory === cat ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {cat === 'All'
                  ? t('games.gamePicker.allCategory')
                  : t((getCategoryLabelKey(cat) ?? cat) as TranslationKey)}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {filteredGames.map((game) => {
              const isLoading = loadingGame === game.slug;
              const isComingSoon = comingSoonIds?.has(game.slug) ?? false;
              return (
                <button
                  key={game.slug}
                  onClick={() => !isComingSoon && handleSelectGame(game.slug)}
                  disabled={loadingGame !== null || isComingSoon}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: isLoading
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: isComingSoon
                      ? 'not-allowed'
                      : loadingGame
                        ? 'not-allowed'
                        : 'pointer',
                    opacity: isComingSoon
                      ? 0.5
                      : loadingGame && !isLoading
                        ? 0.5
                        : 1,
                    transition: 'all 0.2s ease',
                    color: 'inherit',
                    textAlign: 'left',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingGame) {
                      e.currentTarget.style.background =
                        'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor =
                        'rgba(255,255,255,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor =
                      'rgba(255,255,255,0.08)';
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 11',
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <GameTilePreview gameId={game.slug as GameId} />
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {isComingSoon
                        ? t('games.create.comingSoon')
                        : isLoading
                          ? t('games.gamePicker.starting')
                          : game.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.5,
                        marginTop: 2,
                      }}
                    >
                      {t(
                        (getCategoryLabelKey(game.category) ??
                          game.category) as TranslationKey,
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
