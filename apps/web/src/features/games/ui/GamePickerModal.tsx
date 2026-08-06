'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';
import { gameMetadata } from '@/features/games/registry';

interface GamePickerModalProps {
  open: boolean;
  onClose: () => void;
}

const AI_GAMES = Object.values(gameMetadata).filter(
  (g) => g.supportsAI && g.status !== 'coming_soon',
);

export function GamePickerModal({ open, onClose }: GamePickerModalProps) {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);

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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            {AI_GAMES.map((game) => {
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
                    gap: '12px',
                    padding: '20px 16px',
                    borderRadius: '16px',
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
                      position: 'relative',
                      background: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Image
                      src={game.thumbnail}
                      alt={game.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {isLoading ? 'Starting...' : game.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.5,
                        marginTop: 4,
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
