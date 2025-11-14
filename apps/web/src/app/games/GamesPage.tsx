"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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

const Filters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const FilterChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.gradientStart : theme.surfaces.card.background};
  color: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.text : theme.text.primary};
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RoomsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RoomCard = styled.div`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
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
  color: ${({ theme }) => theme.text.primary};
`;

const RoomMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const RoomActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const ActionButton = styled(Link)<{ variant?: "primary" | "secondary" }>`
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  ${({ variant, theme }) =>
    variant === "primary"
      ? `
    background: ${theme.buttons.primary.gradientStart};
    color: ${theme.buttons.primary.text};
  `
      : `
    border: 1px solid ${theme.buttons.secondary.border};
    color: ${theme.buttons.secondary.text};
    background: ${theme.buttons.secondary.background};
  `}

  &:hover {
    transform: translateY(-1px);
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

const Error = styled.div`
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid #F97316;
  color: #F97316;
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
  inviteCode?: string;
  host?: {
    id: string;
    displayName: string;
    username?: string | null;
    email?: string | null;
    isHost: boolean;
  };
  members?: Array<{
    id: string;
    displayName: string;
    username?: string | null;
    email?: string | null;
    isHost: boolean;
  }>;
}

export function GamesPage() {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<GameRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "lobby" | "in_progress" | "completed">("all");
  const [participationFilter, setParticipationFilter] = useState<"all" | "hosting" | "joined" | "not_joined">("all");

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("statuses", statusFilter);
      }
      if (participationFilter !== "all") {
        params.append("participation", participationFilter);
      }

      const url = resolveApiUrl(`/games/rooms?${params.toString()}`);
      const headers: HeadersInit = {};
      
      if (snapshot.accessToken) {
        headers.Authorization = `Bearer ${snapshot.accessToken}`;
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new globalThis.Error(`Failed to fetch rooms: ${response.status}`);
      }

      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err) {
      setError(err instanceof globalThis.Error ? err.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, participationFilter, snapshot.accessToken]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [rooms]);

  return (
    <Page>
      <Container>
        <Header>
          <Title>{t("games.lounge.activeTitle") || "Game Rooms"}</Title>
          <CreateButton href="/games/create">
            {t("games.common.createRoom") || "Create Room"}
          </CreateButton>
        </Header>

        <Filters>
          <FilterGroup>
            <FilterLabel>{t("games.lounge.filters.statusLabel") || "Status"}</FilterLabel>
            <FilterChips>
              {(["all", "lobby", "in_progress", "completed"] as const).map((value) => {
                const statusKeys = {
                  all: "games.lounge.filters.status.all",
                  lobby: "games.lounge.filters.status.lobby",
                  in_progress: "games.lounge.filters.status.in_progress",
                  completed: "games.lounge.filters.status.completed",
                } as const;
                const label = t(statusKeys[value]);
                return (
                  <FilterChip
                    key={value}
                    $active={statusFilter === value}
                    onClick={() => setStatusFilter(value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setStatusFilter(value);
                      }
                    }}
                    aria-label={`Filter by status: ${label || value}`}
                    aria-pressed={statusFilter === value}
                    role="button"
                    tabIndex={0}
                  >
                    {label || value}
                  </FilterChip>
                );
              })}
            </FilterChips>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              {t("games.lounge.filters.participationLabel") || "Participation"}
            </FilterLabel>
            <FilterChips>
              {(["all", "hosting", "joined", "not_joined"] as const).map((value) => {
                const participationKeys = {
                  all: "games.lounge.filters.participation.all",
                  hosting: "games.lounge.filters.participation.hosting",
                  joined: "games.lounge.filters.participation.joined",
                  not_joined: "games.lounge.filters.participation.not_joined",
                } as const;
                const label = t(participationKeys[value]);
                return (
                  <FilterChip
                    key={value}
                    $active={participationFilter === value}
                    onClick={() => setParticipationFilter(value)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !(value !== "all" && !snapshot.accessToken)) {
                        e.preventDefault();
                        setParticipationFilter(value);
                      }
                    }}
                    disabled={value !== "all" && !snapshot.accessToken}
                    aria-label={`Filter by participation: ${label || value}`}
                    aria-pressed={participationFilter === value}
                    role="button"
                    tabIndex={value !== "all" && !snapshot.accessToken ? -1 : 0}
                  >
                    {label || value}
                  </FilterChip>
                );
              })}
            </FilterChips>
          </FilterGroup>
        </Filters>

        <RoomsContainer>
          {loading ? (
            <Loading>
              <Spinner aria-label="Loading" />
              <div>Loading rooms...</div>
            </Loading>
          ) : error ? (
            <Error>{error}</Error>
          ) : sortedRooms.length === 0 ? (
            <Empty>
              {t("games.lounge.emptyTitle") || "No rooms found. Create one to get started!"}
            </Empty>
          ) : (
            sortedRooms.map((room: GameRoomSummary) => (
              <RoomCard key={room.id}>
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
                  <div>
                    {room.visibility === "private" ? "🔒 Private" : "🌐 Public"}
                  </div>
                </RoomMeta>
                <RoomActions>
                  <ActionButton
                    href={`/games/rooms/${room.id}`}
                    variant="primary"
                  >
                    {t("games.common.joinRoom") || "Join Room"}
                  </ActionButton>
                  <ActionButton
                    href={`/games/rooms/${room.id}`}
                    variant="secondary"
                  >
                    {t("games.common.watchRoom") || "Watch"}
                  </ActionButton>
                </RoomActions>
              </RoomCard>
            ))
          )}
        </RoomsContainer>
      </Container>
    </Page>
  );
}

