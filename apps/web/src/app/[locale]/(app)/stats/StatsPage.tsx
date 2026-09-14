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
} from '@/shared/i18n/useTranslation';
import { useLocalStatsStore } from '@/features/stats/store/statsStore';
import { historyApi } from '@/features/history/api';
import { useStats } from './hooks/useStats';
import { useLeaderboard } from './hooks/useLeaderboard';
import {
  StatsHeader,
  StatsHeroBanner,
  StatsOverview,
  GameBreakdown,
  Leaderboard,
  LevelProgression,
  BadgesShowcase,
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

  const selectedGame = searchParams?.get('game') || '';
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  const { snapshot, hydrated } = useSessionTokens();

  const isLoggedIn = useMemo(() => {
    if (!hydrated) return !!initialStats;
    return !!snapshot.accessToken;
  }, [hydrated, snapshot.accessToken, initialStats]);

  const { stats, loading, refreshing, error, refresh } = useStats({
    accessToken: snapshot.accessToken,
    initialData: initialStats,
  });

  const records = useLocalStatsStore((s) => s.records);

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
        .map(([gameId, gameStats]) => ({
          gameId,
          ...gameStats,
          winRate:
            gameStats.totalGames > 0
              ? Math.round((gameStats.wins / gameStats.totalGames) * 100)
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
      <div className="flex flex-col items-stretch gap-4 sm:gap-6 max-w-[1240px] w-full mx-auto">
        <StatsHeader
          loading={activeTab === 'my-stats' ? loading : leaderboardLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        <div
          role="group"
          aria-label={t('stats.myStatsTab')}
          className="flex items-center gap-2 p-1 rounded-xl bg-[var(--surfaceSecondary)]/60 border border-[var(--borderColor)]/60 w-fit"
        >
          <Button
            variant={activeTab === 'my-stats' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => startTransition(() => setActiveTab('my-stats'))}
            aria-pressed={activeTab === 'my-stats'}
            data-testid="stats-tab-my-stats"
            className="min-w-[120px] justify-center text-[13px] font-bold"
          >
            📊 {t('stats.myStatsTab')}
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => startTransition(() => setActiveTab('leaderboard'))}
            aria-pressed={activeTab === 'leaderboard'}
            data-testid="stats-tab-leaderboard"
            className="min-w-[120px] justify-center text-[13px] font-bold"
          >
            🏆 {t('stats.leaderboardTab')}
          </Button>
        </div>

        {error && (
          <ErrorState
            title={t('stats.errorLoading')}
            message={error}
            onRetry={handleRefresh}
          />
        )}

        {activeTab === 'my-stats' ? (
          isLoggedIn ? (
            <div className="flex flex-col gap-4 sm:gap-6">
              <StatsHeroBanner
                snapshot={snapshot}
                stats={stats}
                currentStreak={serverStreaks.currentStreak}
                currentStreakType={serverStreaks.currentStreakType}
              />
              <StatsOverview
                stats={stats}
                loading={loading}
                currentStreak={serverStreaks.currentStreak}
                currentStreakType={serverStreaks.currentStreakType}
                bestWinStreak={serverStreaks.bestWinStreak}
                favoriteGame={serverFavoriteGame}
                level={snapshot.level}
                xp={snapshot.xp}
              />
              <BadgesShowcase currentLevel={snapshot.level} />
              <LevelProgression currentLevel={snapshot.level} />
              <GameBreakdown stats={stats} loading={loading} />
            </div>
          ) : hasLocalStats ? (
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 px-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">⚠️</span>
                  <span className="text-[13px] sm:text-[14px] font-medium text-[var(--color)]">
                    {t('stats.localStatsNotice')}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/auth')}
                  className="flex-shrink-0"
                >
                  {t('stats.syncToAccount')}
                </Button>
              </div>

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
                level={snapshot.level}
                xp={snapshot.xp}
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-5 p-8 sm:p-14 rounded-2xl border border-[var(--borderColor)]/50 bg-[var(--surfaceSecondary)]/30 text-center">
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
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 px-4 rounded-xl border border-[var(--borderColor)]/70 bg-[var(--surfaceSecondary)]/40">
              <span className="text-[13px] sm:text-[14px] font-bold text-[var(--color)] whitespace-nowrap">
                {t('stats.filterByGame')}
              </span>
              <div className="w-full sm:w-64">
                <Select
                  value={selectedGame}
                  onValueChange={updateParams}
                  options={gameOptions}
                />
              </div>
            </div>
            <Leaderboard
              leaderboard={leaderboard}
              loading={leaderboardLoading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
              currentUserId={snapshot.userId || undefined}
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
