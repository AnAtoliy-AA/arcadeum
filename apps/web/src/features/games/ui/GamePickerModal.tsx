'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';
import { gameMetadata } from '@/features/games/registry';
import {
  GameSymbol,
  FALLBACK_ACCENT,
} from '@/app/[locale]/home/components/featured-games/gameMeta';

interface GamePickerModalProps {
  open: boolean;
  onClose: () => void;
}

const AI_GAMES = Object.values(gameMetadata).filter(
  (g) => g.supportsAI && g.status !== 'coming_soon',
);

const CATEGORIES = ['All', ...Array.from(new Set(AI_GAMES.map((g) => g.category)))];

export function GamePickerModal({ open, onClose }: GamePickerModalProps) {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredGames = useMemo(
    () =>
      activeCategory === 'All'
        ? AI_GAMES
        : AI_GAMES.filter((g) => g.category === activeCategory),
    [activeCategory],
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
          <ModalTitle>Pick a game to play vs AI</ModalTitle>
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
            {CATEGORIES.map((cat) => (
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
                {cat}
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
              return (
                <button
                  key={game.slug}
                  onClick={() => handleSelectGame(game.slug)}
                  disabled={loadingGame !== null}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '16px 12px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: isLoading
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: loadingGame ? 'not-allowed' : 'pointer',
                    opacity: loadingGame && !isLoading ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    color: 'inherit',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingGame) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <GameSymbol
                      gameId={game.slug}
                      width={64}
                      height={64}
                      style={{ color: FALLBACK_ACCENT }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {isLoading ? 'Starting...' : game.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        opacity: 0.5,
                        marginTop: 2,
                      }}
                    >
                      {game.category}
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
