import React, { useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import type { LeaderboardEntry } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  BreakdownTable,
  TableHeader,
  TableRow,
  GameInfo,
  GameName,
} from '../styles';
import { SkeletonCircle, SkeletonText } from '@/shared/ui/Skeleton';
import { ProgressBar, PROGRESS_COLORS } from '@/shared/ui/Progress';
import { Spinner } from '@/shared/ui/Spinner';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  currentUserId?: string;
}

export function Leaderboard({
  leaderboard,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  currentUserId,
}: LeaderboardProps) {
  const { t } = useTranslation();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  if (loading && leaderboard.length === 0) {
    return (
      <BreakdownTable style={{ marginTop: '2.5rem' }}>
        <LeaderboardHeader>
          <div>{t('stats.rank')}</div>
          <div>{t('stats.player')}</div>
          <div>{t('stats.games')}</div>
          <div>{t('stats.wins')}</div>
          <div>{t('stats.losses')}</div>
          <div>{t('stats.winRate')}</div>
        </LeaderboardHeader>
        {[1, 2, 3, 4, 5].map((i) => (
          <LeaderboardRow key={i}>
            <SkeletonCircle width="32px" height="32px" delay={i * 0.1} />
            <GameInfo>
              <SkeletonCircle
                width="40px"
                height="40px"
                delay={i * 0.1 + 0.05}
              />
              <SkeletonText width="120px" height="16px" delay={i * 0.1 + 0.1} />
            </GameInfo>
            <SkeletonText width="30px" height="16px" delay={i * 0.1 + 0.15} />
            <SkeletonText width="30px" height="16px" delay={i * 0.1 + 0.2} />
            <SkeletonText width="30px" height="16px" delay={i * 0.1 + 0.25} />
            <SkeletonText width="50px" height="16px" delay={i * 0.1 + 0.3} />
          </LeaderboardRow>
        ))}
      </BreakdownTable>
    );
  }

  if (leaderboard.length === 0) {
    return <EmptyState>{t('stats.noPlayersFound')}</EmptyState>;
  }

  return (
    <>
      <BreakdownTable style={{ marginTop: '2.5rem' }}>
        <LeaderboardHeader>
          <div>{t('stats.rank')}</div>
          <div>{t('stats.player')}</div>
          <div>{t('stats.games')}</div>
          <div>{t('stats.wins')}</div>
          <div>{t('stats.losses')}</div>
          <div>{t('stats.winRate')}</div>
        </LeaderboardHeader>
        {leaderboard.map((entry) => (
          <LeaderboardRow
            key={entry.playerId}
            $isCurrentUser={entry.playerId === currentUserId}
          >
            <RankDisplay rank={entry.rank} />
            <GameInfo>
              <PlayerAvatar>
                {entry.username.charAt(0).toUpperCase()}
              </PlayerAvatar>
              <GameName>
                {entry.username}
                {entry.playerId === currentUserId && (
                  <YouBadge>{t('stats.you')}</YouBadge>
                )}
              </GameName>
            </GameInfo>
            <StatCell>{entry.totalGames}</StatCell>
            <StatCell $color={PROGRESS_COLORS.success}>{entry.wins}</StatCell>
            <StatCell $color={PROGRESS_COLORS.danger}>{entry.losses}</StatCell>
            <ProgressBar value={entry.winRate} height={6} showInlineLabel />
          </LeaderboardRow>
        ))}
      </BreakdownTable>

      {/* Infinite scroll trigger */}
      <LoadMoreContainer ref={loadMoreRef}>
        {loadingMore && (
          <LoadingMoreRow>
            <Spinner size="sm" />
            <span>{t('stats.loadingMore')}</span>
          </LoadingMoreRow>
        )}
        {!hasMore && leaderboard.length > 0 && (
          <EndOfList>{t('stats.endOfLeaderboard')}</EndOfList>
        )}
      </LoadMoreContainer>
    </>
  );
}

const LoadMoreContainer = styled.div`
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingMoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  padding: 1rem;
`;

const EndOfList = styled.div`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
  padding: 1rem;
  opacity: 0.7;
`;

const LeaderboardHeader = styled(TableHeader)`
  grid-template-columns: 60px 2fr 80px 80px 80px 100px;
`;

const LeaderboardRow = styled(TableRow)<{ $isCurrentUser?: boolean }>`
  grid-template-columns: 60px 2fr 80px 80px 80px 100px;
  ${({ $isCurrentUser }) =>
    $isCurrentUser &&
    `
    background: rgba(59, 130, 246, 0.1);
    border-left: 3px solid #3b82f6;
  `}
`;

const StatCell = styled.div<{ $color?: string; $highlight?: boolean }>`
  font-weight: ${({ $highlight }) => ($highlight ? 700 : 500)};
  color: ${({ $color, theme }) => $color || theme.text.primary};
  ${({ $highlight, theme }) =>
    $highlight &&
    `
    color: ${theme.buttons.primary.gradientStart};
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const RankBadge = styled.div<{ $rank: number }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  background: ${({ $rank, theme }) =>
    $rank === 1
      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      : $rank === 2
        ? 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)'
        : $rank === 3
          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          : theme.surfaces.card.background};
  color: ${({ $rank, theme }) => ($rank <= 3 ? '#000' : theme.text.primary)};
  box-shadow: ${({ $rank }) =>
    $rank <= 3 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'};
`;

const TrophyIcon = styled.span<{ $rank: number }>`
  font-size: 1.5rem;
  filter: ${({ $rank }) =>
    $rank === 1
      ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5))'
      : $rank === 2
        ? 'drop-shadow(0 2px 4px rgba(156, 163, 175, 0.5))'
        : 'drop-shadow(0 2px 4px rgba(217, 119, 6, 0.5))'};
`;

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) {
    return <TrophyIcon $rank={1}>🥇</TrophyIcon>;
  }
  if (rank === 2) {
    return <TrophyIcon $rank={2}>🥈</TrophyIcon>;
  }
  if (rank === 3) {
    return <TrophyIcon $rank={3}>🥉</TrophyIcon>;
  }
  return <RankBadge $rank={rank}>{rank}</RankBadge>;
}

const PlayerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.buttons.primary.gradientStart}30;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  margin-right: 0.75rem;
`;

const YouBadge = styled.span`
  margin-left: 0.5rem;
  font-size: 0.75rem;
  background: ${({ theme }) => theme.buttons.primary.gradientStart}20;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  padding: 2px 8px;
  border-radius: 12px;
`;
