'use client';

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useDeferredValue,
  useRef,
} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useInfiniteQuery } from '@/shared/hooks/useInfiniteQuery';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi, GetRoomsResponse } from '@/features/games/api';
import { gameMetadata } from '@/features/games/registry';
import { GameCard } from '@/features/games/ui/GameCard';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';
import { gameSocket } from '@/shared/lib/socket';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { GamesEmpty } from './components/GamesEmpty';
import { GamesError } from './components/GamesError';
import { GamesFilters } from './components/GamesFilters';
import { GamesHeader } from './components/GamesHeader';
import { GamesList } from './components/GamesList';
import { GamesLoading } from './components/GamesLoading';
import { PageLayout, Container, GlassCard } from '@arcadeum/ui';
import styles from './GamesPage.module.scss';
import type {
  GamesParticipationFilter,
  GamesStatusFilter,
  GamesCategoryFilter,
  GamesAiVsAiFilter,
  GamesViewMode,
} from './types';
import {
  parseStatusFilterFromUrl,
  serializeStatusFilterToUrl,
  parseAiVsAiFilterFromUrl,
  serializeAiVsAiFilterToUrl,
} from './types';

const PAGE_SIZE = 12;

interface GamesPageProps {
  initialData: GetRoomsResponse | null;
  gameId?: string;
  pageTitle?: string;
}

