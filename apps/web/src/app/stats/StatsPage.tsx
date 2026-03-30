'use client';

import React, { useState, useMemo, ComponentProps, ReactNode } from 'react';
import { styled, XStack, Text } from 'tamagui';
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

type TabType = 'my-stats' | 'leaderboard';

export function StatsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('my-stats');
  const [selectedGame, setSelectedGame] = useState('');
  const { snapshot } = useSessionTokens();
  const { stats, loading, refreshing, error, refresh } = useStats({
    accessToken: snapshot.accessToken,
  });
  const {
    leaderboard,
    loading: leaderboardLoading,
    loadingMore,
    hasMore,
    loadMore,
    refresh: refreshLeaderboard,
  } = useLeaderboard(selectedGame || undefined);

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
            <EmptyState icon="🔒" message={t('stats.loginRequired')} />
          )
        ) : (
          <>
            <FilterContainer>
              <FilterLabel>{t('stats.filterByGame')}</FilterLabel>
              <Select
                value={selectedGame}
                onValueChange={setSelectedGame}
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

interface TabButtonProps extends ComponentProps<typeof Button> {
  $active?: boolean;
  children?: ReactNode;
}

const TabButton = ({ $active, ...props }: TabButtonProps) => (
  <Button
    variant={$active ? 'primary' : 'chip'}
    size="md"
    isActive={$active}
    minWidth={120}
    justifyContent="center"
    {...props}
  />
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
  color: '$color11',
  letterSpacing: 0.5,
  userSelect: 'none',
} as unknown as Record<string, unknown>);
