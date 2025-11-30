"use client";

import React, { useMemo, useEffect, Suspense, useState } from "react";
import { useParams } from "next/navigation";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { connectSockets } from "@/shared/lib/socket";
import { GamesControlPanel } from "@/widgets/GamesControlPanel";
import { useGameRoom, type GameType } from "@/features/games/hooks";
import { useTranslation } from "@/shared/lib/useTranslation";
import { mapToGameType } from "@/features/games/lib/gameIdMapping";
import { gameFactory } from "@/features/games/lib/gameFactory";
import { gameMetadata } from "@/features/games/registry";
import { BaseGameProps } from "@/features/games";
import type { GameSessionSummary } from "@/shared/types/games";

export default function GameRoomPage() {
  const params = useParams();
  const roomId = params?.id as string;
  const { snapshot, hydrated } = useSessionTokens();
  const { t } = useTranslation();


  // Connect sockets on mount
  useEffect(() => {
    if (snapshot.accessToken) {
      connectSockets(snapshot.accessToken);
    } else {
    }
  }, [snapshot.accessToken]);

  // Get room state
  const { room, session: initialSession, loading: roomLoading, error, isHost } = useGameRoom({
    roomId,
    userId: snapshot.userId,
    accessToken: snapshot.accessToken,
  });


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
    };
  }, [roomId, room, isHost, initialSession, snapshot.userId]);

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

  // Wait for session to hydrate before checking authentication
  if (!hydrated) {
    return (
      <Page>
        <Container>
          <LoadingContainer>{t("games.roomPage.loading")}</LoadingContainer>
        </Container>
      </Page>
    );
  }

  // Redirect to login if not authenticated
  if (!snapshot.accessToken || !snapshot.userId) {
    return (
      <Page>
        <Container>
          <ErrorContainer>
            {t("games.roomPage.errors.notAuthenticated")}
            <br />
            <a href="/auth" style={{ color: '#3b82f6', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>
              {t("games.roomPage.errors.loginButton")}
            </a>
          </ErrorContainer>
        </Container>
      </Page>
    );
  }

  if (roomLoading) {
    return (
      <Page>
        <Container>
          <LoadingContainer>{t("games.roomPage.errors.loadingRoom")}</LoadingContainer>
        </Container>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Container>
          <ErrorContainer>{error}</ErrorContainer>
        </Container>
      </Page>
    );
  }

  if (!room) {
    return (
      <Page>
        <Container>
          <ErrorContainer>{t("games.roomPage.errors.roomNotFound")}</ErrorContainer>
        </Container>
      </Page>
    );
  }

  // Render appropriate game with Suspense for lazy loading
  // Games manage their own session state and actions via hooks
  return (
    <Page>
      <Container>
        <GamesControlPanel roomId={roomId} />

        <GameWrapper>
          <Suspense fallback={<LoadingContainer>{t("games.roomPage.loadingGame")}</LoadingContainer>}>
            {gameLoading && (
              <LoadingContainer>{t("games.roomPage.loadingGame")}</LoadingContainer>
            )}

            {!gameLoading && !gameType && room && (
              <LoadingContainer>
                {t("games.roomPage.errors.unsupportedGame", { gameId: room.gameId })}
              </LoadingContainer>
            )}

            {!gameLoading && isGameReady && gameType && gameProps && (
              <DynamicGameRenderer
                gameType={gameType}
                props={gameProps}
              />
            )}
          </Suspense>
        </GameWrapper>
      </Container>
    </Page>
  );
}

interface DynamicGameRendererProps {
  gameType: GameType;
  props: BaseGameProps;
}


const DynamicGameRenderer: React.FC<DynamicGameRendererProps> = ({ gameType, props }) => {
  if (!gameType) {
    return <div>Game type is missing</div>;
  }

  if (!props || !props.room) {
    return <div>Game data is incomplete</div>;
  }

  // Simple direct rendering without caching for now
  const LoadedGame = gameFactory.getLoadedGame(gameType);
  if (!LoadedGame) {
    return <div>Game component not found</div>;
  }

  return React.createElement(LoadedGame, props);
};

/* ==========================================================================
   Styled Components
   ========================================================================== */

const Page = styled.main`
  min-height: 100vh;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  position: relative;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: #dc2626;
`;

const GameWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
