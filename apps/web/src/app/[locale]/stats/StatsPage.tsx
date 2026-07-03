'use client';

import React, { useState, useMemo, useCallback, startTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { styled, XStack, YStack, Text } from 'tamagui';
import {
  Button,
  PageLayout,
  Container as SharedContainer,
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
  const localBreakdown = useMemo(() => {
    const byGame = new Map<
      string,
      { totalGames: number; wins: number; losses: number; draws: number }
    >();
    for (const record of records) {
      const existing = byGame.get(record.gameId) ?? {
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      };
      existing.totalGames++;
      if (record.result === 'won') existing.wins++;
      else if (record.result === 'lost') existing.losses++;
      else existing.draws++;
      byGame.set(record.gameId, existing);
    }
    return Array.from(byGame.entries())
      .map(([gameId, stats]) => ({
        gameId,
        ...stats,
        winRate:
          stats.totalGames > 0
            ? Math.round((stats.wins / stats.totalGames) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalGames - a.totalGames);
  }, [records]);
  const localStats = useMemo(() => {
    const wins = records.filter((r) => r.result === 'won').length;
    const losses = records.filter((r) => r.result === 'lost').length;
    const draws = records.filter((r) => r.result === 'draw').length;
    const totalGames = records.length;
    return {
      totalGames,
      wins,
      losses,
      draws,
      winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
      byGameType: localBreakdown,
    };
  }, [records, localBreakdown]);
  const hasLocalStats = localStats.totalGames > 0;

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
            $active={activeTab === 'my-stats'}
            onClick={() => startTransition(() => setActiveTab('my-stats'))}
            aria-pressed={activeTab === 'my-stats'}
            data-testid="stats-tab-my-stats"
          >
            {t('stats.myStatsTab')}
          </TabButton>
          <TabButton
            $active={activeTab === 'leaderboard'}
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
              <StatsOverview stats={stats} loading={loading} />
              <GameBreakdown stats={stats} loading={loading} />
            </>
          ) : hasLocalStats ? (
            <>
              <LocalStatsBanner>
                <Text fontSize="$2" color="rgba(236,239,238,0.6)">
                  {t('stats.localStatsNotice')}
                </Text>
              </LocalStatsBanner>
              <StatsOverview
                stats={{
                  totalGames: localStats.totalGames,
                  wins: localStats.wins,
                  losses: localStats.losses,
                  winRate: localStats.winRate,
                  byGameType: localBreakdown,
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
                }}
                loading={false}
              />
              <YStack ai="center" gap="$3" mt="$4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push('/auth')}
                >
                  {t('stats.syncToAccount')}
                </Button>
              </YStack>
            </>
          ) : (
            <YStack ai="center" gap="$5" p="$10">
              <EmptyState icon="📊" message={t('stats.noLocalStats')} />
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/auth')}
              >
                {t('stats.logInToTrack')}
              </Button>
            </YStack>
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

const Container = styled(SharedContainer, {
  name: 'StatsPageContainer',
  maxWidth: 1200,
  flexDirection: 'column',
  gap: '$5',
} as unknown as Record<string, unknown>);

const TabGroup = styled(XStack, {
  name: 'StatsTabGroup',
  gap: '$3',
  flexWrap: 'wrap',
} as unknown as Record<string, unknown>);

interface TabButtonProps {
  $active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  'aria-pressed'?: boolean;
  'data-testid'?: string;
}

const TabButton = ({ $active, children, ...props }: TabButtonProps) => (
  <Button
    variant={$active ? 'primary' : 'chip'}
    size="md"
    isActive={$active}
    minWidth={120}
    justifyContent="center"
    {...props}
  >
    {children}
  </Button>
);

const FilterContainer = styled(XStack, {
  name: 'StatsFilterContainer',
  alignItems: 'center',
  gap: '$4',
  padding: '$4',
  paddingHorizontal: '$5',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: 16,
} as unknown as Record<string, unknown>);

const FilterLabel = styled(Text, {
  name: 'StatsFilterLabel',
  tag: 'label',
  fontSize: '$3',
  fontWeight: '600',
  color: '$color',
  letterSpacing: 0.5,
  userSelect: 'none',
} as unknown as Record<string, unknown>);

const LocalStatsBanner = styled(XStack, {
  name: 'LocalStatsBanner',
  padding: '$4',
  paddingHorizontal: '$5',
  backgroundColor: 'rgba(255,200,50,0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255,200,50,0.2)',
  borderRadius: 12,
  alignItems: 'center',
} as unknown as Record<string, unknown>);
