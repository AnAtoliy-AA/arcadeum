'use client';

import { GamesSearch } from '@/features/games';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { gamesApi } from '@/features/games/api';

import {
  Page,
  Container,
  Header,
  HeaderControls,
  ViewToggle,
  ViewToggleButton,
  Title,
  CreateButton,
  Filters,
  FilterGroup,
  FilterLabel,
  FilterChips,
  FilterChip,
  RoomsContainer,
  Loading,
  Spinner,
  Error,
  Empty,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
} from './styles';
import { RoomCardComponent } from './RoomCardComponent';

const PAGE_SIZE = 12;
const INITIAL_PAGE = 1;

export function GamesPage() {
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'lobby' | 'in_progress' | 'completed'
  >('all');
  const [participationFilter, setParticipationFilter] = useState<
    'all' | 'hosting' | 'joined' | 'not_joined'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  return (
    <Page>
      <Container>
        <Header>
          <Title>{t('games.lounge.activeTitle')}</Title>
          <HeaderControls>
            <ViewToggle>
              <ViewToggleButton
                $active={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ▦
              </ViewToggleButton>
              <ViewToggleButton
                $active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                ☰
              </ViewToggleButton>
            </ViewToggle>
            <CreateButton href="/games/create">
              {t('games.common.createRoom')}
            </CreateButton>
          </HeaderControls>
        </Header>

        <Filters>
          <GamesSearch
            onSearch={handleSearch}
            initialValue={searchQuery}
            placeholder={
              t('games.lounge.searchPlaceholder') || 'Search games...'
            }
            buttonLabel={t('games.lounge.searchButton') || 'Search'}
          />
          <FilterGroup>
            <FilterLabel>{t('games.lounge.filters.statusLabel')}</FilterLabel>
            <FilterChips>
              {(['all', 'lobby', 'in_progress', 'completed'] as const).map(
                (value) => {
                  const statusKeys = {
                    all: 'games.lounge.filters.status.all',
                    lobby: 'games.lounge.filters.status.lobby',
                    in_progress: 'games.lounge.filters.status.in_progress',
                    completed: 'games.lounge.filters.status.completed',
                  } as const;
                  const label = t(statusKeys[value]);
                  return (
                    <FilterChip
                      key={value}
                      $active={statusFilter === value}
                      onClick={() => handleStatusChange(value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStatusChange(value);
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
                },
              )}
            </FilterChips>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>
              {t('games.lounge.filters.participationLabel')}
            </FilterLabel>
            <FilterChips>
              {(['all', 'hosting', 'joined', 'not_joined'] as const).map(
                (value) => {
                  const participationKeys = {
                    all: 'games.lounge.filters.participation.all',
                    hosting: 'games.lounge.filters.participation.hosting',
                    joined: 'games.lounge.filters.participation.joined',
                    not_joined: 'games.lounge.filters.participation.not_joined',
                  } as const;
                  const label = t(participationKeys[value]);
                  return (
                    <FilterChip
                      key={value}
                      $active={participationFilter === value}
                      onClick={() => {
                        if (value !== 'all' && !snapshot.accessToken) {
                          // Optionally show a login prompt or ignore
                          return;
                        }
                        handleParticipationChange(value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (value !== 'all' && !snapshot.accessToken) {
                            return;
                          }
                          e.preventDefault();
                          handleParticipationChange(value);
                        }
                      }}
                      $disabled={value !== 'all' && !snapshot.accessToken}
                      aria-label={`Filter by participation: ${label || value}`}
                      aria-pressed={participationFilter === value}
                      role="button"
                      tabIndex={
                        value !== 'all' && !snapshot.accessToken ? -1 : 0
                      }
                    >
                      {label || value}
                    </FilterChip>
                  );
                },
              )}
            </FilterChips>
          </FilterGroup>
        </Filters>

        <RoomsContainer $viewMode={viewMode}>
          {loading ? (
            <Loading>
              <Spinner aria-label="Loading" />
              <div>{t('games.lounge.loadingRooms')}</div>
            </Loading>
          ) : error ? (
            <Error>{error}</Error>
          ) : sortedRooms.length === 0 ? (
            <Empty>{t('games.lounge.emptyTitle')}</Empty>
          ) : (
            <>
              {sortedRooms.map((room: GameRoomSummary) => (
                <RoomCardComponent
                  key={room.id}
                  room={room}
                  viewMode={viewMode}
                />
              ))}

              {totalPages > 1 && (
                <PaginationContainer>
                  <PaginationButton
                    onClick={() =>
                      setPage((p) => Math.max(INITIAL_PAGE, p - 1))
                    }
                    disabled={page === INITIAL_PAGE}
                  >
                    ←
                  </PaginationButton>
                  <PaginationInfo>
                    {t('games.lounge.paginationInfo', {
                      page,
                      totalPages,
                    })}
                  </PaginationInfo>
                  <PaginationButton
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    →
                  </PaginationButton>
                </PaginationContainer>
              )}
            </>
          )}
        </RoomsContainer>
      </Container>
    </Page>
  );
}