export default function GamesPage({
  initialData,
  gameId,
  pageTitle,
}: GamesPageProps) {
  const { snapshot, hydrated } = useSessionTokens();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedStatuses = useMemo<GamesStatusFilter>(() => {
    const raw = searchParams ? searchParams.get('status') : null;
    if (raw === null || raw === undefined) {
      return [];
    }
    return parseStatusFilterFromUrl(raw);
  }, [searchParams]);
  const participationFilter =
    (searchParams?.get('participation') as GamesParticipationFilter) || 'all';
  const aiVsAiFilter = parseAiVsAiFilterFromUrl(
    searchParams?.get('aiVsAi') ?? null,
  );
  const initialSearchQuery = searchParams?.get('search') || '';
  const categoryFilterParam = searchParams?.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [viewMode, setViewMode] = useState<GamesViewMode>('grid');
  const [categoryFilter, setCategoryFilter] =
    useState<GamesCategoryFilter>(categoryFilterParam);

  // Update URL helper - ref to current params to avoid dependency loop
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const currentParams = new URLSearchParams(
        searchParamsRef.current?.toString() || '',
      );
      let changed = false;

      Object.entries(updates).forEach(([key, value]) => {
        const currentValue = currentParams.get(key);
        const newValue = value === 'all' || value === '' ? undefined : value;

        if (newValue === undefined) {
          if (currentParams.has(key)) {
            currentParams.delete(key);
            changed = true;
          }
        } else if (currentValue !== newValue) {
          currentParams.set(key, newValue);
          changed = true;
        }
      });

      if (changed) {
        router.push(`${pathname}?${currentParams.toString()}`, {
          scroll: false,
        });
      }
    },
    [pathname, router],
  );

  const handleStatusChange = useCallback(
    (statuses: GamesStatusFilter) => {
      const serialized = serializeStatusFilterToUrl(statuses);
      updateParams({ status: serialized });
    },
    [updateParams],
  );

  const handleParticipationChange = useCallback(
    (participation: GamesParticipationFilter) => {
      updateParams({ participation });
    },
    [updateParams],
  );

  const handleAiVsAiChange = useCallback(
    (filter: GamesAiVsAiFilter) => {
      updateParams({ aiVsAi: serializeAiVsAiFilterToUrl(filter) });
    },
    [updateParams],
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback(
    (category: GamesCategoryFilter) => {
      setCategoryFilter(category);
      updateParams({ category: category || undefined });
    },
    [updateParams],
  );

  const handleClearAll = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('');
    const currentParams = new URLSearchParams(
      searchParamsRef.current?.toString() || '',
    );
    currentParams.delete('search');
    currentParams.delete('category');
    currentParams.delete('status');
    currentParams.delete('aiVsAi');
    currentParams.delete('participation');
    currentParams.delete('page');

    router.push(`${pathname}?${currentParams.toString()}`, {
      scroll: false,
    });
  }, [pathname, router]);

  // Sync deferred search query to URL - only if it actually changed from current URL
  useEffect(() => {
    const currentUrlSearch = searchParamsRef.current?.get('search') || '';
    if (deferredSearchQuery !== currentUrlSearch) {
      updateParams({ search: deferredSearchQuery });
    }
  }, [deferredSearchQuery, updateParams]);

  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);

  useEffect(() => {
    const handleRoomUpdate = () => {
      // Use custom refresh store signal instead of query client invalidation
      triggerRefresh('games');
    };

    gameSocket.on('games.room.created', handleRoomUpdate);
    gameSocket.on('games.room.updated', handleRoomUpdate);
    gameSocket.on('games.room.deleted', handleRoomUpdate);

    return () => {
      gameSocket.off('games.room.created', handleRoomUpdate);
      gameSocket.off('games.room.updated', handleRoomUpdate);
      gameSocket.off('games.room.deleted', handleRoomUpdate);
    };
  }, [triggerRefresh]);

  const memoizedInitialData = useMemo(() => {
    return initialData ? { pages: [initialData] } : null;
  }, [initialData]);

  const serializedStatus = useMemo(
    () => serializeStatusFilterToUrl(selectedStatuses),
    [selectedStatuses],
  );

  const {
    data,
    isLoading,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GetRoomsResponse, number>({
    queryKey: [
      'games',
      'list',
      serializedStatus ?? 'all',
      participationFilter,
      aiVsAiFilter,
      deferredSearchQuery,
      categoryFilter || 'all',
      gameId ?? null,
      snapshot.accessToken,
      snapshot.userId,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      return gamesApi.getRooms(
        {
          status: serializedStatus,
          participation: participationFilter,
          aiVsAi: aiVsAiFilter === 'ai_vs_ai',
          search: deferredSearchQuery || undefined,
          page: pageParam as number,
          limit: PAGE_SIZE,
          gameId,
          categories: categoryFilter || undefined,
        },
        { token: snapshot.accessToken || undefined },
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / PAGE_SIZE);
      const nextPage = allPages.length;
      return nextPage < totalPages ? nextPage : undefined;
    },
    initialPageParam: 0,
    initialData: memoizedInitialData,
    refreshKey: 'games',
    enabled: hydrated,
    refetchOnMount: true,
  });

  const { isLongPending: isLoadingLongPending } =
    useServerWakeUpProgress(isLoading);

  const rooms = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.rooms) || [];
    const seen = new Set<string>();
    return all.filter((room) => {
      if (seen.has(room.id)) return false;
      seen.add(room.id);
      return true;
    });
  }, [data]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [rooms]);

  const soloGames = useMemo(() => {
    return Object.values(gameMetadata).filter(
      (meta) =>
        meta.minPlayers === 1 &&
        meta.status !== 'coming_soon' &&
        meta.status !== 'deprecated',
    );
  }, []);

  const error = queryError ? 'Failed to load rooms' : null;

  const renderContent = () => {
    if (isLoading) {
      return <GamesLoading isLoadingLongPending={isLoadingLongPending} />;
    }

    if (error && !rooms.length) {
      return <GamesError error={error} />;
    }

    if (sortedRooms.length === 0) {
      if (categoryFilter === 'Puzzle' && soloGames.length > 0) {
        return (
          <>
            <p className="text-sm text-[var(--textSecondary)] col-span-full">
              These single-player games run in your browser — no room needed.
            </p>
            {soloGames.map((game) => (
              <GameCard key={game.slug} game={game} showDetails />
            ))}
          </>
        );
      }
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
    <PageLayout>
      <Container className={'animate-[fadeInUp_0.5s_ease-out] gap-6'} size="xl">
        <GamesFilters
          searchQuery={searchQuery}
          onSearch={handleSearch}
          statusFilter={selectedStatuses}
          onStatusChange={handleStatusChange}
          participationFilter={participationFilter}
          onParticipationChange={handleParticipationChange}
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          aiVsAiFilter={aiVsAiFilter}
          onAiVsAiChange={handleAiVsAiChange}
          canFilterParticipation={!!snapshot.accessToken || !!snapshot.userId}
          onClearAll={handleClearAll}
        />

        <GlassCard className={'p-6'}>
          <GamesHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            title={pageTitle}
            createRoomGameId={gameId}
          />

          <div
            className={`mt-6 ${styles.roomsContainer}${
              viewMode === 'list' ? ` ${styles.listView}` : ''
            }`}
          >
            {renderContent()}
          </div>
        </GlassCard>
      </Container>
    </PageLayout>
  );
}
