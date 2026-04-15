'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { styled, XStack, YStack, Text } from 'tamagui';
import {
  PageLayout,
  Container as SharedContainer,
  Select,
  ErrorState,
  EmptyState,
} from '@/shared/ui';
import { Button } from '@arcadeum/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
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

export function StatsPage({
  initialStats,
  initialLeaderboard,
}: StatsPageProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL state management for filters
  const selectedGame = searchParams?.get('game') || '';
  const [activeTab, setActiveTab] = useState<TabType>('my-stats');

  const { snapshot } = useSessionTokens();

  const { stats, loading, refreshing, error, refresh } = useStats({
    accessToken: snapshot.accessToken,
    initialData: initialStats,
  });

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
            onClick={() => setActiveTab('my-stats')}
            aria-pressed={activeTab === 'my-stats'}
            data-testid="stats-tab-my-stats"
          >
            {t('stats.myStatsTab')}
          </TabButton>
          <TabButton
            $active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
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
          snapshot.accessToken ? (
            <>
              <StatsOverview stats={stats} loading={loading} />
              <GameBreakdown stats={stats} loading={loading} />
            </>
          ) : (
            <YStack ai="center" gap="$5" p="$10">
              <EmptyState icon="🔒" message={t('stats.loginRequired')} />
              <Button
                variant="primary"
                size="lg"
                onPress={() => router.push('/auth')}
              >
                Log In
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
