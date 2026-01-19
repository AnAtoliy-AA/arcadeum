'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';
import { GamesEmpty } from './components/GamesEmpty';
import { GamesError } from './components/GamesError';
import { GamesFilters } from './components/GamesFilters';
import { GamesHeader } from './components/GamesHeader';
import { GamesList } from './components/GamesList';
import { GamesLoading } from './components/GamesLoading';
import { Container, Page, RoomsContainer } from './styles';
import type {
  GamesParticipationFilter,
  GamesStatusFilter,
  GamesViewMode,
} from './types';

const PAGE_SIZE = 12;
const INITIAL_PAGE = 1;

export function GamesPage() {
  const { snapshot } = useSessionTokens();

  const [statusFilter, setStatusFilter] = useState<GamesStatusFilter>('all');
  const [participationFilter, setParticipationFilter] =
    useState<GamesParticipationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<GamesViewMode>('grid');

  // Pagination state
  const [page, setPage] = useState(INITIAL_PAGE);
  const [limit] = useState(PAGE_SIZE);

  const handleStatusChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setPage(INITIAL_PAGE);
  };

  const handleParticipationChange = (
    participation: typeof participationFilter,
  ) => {
    setParticipationFilter(participation);
    setPage(INITIAL_PAGE);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(INITIAL_PAGE);
  };

  const {
    data: roomsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: [
      'games',
      'list',
      statusFilter,
      participationFilter,
      searchQuery,
      page,
      limit,
    ],
    queryFn: async () => {
      return gamesApi.getRooms(
        {
          status: statusFilter,
          participation: participationFilter,
          search: searchQuery || undefined,
          page,
          limit,
        },
        { token: snapshot.accessToken || undefined },
      );
    },
    // Keep previous data while fetching new data for smoother pagination
    placeholderData: (previousData) => previousData,
  });

  // Track loading progress for server wake-up message
  const {
    isLongPending: isLoadingLongPending,
    progress: loadingProgress,
    elapsedSeconds: loadingElapsedSeconds,
  } = useServerWakeUpProgress(isLoading);

  const roomsRaw = roomsData?.rooms;
  const rooms = useMemo(() => roomsRaw || [], [roomsRaw]);
  const total = roomsData?.total || 0;
  const loading = isLoading;
  const error =
    queryError instanceof globalThis.Error
      ? queryError.message
      : queryError
        ? 'Failed to load rooms'
        : null;

  const sortedRooms = useMemo(() => {
    return [...rooms].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rooms]);

  const totalPages = Math.ceil(total / limit);

  const renderContent = () => {
    if (loading) {
      return (
        <GamesLoading
          isLoadingLongPending={isLoadingLongPending}
          loadingProgress={loadingProgress}
          loadingElapsedSeconds={loadingElapsedSeconds}
        />
      );
    }

    if (error) {
      return <GamesError error={error} />;
    }

    if (sortedRooms.length === 0) {
      return <GamesEmpty />;
    }

    return (
      <GamesList
        rooms={sortedRooms}
        viewMode={viewMode}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    );
  };

  return (
    <Page>
      <Container>
        <GamesHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        <GamesFilters
          searchQuery={searchQuery}
          onSearch={handleSearch}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          participationFilter={participationFilter}
          onParticipationChange={handleParticipationChange}
          isAuthenticated={!!snapshot.accessToken}
        />

        <RoomsContainer $viewMode={viewMode}>{renderContent()}</RoomsContainer>
      </Container>
    </Page>
  );
}
