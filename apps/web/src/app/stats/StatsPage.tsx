'use client';

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Button } from '@/shared/ui';
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
import { Page, Container } from './styles';
import { getAllSupportedGameIds } from '@/features/games/lib/gameIdMapping';

type TabType = 'my-stats' | 'leaderboard';

// Display names for game IDs
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

  // Build game options dynamically from supported games
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
    <Page>
      <Container>
        <StatsHeader
          loading={activeTab === 'my-stats' ? loading : leaderboardLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        <TabContainer>
          <Tab
            $active={activeTab === 'my-stats'}
            onClick={() => setActiveTab('my-stats')}
          >
            {t('stats.myStatsTab')}
          </Tab>
          <Tab
            $active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
          >
            {t('stats.leaderboardTab')}
          </Tab>
        </TabContainer>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
            {t('stats.errorLoading')}: {error}
          </div>
        )}

        {activeTab === 'my-stats' ? (
          snapshot.accessToken ? (
            <>
              <StatsOverview stats={stats} loading={loading} />
              <GameBreakdown stats={stats} loading={loading} />
            </>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <h2>{t('stats.loginRequired')}</h2>
            </div>
          )
        ) : (
          <>
            <FilterContainer>
              <FilterLabel>{t('stats.filterByGame')}</FilterLabel>
              <GameSelect
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              >
                {gameOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </GameSelect>
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
    </Page>
  );
}

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  padding-bottom: 0.5rem;
`;

const Tab = styled(Button).attrs<{ $active: boolean }>(({ $active }) => ({
  variant: 'chip',
  size: 'md',
  $active,
}))<{ $active: boolean }>``;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const GameSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.95rem;
  cursor: pointer;
  min-width: 180px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;
