"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";
import { ERROR_COLOR } from "@/shared/config/payment-config";
import { gameSocket, connectSockets } from "@/shared/lib/socket";
import { startGameRoom, getGameRoomSession } from "@/shared/api/gamesApi";
import type { GameRoomSummary, GameSessionSummary } from "@/shared/types/games";
import { ExplodingCatsGame } from "./components/ExplodingCatsGame";

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const RoomInfo = styled.div`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RoomMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const ParticipantsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ParticipantsTitle = styled.div`
  font-weight: 600;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const ParticipantsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ParticipantBadge = styled.span<{ $isHost?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  background: ${({ $isHost, theme }) =>
    $isHost
      ? theme.interactive.pill.activeBackground
      : theme.interactive.pill.inactiveBackground};
  border: 1px solid
    ${({ $isHost, theme }) =>
      $isHost ? theme.interactive.pill.activeBorder : theme.interactive.pill.border};
  box-shadow: ${({ $isHost, theme }) =>
    $isHost ? theme.interactive.pill.activeShadow : "none"};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.surfaces.card.border};
  border-top-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${ERROR_COLOR};
  color: ${ERROR_COLOR};
`;

const GameArea = styled.div`
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text.muted};
`;

export function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<GameRoomSummary | null>(null);
  const [session, setSession] = useState<GameSessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [startBusy, setStartBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const isHost = useMemo(() => {
    return room?.hostId === snapshot.userId;
  }, [room, snapshot.userId]);

  const gameIntegration = useMemo(() => {
    const gameId = room?.gameId || session?.gameId || session?.engine;
    if (gameId === "exploding_cats_v1" || gameId === "exploding-kittens") {
      return "exploding_cats_v1";
    }
    return null;
  }, [room, session]);

  const fetchRoom = useCallback(async () => {
    if (!snapshot.accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = resolveApiUrl(`/games/rooms/${roomId}`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room");
      }

      const data = await response.json();
      setRoom(data.room);

      // Also fetch session if it exists
      try {
        const sessionData = await getGameRoomSession(roomId, snapshot.accessToken);
        setSession(sessionData.session);
      } catch {
        setSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomId, snapshot.accessToken]);

  // Connect to socket and setup event listeners
  useEffect(() => {
    if (!snapshot.accessToken || !roomId) return;

    // Connect socket with auth
    connectSockets(snapshot.accessToken);

    const handleConnect = () => {
      // Join the room as participant or watcher
      const joinEvent = snapshot.userId ? "games.room.join" : "games.room.watch";
      const joinPayload = snapshot.userId
        ? { roomId, userId: snapshot.userId }
        : { roomId };
      gameSocket.emit(joinEvent, joinPayload);
    };

    const handleJoined = (payload: {
      room?: GameRoomSummary;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.room) {
        setRoom(payload.room);
      }
      if (payload && Object.prototype.hasOwnProperty.call(payload, "session")) {
        setSession(payload?.session ?? null);
      }
    };

    const handleRoomUpdate = (payload: { room?: GameRoomSummary }) => {
      if (payload?.room && payload.room.id === roomId) {
        setRoom(payload.room);
      }
    };

    const handleSnapshot = (payload: {
      roomId?: string;
      session?: GameSessionSummary | null;
    }) => {
      if (payload?.roomId && payload.roomId !== roomId) return;
      if (payload && Object.prototype.hasOwnProperty.call(payload, "session")) {
        setSession(payload?.session ?? null);
      }
      setActionBusy(null);
    };

    const handleSessionStarted = (payload: {
      room: GameRoomSummary;
      session: GameSessionSummary;
    }) => {
      if (!payload?.room || payload.room.id !== roomId) return;
      setRoom(payload.room);
      setSession(payload.session);
      setStartBusy(false);
      setActionBusy(null);
    };

    const handleException = (payload: unknown) => {
      setStartBusy(false);
      setActionBusy(null);

      const detail =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : undefined;

      const message =
        typeof detail?.message === "string"
          ? detail.message
          : typeof payload === "string"
          ? payload
          : "An error occurred";

      setError(message);
      setTimeout(() => setError(null), 5000);
    };

    gameSocket.on("connect", handleConnect);
    gameSocket.on("games.room.joined", handleJoined);
    gameSocket.on("games.room.watching", handleJoined);
    gameSocket.on("games.room.update", handleRoomUpdate);
    gameSocket.on("games.session.snapshot", handleSnapshot);
    gameSocket.on("games.session.started", handleSessionStarted);
    gameSocket.on("exception", handleException);

    if (gameSocket.connected) {
      handleConnect();
    }

    return () => {
      gameSocket.off("connect", handleConnect);
      gameSocket.off("games.room.joined", handleJoined);
      gameSocket.off("games.room.watching", handleJoined);
      gameSocket.off("games.room.update", handleRoomUpdate);
      gameSocket.off("games.session.snapshot", handleSnapshot);
      gameSocket.off("games.session.started", handleSessionStarted);
      gameSocket.off("exception", handleException);
    };
  }, [roomId, snapshot.accessToken, snapshot.userId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const handleJoin = useCallback(async () => {
    if (!snapshot.accessToken || !room) return;

    setJoining(true);
    try {
      const url = resolveApiUrl(`/games/rooms/${roomId}/join`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to join room");
      }

      await fetchRoom();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setJoining(false);
    }
  }, [roomId, snapshot.accessToken, room, fetchRoom]);

  const handleStartGame = useCallback(() => {
    if (!room?.id || !snapshot.accessToken || !isHost || startBusy) return;

    setStartBusy(true);
    startGameRoom(room.id, "exploding_cats_v1", snapshot.accessToken)
      .then((response) => {
        setRoom(response.room);
        setSession(response.session);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to start game";
        setError(message);
        setTimeout(() => setError(null), 5000);
      })
      .finally(() => {
        setStartBusy(false);
      });
  }, [room, snapshot.accessToken, isHost, startBusy]);

  const handleDrawCard = useCallback(() => {
    if (!room?.id || !snapshot.userId || actionBusy) return;

    setActionBusy("draw");
    gameSocket.emit("games.session.draw", {
      roomId: room.id,
      userId: snapshot.userId,
    });
  }, [room, snapshot.userId, actionBusy]);

  const handlePlayCard = useCallback(
    (card: "skip" | "attack") => {
      if (!room?.id || !snapshot.userId || actionBusy) return;

      setActionBusy(card);
      gameSocket.emit("games.session.play_action", {
        roomId: room.id,
        userId: snapshot.userId,
        card,
      });
    },
    [room, snapshot.userId, actionBusy]
  );

  if (loading) {
    return (
      <Page>
        <Container>
          <Loading>
            <Spinner aria-label="Loading" />
            <div>Loading room...</div>
          </Loading>
        </Container>
      </Page>
    );
  }

  if (error || !room) {
    return (
      <Page>
        <Container>
          <ErrorMessage>{error || "Room not found"}</ErrorMessage>
        </Container>
      </Page>
    );
  }

  const canJoin = !isHost && room.status === "lobby";

  return (
    <Page>
      <Container>
        <Header>
          <Title>{room.name}</Title>
          {canJoin && (
            <Button onClick={handleJoin} disabled={joining}>
              {joining
                ? t("games.common.joining") || "Joining..."
                : t("games.common.joinRoom") || "Join Room"}
            </Button>
          )}
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <RoomInfo>
          <RoomMeta>
            <div>
              {t("games.rooms.hostedBy", { host: room.host?.displayName || room.hostId }) ||
                `Hosted by ${room.host?.displayName || room.hostId}`}
            </div>
            <div>
              {room.maxPlayers
                ? `${room.playerCount}/${room.maxPlayers} players`
                : `${room.playerCount} players`}
            </div>
            <div>
              {t(`games.rooms.status.${room.status}`) || room.status}
            </div>
            <div>
              {room.visibility === "private" ? "🔒 Private" : "🌐 Public"}
            </div>
          </RoomMeta>

          {room.members && room.members.length > 0 && (
            <ParticipantsSection>
              <ParticipantsTitle>
                {t("games.rooms.participants") || "Participants"}:
              </ParticipantsTitle>
              <ParticipantsList>
                {room.members.map((member) => (
                  <ParticipantBadge
                    key={member.id}
                    $isHost={room.host?.id === member.id}
                  >
                    {member.displayName}
                  </ParticipantBadge>
                ))}
              </ParticipantsList>
            </ParticipantsSection>
          )}
        </RoomInfo>

        {gameIntegration === "exploding_cats_v1" ? (
          <ExplodingCatsGame
            room={room}
            session={session}
            currentUserId={snapshot.userId}
            isHost={isHost}
            onStart={handleStartGame}
            onDraw={handleDrawCard}
            onPlayCard={handlePlayCard}
            actionBusy={actionBusy}
            startBusy={startBusy}
          />
        ) : (
          <GameArea>
            {t("games.room.gameArea") ||
              "This game is not yet available in the web version"}
          </GameArea>
        )}
      </Container>
    </Page>
  );
}

