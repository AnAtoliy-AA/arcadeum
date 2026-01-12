'use client';

import { GamesSearch } from '@/features/games';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';

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
  const [rooms, setRooms] = useState<GameRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [total, setTotal] = useState(0);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (participationFilter !== 'all') {
        params.append('participation', participationFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());

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
      // Handle both legacy and new response format
      if (Array.isArray(data.rooms)) {
        setRooms(data.rooms);
        setTotal(data.total || data.rooms.length);
      } else {
        // Fallback or error if needed? For now assume it works as new format
        setRooms(data.rooms || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      setError(
        err instanceof globalThis.Error ? err.message : 'Failed to load rooms',
      );
    } finally {
      setLoading(false);
    }
  }, [
    statusFilter,
    participationFilter,
    searchQuery,
    snapshot.accessToken,
    page,
    limit,
  ]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Reset page when filters change
  useEffect(() => {
    setPage(INITIAL_PAGE);
  }, [statusFilter, participationFilter, searchQuery]);

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
            onSearch={setSearchQuery}
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
                      onClick={() => setStatusFilter(value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
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
                        setParticipationFilter(value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          if (value !== 'all' && !snapshot.accessToken) {
                            return;
                          }
                          e.preventDefault();
                          setParticipationFilter(value);
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
