"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styled from "styled-components";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const RoomCard = styled(Link)`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  text-decoration: none;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
  }
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const RoomTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ status }) => {
    if (status === "lobby") return "#DCFCE7";
    if (status === "in_progress") return "#FDE68A";
    return "#E2E8F0";
  }};
`;

const RoomMeta = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Empty = styled.div`
  padding: 3rem;
  text-align: center;
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
  createdAt: string;
  status: "lobby" | "in_progress" | "completed";
  host?: {
    id: string;
    displayName: string;
  };
}

export function GameDetailPage() {
  const params = useParams();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const gameId = params?.id as string;

  const [rooms, setRooms] = useState<GameRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const url = resolveApiUrl(`/games/rooms?gameId=${gameId}`);
      const headers: HeadersInit = {};
      
      if (snapshot.accessToken) {
        headers.Authorization = `Bearer ${snapshot.accessToken}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  }, [gameId, snapshot.accessToken]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <Page>
      <Container>
        <Title>{t("games.detail.title") || `Game Rooms`}</Title>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <CreateButton href={`/games/create?gameId=${gameId}`}>
            {t("games.common.createRoom") || "Create Room"}
          </CreateButton>
        </div>

        {loading ? (
          <Loading>Loading rooms...</Loading>
        ) : rooms.length === 0 ? (
          <Empty>
            {t("games.detail.empty") || "No rooms found for this game"}
          </Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {rooms.map((room) => (
              <RoomCard key={room.id} href={`/games/rooms/${room.id}`}>
                <RoomHeader>
                  <RoomTitle>{room.name}</RoomTitle>
                  <StatusBadge status={room.status}>
                    {t(`games.rooms.status.${room.status}`) || room.status}
                  </StatusBadge>
                </RoomHeader>
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
                </RoomMeta>
              </RoomCard>
            ))}
          </div>
        )}
      </Container>
    </Page>
  );
}

