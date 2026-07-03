'use client';

import React, {
  useMemo,
  useEffect,
  Suspense,
  useState,
  useCallback,
} from 'react';
import { useQuery } from '@/shared/hooks/useQuery';
import { useParams, useSearchParams } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  connectSockets,
  connectSocketsAnonymous,
  disconnectSockets,
} from '@/shared/lib/socket';
import { GamePageLayout } from './GamePageLayout';
import { gamesApi } from '@/features/games/api';
import { useGameRoom } from '@/features/games/hooks/useGameRoom';
import type { GameType } from '@/features/games/hooks/useGameActions';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useIdleReconnect } from '@/shared/hooks/useIdleReconnect';
import { useIdleDetection } from '@/shared/hooks/useIdleDetection';
import { Page } from '@/shared/ui/Page/Page';
import { mapToGameType } from '@/features/games/lib/gameIdMapping';
import { gameFactory } from '@/features/games/lib/gameFactory';
import { gameMetadata } from '@/features/games/registry';
import type { GameInitialData, GameSessionSummary } from '@/shared/types/games';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';

import { Text } from 'tamagui';
import { Container, LoadingContainer, GameWrapper } from './styles';
import { GameRoomLoading } from './GameRoomLoading';
import { GameRoomError } from './GameRoomError';
import { PrivateRoomForm } from './PrivateRoomForm';
import { PasswordRequiredForm } from './PasswordRequiredForm';
import { DynamicGameRenderer } from './DynamicGameRenderer';

interface GameRoomPageProps {
  initialData: GameInitialData | null;
}

