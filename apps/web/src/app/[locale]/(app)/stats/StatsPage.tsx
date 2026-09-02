'use client';

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  startTransition,
} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Button,
  PageLayout,
  Select,
  ErrorState,
  EmptyState,
} from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { historyApi } from '@/features/history/api';
import { useStats } from './hooks/useStats';
import { useLeaderboard } from './hooks/useLeaderboard';
import {
  StatsHeader,
  StatsOverview,
  GameBreakdown,
  Leaderboard,
} from './components';
import { getAllSupportedGameIds } from '@/features/games/lib/gameIdMapping';
import type { PlayerStats, LeaderboardResponse } from '@/features/history/api';

type TabType = 'my-stats' | 'leaderboard';

export interface StatsPageProps {
  initialStats: PlayerStats | null;
  initialLeaderboard: LeaderboardResponse | null;
}

export default function StatsPage({
  initialStats,
  initialLeaderboard,
}: StatsPageProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state management for filters
  const selectedGame = searchParams?.get('game') || '';
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  const { snapshot, hydrated } = useSessionTokens();

  const isLoggedIn = useMemo(() => {
    // During hydration/SSR, we trust initialStats presence (server source of truth)
    if (!hydrated) return !!initialStats;
    // After hydration, we trust the store (client source of truth)
    return !!snapshot.accessToken;
  }, [hydrated, snapshot.accessToken, initialStats]);

  const { stats, loading, refreshing, error, refresh } = useStats({
    accessToken: snapshot.accessToken,
    initialData: initialStats,
  });

  const records = useLocalStatsStore((s) => s.records);

  // Single-pass computation over records — avoids 4 separate array scans
  const { localBreakdown, localStats, localStreaks, localFavoriteGame } =
    useMemo(() => {
      const byGame = new Map<
        string,
        { totalGames: number; wins: number; losses: number; draws: number }
      >();
      let wins = 0;
      let losses = 0;
      let draws = 0;

      for (const record of records) {
        // Breakdown
        const existing = byGame.get(record.gameId) ?? {
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        };
        existing.totalGames++;
        if (record.result === 'won') {
          existing.wins++;
          wins++;
        } else if (record.result === 'lost') {
          existing.losses++;
          losses++;
        } else {
          existing.draws++;
          draws++;
        }
        byGame.set(record.gameId, existing);
      }

      const totalGames = records.length;
      const breakdown = Array.from(byGame.entries())
        .map(([gameId, stats]) => ({
          gameId,
          ...stats,
          winRate:
            stats.totalGames > 0
              ? Math.round((stats.wins / stats.totalGames) * 100)
              : 0,
        }))
        .sort((a, b) => b.totalGames - a.totalGames);

      const statsResult = {
        totalGames,
        wins,
        losses,
        draws,
        winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
        byGameType: breakdown,
      };

      // Streaks and favorite game from store
      const streaks = useLocalStatsStore.getState().getStreaks();
      const favoriteGame = useLocalStatsStore.getState().getFavoriteGame();

      return {
        localBreakdown: breakdown,
        localStats: statsResult,
        localStreaks: streaks,
        localFavoriteGame: favoriteGame,
      };
    }, [records]);

  const hasLocalStats = localStats.totalGames > 0;

  const serverStreaks =
    isLoggedIn && stats
      ? {
          currentStreak: stats.currentStreak ?? 0,
          currentStreakType: stats.currentStreakType ?? null,
          bestWinStreak: stats.bestWinStreak ?? 0,
        }
      : localStreaks;
  const serverFavoriteGame =
    isLoggedIn && stats
      ? (stats.favoriteGame ?? localFavoriteGame)
      : localFavoriteGame;

  useEffect(() => {
    if (!isLoggedIn || !snapshot.accessToken || records.length === 0) return;

    const unsyncedRecords = records
      .filter((r) => r.sessionId)
      .map((r) => ({
        gameId: r.gameId,
        result: r.result,
        timestamp: r.timestamp,
        sessionId: r.sessionId!,
      }));

    if (unsyncedRecords.length > 0) {
      historyApi
        .syncStats(unsyncedRecords, { token: snapshot.accessToken })
        .catch(() => {});
    }
  }, [isLoggedIn, snapshot.accessToken, records]);

  const {
    leaderboard,
    loading: leaderboardLoading,
    loadingMore,
    hasMore,
    loadMore,
    refresh: refreshLeaderboard,
  } = useLeaderboard(selectedGame || undefined, initialLeaderboard);

  const gameOptions = useMemo(() => {
    const supportedGames = getAllSupportedGameIds();
    return [
      { value: '', label: t('stats.allGames') },
      ...supportedGames.map((gameId) => ({
        value: gameId,
        label: t(`games.${gameId}.name` as TranslationKey),
      })),
    ];
  }, [t]);

  const updateParams = useCallback(
    (gameId: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (!gameId) {
        params.delete('game');
      } else {
        params.set('game', gameId);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleRefresh = () => {
    if (activeTab === 'my-stats') {
      refresh();
    } else {
      refreshLeaderboard();
    }
  };

  return (
    <PageLayout>
      <Container>
        <StatsHeader
          loading={activeTab === 'my-stats' ? loading : leaderboardLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        <TabGroup role="group" aria-label={t('stats.myStatsTab')}>
          <TabButton
            isActive={activeTab === 'my-stats'}
            onClick={() => startTransition(() => setActiveTab('my-stats'))}
            aria-pressed={activeTab === 'my-stats'}
            data-testid="stats-tab-my-stats"
          >
            {t('stats.myStatsTab')}
          </TabButton>
          <TabButton
            isActive={activeTab === 'leaderboard'}
            onClick={() => startTransition(() => setActiveTab('leaderboard'))}
            aria-pressed={activeTab === 'leaderboard'}
            data-testid="stats-tab-leaderboard"
          >
            {t('stats.leaderboardTab')}
          </TabButton>
        </TabGroup>

        {error && (
          <ErrorState
            title={t('stats.errorLoading')}
            message={error}
            onRetry={handleRefresh}
          />
        )}

        {activeTab === 'my-stats' ? (
          isLoggedIn ? (
            <>
              <StatsOverview
                stats={stats}
                loading={loading}
                currentStreak={serverStreaks.currentStreak}
                currentStreakType={serverStreaks.currentStreakType}
                bestWinStreak={serverStreaks.bestWinStreak}
                favoriteGame={serverFavoriteGame}
              />
              <GameBreakdown stats={stats} loading={loading} />
            </>
          ) : hasLocalStats ? (
            <>
              <LocalStatsBanner>
                <span className="text-[14px] text-[var(--textSecondary)]">
                  {t('stats.localStatsNotice')}
                </span>
              </LocalStatsBanner>
              <StatsOverview
                stats={{
                  totalGames: localStats.totalGames,
                  wins: localStats.wins,
                  losses: localStats.losses,
                  winRate: localStats.winRate,
                  byGameType: localBreakdown,
                  currentStreak: localStreaks.currentStreak,
                  currentStreakType: localStreaks.currentStreakType,
                  bestWinStreak: localStreaks.bestWinStreak,
                  favoriteGame: localFavoriteGame,
                }}
                loading={false}
              />
              <GameBreakdown
                stats={{
                  totalGames: localStats.totalGames,
                  wins: localStats.wins,
                  losses: localStats.losses,
                  winRate: localStats.winRate,
                  byGameType: localBreakdown,
                  currentStreak: localStreaks.currentStreak,
                  currentStreakType: localStreaks.currentStreakType,
                  bestWinStreak: localStreaks.bestWinStreak,
                  favoriteGame: localFavoriteGame,
                }}
                loading={false}
              />
              <div className="flex flex-col items-center gap-3 my-4 sm:my-6">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push('/auth')}
                >
                  {t('stats.syncToAccount')}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:gap-5 p-6 sm:p-10">
              <EmptyState icon="📊" message={t('stats.noLocalStats')} />
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/auth')}
              >
                {t('stats.logInToTrack')}
              </Button>
            </div>
          )
        ) : (
          <>
            <FilterContainer>
              <FilterLabel>{t('stats.filterByGame')}</FilterLabel>
              <Select
                value={selectedGame}
                onValueChange={updateParams}
                options={gameOptions}
              />
            </FilterContainer>
            <Leaderboard
              leaderboard={leaderboard}
              loading={leaderboardLoading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
              currentUserId={snapshot.userId || undefined}
            />
          </>
        )}
      </Container>
    </PageLayout>
  );
}

function Container({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:gap-4 lg:gap-5 max-w-[1200px]">
      {children}
    </div>
  );
}

function TabGroup({
  role,
  'aria-label': ariaLabel,
  children,
}: {
  role?: React.AriaRole;
  'aria-label'?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className="flex flex-row items-stretch gap-2 sm:gap-3"
    >
      {children}
    </div>
  );
}

interface TabButtonProps {
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  'aria-pressed'?: boolean;
  'data-testid'?: string;
}

const TabButton = ({
  isActive,
  onClick,
  children,
  'aria-pressed': ariaPressed,
  'data-testid': dataTestId,
}: TabButtonProps) => (
  <Button
    className={
      'min-w-[100px] sm:min-w-[120px] justify-center text-[13px] sm:text-[14px]'
    }
    variant={isActive ? 'primary' : 'chip'}
    size="sm"
    active={isActive}
    onClick={onClick}
    aria-pressed={ariaPressed}
    data-testid={dataTestId}
  >
    {children}
  </Button>
);

function FilterContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 px-4 sm:px-5 rounded-xl sm:rounded-2xl border border-[var(--borderColor)] bg-[var(--background)]">
      {children}
    </div>
  );
}

function FilterLabel({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[14px] sm:text-[16px] leading-[18px] sm:leading-[20px] font-semibold tracking-[0.5px] select-none text-[var(--color)] whitespace-nowrap">
      {children}
    </span>
  );
}

function LocalStatsBanner({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center p-3 sm:p-4 px-4 sm:px-5 rounded-lg sm:rounded-xl border border-[rgba(255,200,50,0.2)] bg-[rgba(255,200,50,0.08)]">
      {children}
    </div>
  );
}
