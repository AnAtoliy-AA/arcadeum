'use client';

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  Button,
  PageLayout,
  Container as SharedContainer,
  Select,
  ErrorState,
  EmptyState,
} from '@/shared/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
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

const GAME_DISPLAY_NAMES: Record<string, string> = {
  critical_v1: 'Critical',
};

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
        label: GAME_DISPLAY_NAMES[gameId] || gameId,
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
          >
            {t('stats.myStatsTab')}
          </TabButton>
          <TabButton
            $active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
            aria-pressed={activeTab === 'leaderboard'}
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
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                {gameOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
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

const Container = styled(SharedContainer)`
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TabGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const TabButton = styled(Button).attrs<{ $active: boolean }>(({ $active }) => ({
  variant: $active ? 'primary' : 'chip',
  size: 'md',
  active: $active,
}))<{ $active: boolean }>`
  min-width: 120px;
  justify-content: center;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  border-radius: 16px;
  backdrop-filter: blur(14px);
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;
