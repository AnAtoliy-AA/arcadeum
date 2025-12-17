"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSessionTokens } from "@/entities/session/model/useSessionTokens";
import { resolveApiUrl } from "@/shared/lib/api-base";
import { useTranslation } from "@/shared/lib/useTranslation";

import {
  Page,
  Container,
  Header,
  Title,
  CreateButton,
  Filters,
  FilterGroup,
  FilterLabel,
  FilterChips,
  FilterChip,
  RoomsContainer,
  RoomCard,
  RoomHeader,
  RoomTitle,
  StatusBadge,
  RoomMeta,
  MetaRow,
  MetaIcon,
  MetaLabel,
  MetaValue,
  RoomActions,
  ParticipantsList,
  ParticipantChip,
  ActionButton,
  Loading,
  Spinner,
  Error,
  Empty,
} from "./styles";

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

  const formatMemberLabel = useCallback(
    (member: {
      id: string;
      displayName: string;
      username?: string | null;
      email?: string | null;
      isHost: boolean;
    }) => {
      if (member.displayName && member.displayName.trim().length > 0) {
        return member.displayName;
      }
      return member.username ?? member.email ?? member.id;
    },
    []
  );

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
                  <MetaRow>
                    <MetaIcon>👑</MetaIcon>
                    <MetaLabel>{t("games.rooms.hostLabel") || "Hosted by"}</MetaLabel>
                    <MetaValue>{room.host?.displayName || room.hostId}</MetaValue>
                  </MetaRow>
                  <MetaRow>
                    <MetaIcon>👥</MetaIcon>
                    <MetaLabel>{t("games.rooms.playersLabel") || "Players"}</MetaLabel>
                    <MetaValue>
                      {room.maxPlayers
                        ? `${room.playerCount}/${room.maxPlayers}`
                        : `${room.playerCount}`}
                    </MetaValue>
                  </MetaRow>
                  <MetaRow>
                    <MetaIcon>⏱️</MetaIcon>
                    <MetaLabel>{t("games.rooms.statusLabel") || "Status"}</MetaLabel>
                    <MetaValue>{t(`games.rooms.status.${room.status}`) || room.status}</MetaValue>
                  </MetaRow>
                  <MetaRow>
                    <MetaIcon>{room.visibility === "private" ? "🔒" : "🌐"}</MetaIcon>
                    <MetaLabel>{t("games.rooms.visibilityLabel") || "Visibility"}</MetaLabel>
                    <MetaValue>
                      {room.visibility === "private"
                        ? t("games.rooms.visibility.private") || "Private"
                        : t("games.rooms.visibility.public") || "Public"}
                    </MetaValue>
                  </MetaRow>
                  {room.members && room.members.length > 0 && (
                    <div>
                      <MetaLabel style={{ display: "block", marginBottom: "0.35rem" }}>
                        {t("games.rooms.participants") || "Participants"}:
                      </MetaLabel>
                      <ParticipantsList>
                        {room.members.slice(0, 5).map((member) => (
                          <ParticipantChip
                            key={member.id}
                            $isHost={room.host?.id === member.id}
                          >
                            {formatMemberLabel(member)}
                          </ParticipantChip>
                        ))}
                        {room.members.length > 5 && (
                          <ParticipantChip>
                            +{room.members.length - 5} more
                          </ParticipantChip>
                        )}
                      </ParticipantsList>
                    </div>
                  )}
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