export default function GameRoomPage({
  initialData: serverInitialData,
}: GameRoomPageProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params?.id as string;
  const urlInviteCode = searchParams?.get('inviteCode');
  const { snapshot, hydrated } = useSessionTokens();
  const { t } = useTranslation();
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const [manualSubmitPending, setManualSubmitPending] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const handleShowRules = useCallback(() => setShowRules(true), []);
  const handleCloseRules = useCallback(() => setShowRules(false), []);

  const isAuthenticated = !!snapshot.accessToken && !!snapshot.userId;

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
    initialData: serverInitialData,
  });

  const roomInfo = roomData?.room;
  const initialSessionData = roomData?.session;

  const roomVisibility = useMemo(() => {
    if (roomInfo) return roomInfo.visibility;
    if (queryError?.message === 'private_room_error') return 'private';
    return null;
  }, [roomInfo, queryError]);

  const visibilityError = useMemo(() => {
    if (!queryError) return null;
    const msg = queryError.message;
    if (msg === 'private_room_error') return null;
    if (msg === 'room_not_found_error')
      return t('games.roomPage.errors.roomNotFoundError');
    return t('games.roomPage.errors.failedToLoadError');
  }, [queryError, t]);

  const roomMode = useMemo(() => {
    if (roomInfoLoading || !roomInfo) return 'play';
    const requestedMode = searchParams?.get('mode');
    if (requestedMode === 'watch') return 'watch';
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
  }, [roomInfoLoading, roomInfo, snapshot.userId, isAuthenticated, searchParams]);

  useEffect(() => {
    if (roomInfoLoading || visibilityError) return;
    if (!roomInfo && roomVisibility !== 'private') return;
    if (isAuthenticated) {
      connectSockets(snapshot.accessToken);
    } else if (snapshot.userId || roomVisibility === 'public') {
      connectSocketsAnonymous();
    }
    return () => {
      disconnectSockets();
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

  const initialData: GameInitialData = useMemo(
    () => ({ room: roomInfo, session: initialSessionData }),
    [roomInfo, initialSessionData],
  );

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
    enabled: (!roomInfoLoading || !!serverInitialData) && !visibilityError,
    initialData,
  });

  const isPasswordRequiredError = useMemo(() => {
    if (!error) return false;
    return (
      error === 'Room requires a password' ||
      error === 'Invalid room password'
    );
  }, [error]);

  useEffect(() => {
    if (
      !room &&
      roomVisibility === 'private' &&
      urlInviteCode &&
      !autoJoinAttempted &&
      !error
    ) {
      queueMicrotask(() => {
        setAutoJoinAttempted(true);
      });
    }
  }, [room, roomVisibility, urlInviteCode, autoJoinAttempted, error]);

  useEffect(() => {
    if ((error || room) && manualSubmitPending) {
      queueMicrotask(() => {
        setManualSubmitPending(false);
      });
    }
  }, [error, room, manualSubmitPending]);

  const inviteCodeError = autoJoinAttempted ? error : null;

  const handleInviteCodeSubmit = (code: string) => {
    setManualSubmitPending(true);
    joinRoom(code);
  };

  const handlePasswordSubmit = (password: string) => {
    setManualSubmitPending(true);
    joinRoom(undefined, password);
  };

  const isAutoJoining = autoJoinAttempted && !!urlInviteCode && !room && !error;
  const isManualSubmitting = manualSubmitPending && !room && !error;

  const gameType: GameType = useMemo(() => {
    const gameId = room?.gameId;
    return mapToGameType(gameId);
  }, [room]);

  const [isGameReady, setIsGameReady] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);

  const gamePropsBase = useMemo(() => {
    if (!roomId || !room) return null;
    return {
      roomId: room.id,
      room,
      session: initialSession as GameSessionSummary | null,
      currentUserId: snapshot.userId,
      isHost,
      accessToken: snapshot.accessToken,
      showRulesOpen: showRules,
      onShowRulesClose: handleCloseRules,
    };
  }, [
    roomId,
    room,
    isHost,
    initialSession,
    snapshot.userId,
    snapshot.accessToken,
    showRules,
    handleCloseRules,
  ]);

  const { isLongPending: isRoomLoadingLongPending } =
    useServerWakeUpProgress(roomLoading);

  useEffect(() => {
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

  if (!hydrated || (roomInfoLoading && !serverInitialData)) {
    return (
      <Page fixedHeight>
        <Container>
          <GameRoomLoading />
        </Container>
      </Page>
    );
  }

  if (visibilityError) {
    return (
      <Page fixedHeight>
        <Container>
          <GameRoomError
            error={visibilityError}
            isPrivateRoomError={visibilityError === 'private_room_error'}
          />
        </Container>
      </Page>
    );
  }

  if (isAutoJoining || (roomLoading && !room && !manualSubmitPending)) {
    return (
      <Page fixedHeight>
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

  if (roomVisibility === 'private' && !room) {
    return (
      <Page fixedHeight>
        <Container>
          <PrivateRoomForm
            onJoin={handleInviteCodeSubmit}
            isLoading={isManualSubmitting}
            isLongPending={isRoomLoadingLongPending}
            error={
              inviteCodeError || (error !== inviteCodeError ? error : null)
            }
            hasPassword={roomInfo?.hasPassword}
          />
        </Container>
      </Page>
    );
  }

  if (isPasswordRequiredError && !room && roomInfo) {
    return (
      <Page fixedHeight>
        <Container>
          <PasswordRequiredForm
            onJoin={handlePasswordSubmit}
            isLoading={isManualSubmitting}
            isLongPending={isRoomLoadingLongPending}
            error={
              error === 'Room requires a password'
                ? null
                : error === 'Invalid room password'
                  ? t('games.password.incorrect')
                  : error
            }
          />
        </Container>
      </Page>
    );
  }

  if (error && !room) {
    return (
      <Page fixedHeight>
        <Container>
          <GameRoomError error={error} />
        </Container>
      </Page>
    );
  }

  if (!room) {
    return (
      <Page fixedHeight>
        <Container>
          <GameRoomError error={t('games.roomPage.errors.roomNotFound')} />
        </Container>
      </Page>
    );
  }

  return (
    <Page fixedHeight>
      <GamePageLayout
        roomId={roomId}
        room={room}
        session={initialSession as GameSessionSummary | null}
        userId={snapshot.userId}
        inviteCode={room?.inviteCode}
        isDisconnected={isDisconnected}
        isReconnecting={isReconnecting}
        isIdle={isIdle}
        isSpectating={roomMode === 'watch'}
        onReconnect={reconnect}
        onShowRules={handleShowRules}
      >
        {({ isFullscreen, toggleFullscreen }) => {
          const gameProps = gamePropsBase
            ? { ...gamePropsBase, isFullscreen, toggleFullscreen }
            : null;

          return (
            <GameWrapper>
              <Suspense
                fallback={
                  <LoadingContainer>
                    <Text>{t('games.roomPage.loadingGame')}</Text>
                  </LoadingContainer>
                }
              >
                {gameLoading && (
                  <LoadingContainer>
                    <Text>{t('games.roomPage.loadingGame')}</Text>
                  </LoadingContainer>
                )}

                {!gameLoading && !gameType && room && (
                  <LoadingContainer>
                    <Text>
                      {t('games.roomPage.errors.unsupportedGame', {
                        gameId: room.gameId,
                      })}
                    </Text>
                  </LoadingContainer>
                )}

                {!gameLoading && isGameReady && gameType && gameProps && (
                  <DynamicGameRenderer gameType={gameType} props={gameProps} />
                )}
              </Suspense>
            </GameWrapper>
          );
        }}
      </GamePageLayout>
    </Page>
  );
}
