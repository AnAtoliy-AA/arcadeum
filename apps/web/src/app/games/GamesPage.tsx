'use client';

import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi, GetRoomsResponse } from '@/features/games/api';
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

export function GamesPage() {
  const { snapshot } = useSessionTokens();

  const [statusFilter, setStatusFilter] = useState<GamesStatusFilter>('all');
  const [participationFilter, setParticipationFilter] =
    useState<GamesParticipationFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<GamesViewMode>('grid');

  // Pagination state
  const [limit] = useState(PAGE_SIZE);

  const handleStatusChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
  };

  const handleParticipationChange = (
    participation: typeof participationFilter,
  ) => {
    setParticipationFilter(participation);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const {
    data,
    isLoading,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GetRoomsResponse>({
    queryKey: [
      'games',
      'list',
      statusFilter,
      participationFilter,
      searchQuery,
      limit,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return gamesApi.getRooms(
        {
          status: statusFilter,
          participation: participationFilter,
          search: searchQuery || undefined,
          page: pageParam as number,
          limit,
        },
        { token: snapshot.accessToken || undefined },
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
  });

  // Track loading progress for server wake-up message
  const {
    isLongPending: isLoadingLongPending,
    progress: loadingProgress,
    elapsedSeconds: loadingElapsedSeconds,
  } = useServerWakeUpProgress(isLoading);

  const rooms = useMemo(() => {
    return data?.pages.flatMap((page) => page.rooms) || [];
  }, [data]);

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
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
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
