'use client';

import React, { useMemo, useEffect, Suspense, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { connectSockets, connectSocketsAnonymous } from '@/shared/lib/socket';
import { GamesControlPanel } from '@/widgets/GamesControlPanel';
import { gamesApi } from '@/features/games/api';
import { useGameRoom, type GameType } from '@/features/games/hooks';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useIdleReconnect } from '@/shared/hooks/useIdleReconnect';
import { useIdleDetection } from '@/shared/hooks/useIdleDetection';
import { ConnectionOverlay } from '@/shared/ui';
import { mapToGameType } from '@/features/games/lib/gameIdMapping';
import { gameFactory } from '@/features/games/lib/gameFactory';
import { gameMetadata } from '@/features/games/registry';
import type { GameInitialData } from '@/shared/types/games';

import type { GameSessionSummary } from '@/shared/types/games';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';

// Extracted Components
import { Page, Container, LoadingContainer, GameWrapper } from './styles';
import { GameRoomLoading } from './GameRoomLoading';
import { GameRoomError } from './GameRoomError';
import { PrivateRoomForm } from './PrivateRoomForm';
import { DynamicGameRenderer } from './DynamicGameRenderer';

export default function GameRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.id as string;
  const urlInviteCode = searchParams?.get('inviteCode');
  const { snapshot, hydrated } = useSessionTokens();
  const { t } = useTranslation();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  // Track if we've attempted auto-join with URL invite code
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  // Track if user manually submitted invite code
  const [manualSubmitPending, setManualSubmitPending] = useState(false);

  // State for room visibility check

  const isAuthenticated = !!snapshot.accessToken && !!snapshot.userId;

  // Fetch full room info to determine mode (Play vs Watch)
  const {
    data: roomData = null,
    isLoading: roomInfoLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['games', 'room-info', roomId],
    queryFn: async () => {
      if (!roomId) return null;
      return await gamesApi.getRoomInfo(roomId, {
        token: snapshot.accessToken || undefined,
      });
    },
    enabled: !!roomId,
    retry: 1,
  });

  const roomInfo = roomData?.room;
  const initialSessionData = roomData?.session;

  // Handle private rooms by treating the 403 error as a valid 'private' result
  const roomVisibility = useMemo(() => {
    if (roomInfo) return roomInfo.visibility;
    if (queryError?.message === 'private_room_error') return 'private';
    return null;
  }, [roomInfo, queryError]);

  // Map query error to UI error message
  const visibilityError = useMemo(() => {
    if (!queryError) return null;
    const msg = queryError.message;
    if (msg === 'private_room_error') return null;
    if (msg === 'room_not_found_error')
      return t('games.roomPage.errors.roomNotFoundError');
    return t('games.roomPage.errors.failedToLoadError');
  }, [queryError, t]);

  // Determine mode for useGameRoom based on auth, visibility, and game status
  const roomMode = useMemo(() => {
    if (roomInfoLoading || !roomInfo) return 'play'; // Default to play while loading (won't connect yet)

    // If user is a participant, they always re-join as PLAY
    const isParticipant = roomInfo.members?.some(
      (p: { id: string }) => p.id === snapshot.userId,
    );
    if (isParticipant) return 'play';

    if (roomInfo.hostId === snapshot.userId) return 'play';

    if (roomInfo.status !== 'lobby') return 'watch';

    if (
      !isAuthenticated &&
      !snapshot.userId &&
      roomInfo.visibility === 'public'
    )
      return 'watch';

    return 'play';
  }, [roomInfoLoading, roomInfo, snapshot.userId, isAuthenticated]);

  // Connect sockets based on auth status and room visibility
  useEffect(() => {
    if (roomInfoLoading || visibilityError) return;

    if (!roomInfo && roomVisibility !== 'private') return;

    if (isAuthenticated) {
      connectSockets(snapshot.accessToken);
    } else if (snapshot.userId || roomVisibility === 'public') {
      connectSocketsAnonymous();
    }

    return () => {
      // Disconnect sockets when leaving the game room
      import('@/shared/lib/socket').then(({ disconnectSockets }) => {
        disconnectSockets();
      });
    };
  }, [
    isAuthenticated,
    snapshot.accessToken,
    snapshot.userId,
    roomVisibility,
    roomInfo,
    roomInfoLoading,
    visibilityError,
  ]);

  // Memoize initialData to prevent unnecessary re-renders/looping in useGameRoom
  const initialData: GameInitialData = useMemo(
    () => ({ room: roomInfo, session: initialSessionData }),
    [roomInfo, initialSessionData],
  );

  // Get room state - use watch mode for spectators
  // Only enable after visibility check is complete to prevent mode changes
  const {
    room,
    session: initialSession,
    loading: roomLoading,
    error,
    isHost,
    joinRoom,
  } = useGameRoom({
    roomId,
    userId: snapshot.userId,
    accessToken: snapshot.accessToken,
    mode: roomMode,
    inviteCode: urlInviteCode || undefined,
    enabled: !roomInfoLoading && !visibilityError,
    initialData,
  });

  // Auto-join effect for URL invite codes - use queueMicrotask to avoid sync setState
  useEffect(() => {
    if (
      !room &&
      roomVisibility === 'private' &&
      urlInviteCode &&
      !autoJoinAttempted &&
      !error
    ) {
      // Use queueMicrotask to schedule state update after render
      queueMicrotask(() => {
        setAutoJoinAttempted(true);
      });
    }
  }, [room, roomVisibility, urlInviteCode, autoJoinAttempted, error]);

  // Reset manual submit pending when room loads or error occurs
  useEffect(() => {
    if ((error || room) && manualSubmitPending) {
      queueMicrotask(() => {
        setManualSubmitPending(false);
      });
    }
  }, [error, room, manualSubmitPending]);

  // Derive invite code error from hook's error when auto-joining
  const inviteCodeError = autoJoinAttempted ? error : null;

  const handleInviteCodeSubmit = (code: string) => {
    setManualSubmitPending(true);
    joinRoom(code);
  };

  // Derive isAutoJoining for clear render logic
  const isAutoJoining = autoJoinAttempted && !!urlInviteCode && !room && !error;

  // Derive isManualSubmitting for form state
  const isManualSubmitting = manualSubmitPending && !room && !error;

  // Determine game type from room (must be called before any returns - Rules of Hooks)
  const gameType: GameType = useMemo(() => {
    const gameId = room?.gameId;
    return mapToGameType(gameId);
  }, [room]);

  // Just track loading state, not the component itself
  const [isGameReady, setIsGameReady] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);

  // Memoize game props to prevent re-renders with stale data
  const gameProps = useMemo(() => {
    if (!roomId || !room) return null;
    // Ensure all required BaseGameProps are provided
    return {
      roomId: room.id,
      room,
      session: initialSession as GameSessionSummary | null,
      currentUserId: snapshot.userId,
      isHost,
      onPostHistoryNote: () => {}, // Provide a stub or actual implementation
      config: {
        slug: room.gameId,
        name: '',
        description: '',
        category: '',
        minPlayers: 2,
        maxPlayers: 5,
        version: '1.0.0',
      },
      accessToken: snapshot.accessToken,
    };
  }, [
    roomId,
    room,
    isHost,
    initialSession,
    snapshot.userId,
    snapshot.accessToken,
  ]);

  // Track room loading progress for server wake-up message
  const { isLongPending: isRoomLoadingLongPending } =
    useServerWakeUpProgress(roomLoading);

  // Preload game component using GameFactory
  useEffect(() => {
    // Ensure game metadata is registered in factory
    if (gameMetadata && Object.keys(gameMetadata).length > 0) {
      Object.entries(gameMetadata).forEach(([slug, metadata]) => {
        if (metadata && !gameFactory.getGameMetadata(slug)) {
          gameFactory.registerGameMetadata(metadata);
        }
      });
    }

    if (gameType && gameType in gameMetadata) {
      let isMounted = true;

      const loadGame = async () => {
        setGameLoading(true);
        try {
          await gameFactory.loadGame(gameType);
          if (isMounted) {
            setIsGameReady(true);
            setGameLoading(false);
          }
        } catch {
          if (isMounted) {
            setGameLoading(false);
          }
        }
      };

      loadGame();

      return () => {
        isMounted = false;
      };
    }
  }, [gameType]);

  const { isDisconnected, isReconnecting, reconnect } = useIdleReconnect({
    accessToken: snapshot.accessToken,
    enabled: !!room,
  });

  const { isIdle } = useIdleDetection({
    roomId,
    userId: snapshot.userId,
    enabled: !!room && !isDisconnected,
  });

  // Wait for session to hydrate before checking authentication
  if (!hydrated || roomInfoLoading) {
    return (
      <Page>
        <Container>
          <GameRoomLoading />
        </Container>
      </Page>
    );
  }

  // Show error if room visibility check failed
  if (visibilityError) {
    return (
      <Page>
        <Container>
          <GameRoomError
            error={visibilityError}
            isPrivateRoomError={visibilityError === 'private_room_error'}
          />
        </Container>
      </Page>
    );
  }

  // If we are auto-joining or loading generally (and not manually submitting), show loading
  if (isAutoJoining || (roomLoading && !manualSubmitPending)) {
    return (
      <Page>
        <Container>
          <GameRoomLoading
            isLongPending={isRoomLoadingLongPending}
            actionBusy={roomLoading ? 'joining_room' : null}
            message={
              isAutoJoining
                ? t('games.inviteCode.joining') || 'Joining...'
                : t('games.roomPage.errors.loadingRoom')
            }
          />
        </Container>
      </Page>
    );
  }

  // If we have an error or are submitting code for a private room, show the invite code form
  if (roomVisibility === 'private' && !room) {
    return (
      <Page>
        <Container>
          <PrivateRoomForm
            onJoin={handleInviteCodeSubmit}
            isLoading={isManualSubmitting}
            isLongPending={isRoomLoadingLongPending}
            error={
              inviteCodeError || (error !== inviteCodeError ? error : null)
            }
          />
        </Container>
      </Page>
    );
  }

  if (error && !room) {
    return (
      <Page>
        <Container>
          <GameRoomError error={error} />
        </Container>
      </Page>
    );
  }

  if (!room) {
    return (
      <Page>
        <Container>
          <GameRoomError error={t('games.roomPage.errors.roomNotFound')} />
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container ref={gameContainerRef}>
        <ConnectionOverlay
          visible={isDisconnected}
          reconnecting={isReconnecting}
          onReconnect={reconnect}
          title={t('games.connectionOverlay.title')}
          message={t('games.connectionOverlay.message')}
          reconnectingText={t('games.connectionOverlay.reconnecting')}
          testId="connection-overlay-disconnected"
        />

        {!isDisconnected && (
          <ConnectionOverlay
            visible={isIdle}
            title={t('games.idle.title')}
            message={t('games.idle.message')}
            testId="connection-overlay-idle"
          />
        )}

        <GamesControlPanel
          roomId={roomId}
          inviteCode={room?.inviteCode}
          fullscreenContainerRef={gameContainerRef}
        />

        <GameWrapper>
          <Suspense
            fallback={
              <LoadingContainer>
                {t('games.roomPage.loadingGame')}
              </LoadingContainer>
            }
          >
            {gameLoading && (
              <LoadingContainer>
                {t('games.roomPage.loadingGame')}
              </LoadingContainer>
            )}

            {!gameLoading && !gameType && room && (
              <LoadingContainer>
                {t('games.roomPage.errors.unsupportedGame', {
                  gameId: room.gameId,
                })}
              </LoadingContainer>
            )}

            {!gameLoading && isGameReady && gameType && gameProps && (
              <DynamicGameRenderer gameType={gameType} props={gameProps} />
            )}
          </Suspense>
        </GameWrapper>
      </Container>
    </Page>
  );
}
