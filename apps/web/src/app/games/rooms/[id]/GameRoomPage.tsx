"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";
import { ERROR_COLOR } from "@/shared/config/payment-config";

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

interface GameRoomSummary {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  visibility: "public" | "private";
  playerCount: number;
  maxPlayers: number | null;
  status: "lobby" | "in_progress" | "completed";
  host?: {
    id: string;
    displayName: string;
  };
  members?: Array<{
    id: string;
    displayName: string;
  }>;
}

export function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<GameRoomSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomId, snapshot.accessToken]);

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

  const isHost = room.hostId === snapshot.userId;
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
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                {t("games.rooms.participants") || "Participants"}:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {room.members.map((member) => (
                  <span key={member.id} style={{ padding: "0.25rem 0.5rem", background: "#f0f0f0", borderRadius: "4px" }}>
                    {member.displayName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </RoomInfo>

        <GameArea>
          {t("games.room.gameArea") || "Game area - Real-time game integration coming soon"}
        </GameArea>
      </Container>
    </Page>
  );
}

