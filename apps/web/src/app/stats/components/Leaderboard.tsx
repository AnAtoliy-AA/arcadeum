import React, { useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import type { LeaderboardEntry } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Avatar, Badge, Section, EmptyState } from '@/shared/ui';
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
      <Section title={t('stats.leaderboardTab')}>
        <Table>
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
              <PlayerInfo>
                <SkeletonCircle
                  width="40px"
                  height="40px"
                  delay={i * 0.1 + 0.05}
                />
                <SkeletonText
                  width="120px"
                  height="16px"
                  delay={i * 0.1 + 0.1}
                />
              </PlayerInfo>
              <SkeletonText width="30px" height="16px" delay={i * 0.1 + 0.15} />
              <SkeletonText width="30px" height="16px" delay={i * 0.1 + 0.2} />
              <SkeletonText width="30px" height="16px" delay={i * 0.1 + 0.25} />
              <SkeletonText width="50px" height="16px" delay={i * 0.1 + 0.3} />
            </LeaderboardRow>
          ))}
        </Table>
      </Section>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Section title={t('stats.leaderboardTab')}>
        <EmptyState icon="🏆" message={t('stats.noPlayersFound')} />
      </Section>
    );
  }

  return (
    <Section title={t('stats.leaderboardTab')}>
      <Table>
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
            <PlayerInfo>
              <Avatar name={entry.username} size="lg" alt="" />
              <PlayerName>
                {entry.username}
                {entry.playerId === currentUserId && (
                  <Badge variant="info" size="sm">
                    {t('stats.you')}
                  </Badge>
                )}
              </PlayerName>
            </PlayerInfo>
            <StatCell>{entry.totalGames}</StatCell>
            <StatCell $color={PROGRESS_COLORS.success}>{entry.wins}</StatCell>
            <StatCell $color={PROGRESS_COLORS.danger}>{entry.losses}</StatCell>
            <ProgressBar value={entry.winRate} height={6} showInlineLabel />
          </LeaderboardRow>
        ))}
      </Table>

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
    </Section>
  );
}

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
  return <RankBadge>{rank}</RankBadge>;
}

const Table = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const LeaderboardHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 2fr 80px 80px 80px 100px;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  font-weight: 600;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LeaderboardRow = styled.div<{ $isCurrentUser?: boolean }>`
  display: grid;
  grid-template-columns: 60px 2fr 80px 80px 80px 100px;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  align-items: center;
  transition: all 0.2s ease;

  ${({ $isCurrentUser, theme }) =>
    $isCurrentUser &&
    `
    background: ${theme.buttons.primary.gradientStart}10;
    border-left: 3px solid ${theme.buttons.primary.gradientStart};
  `}

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme, $isCurrentUser }) =>
      $isCurrentUser
        ? `${theme.buttons.primary.gradientStart}15`
        : `${theme.surfaces.card.background}dd`};
  }

  @media (max-width: 768px) {
    grid-template-columns: 50px 1fr 60px;
    gap: 0.5rem;

    > *:nth-child(4),
    > *:nth-child(5),
    > *:nth-child(6) {
      display: none;
    }
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PlayerName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatCell = styled.div<{ $color?: string }>`
  font-weight: 500;
  color: ${({ $color, theme }) => $color || theme.text.primary};
`;

const RankBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
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
  color: ${({ theme }) => theme.text.muted};
  font-size: 0.875rem;
  padding: 1rem;
  opacity: 0.7;
`;
