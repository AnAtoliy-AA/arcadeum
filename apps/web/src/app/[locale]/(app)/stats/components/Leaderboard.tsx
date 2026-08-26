import React, { useRef, useCallback, useEffect } from 'react';
import type { LeaderboardEntry } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  Badge,
  Section,
  EmptyState,
  SkeletonCircle,
  SkeletonText,
  ProgressBar,
  Spinner,
} from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';

export const leaderboardCSS = `
  .stats-leaderboard-header {
    display: grid;
    grid-template-columns: 60px 2fr 80px 80px 80px 100px;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #32353d;
    font-weight: 600;
    font-size: 0.85rem;
    color: rgba(236,239,238,0.45);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #151718;
  }
  @media (max-width: 768px) {
    .stats-leaderboard-header { display: none; }
  }

  .stats-leaderboard-row {
    display: grid;
    grid-template-columns: 60px 2fr 80px 80px 80px 100px;
    padding: 1rem 1.5rem;
    background: #151718;
    border-bottom: 1px solid #32353d;
    align-items: center;
    transition: all 0.2s ease;
  }
  .stats-leaderboard-row:last-child {
    border-bottom: none;
  }
  .stats-leaderboard-row:hover {
    background: rgba(21,23,24,0.87);
  }
  .stats-leaderboard-row--current-user {
    background: rgba(122,215,255,0.063);
    border-left: 3px solid #7ad7ff;
  }
  .stats-leaderboard-row--current-user:hover {
    background: rgba(122,215,255,0.082);
  }
  @media (max-width: 768px) {
    .stats-leaderboard-row {
      grid-template-columns: 50px 1fr 60px;
      gap: 0.5rem;
    }
    .stats-leaderboard-row > *:nth-child(4),
    .stats-leaderboard-row > *:nth-child(5),
    .stats-leaderboard-row > *:nth-child(6) {
      display: none;
    }
  }
`;

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
      <>
        <style>{leaderboardCSS}</style>
        <Section title={t('stats.leaderboardTab')}>
          <Table>
            <div className="stats-leaderboard-header">
              <div>{t('stats.rank')}</div>
              <div>{t('stats.player')}</div>
              <div>{t('stats.games')}</div>
              <div>{t('stats.wins')}</div>
              <div>{t('stats.losses')}</div>
              <div>{t('stats.winRate')}</div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="stats-leaderboard-row">
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
                <SkeletonText
                  width="30px"
                  height="16px"
                  delay={i * 0.1 + 0.15}
                />
                <SkeletonText
                  width="30px"
                  height="16px"
                  delay={i * 0.1 + 0.2}
                />
                <SkeletonText
                  width="30px"
                  height="16px"
                  delay={i * 0.1 + 0.25}
                />
                <SkeletonText
                  width="50px"
                  height="16px"
                  delay={i * 0.1 + 0.3}
                />
              </div>
            ))}
          </Table>
        </Section>
      </>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <>
        <style>{leaderboardCSS}</style>
        <Section title={t('stats.leaderboardTab')}>
          <EmptyState icon="🏆" message={t('stats.noPlayersFound')} />
        </Section>
      </>
    );
  }

  return (
    <>
      <style>{leaderboardCSS}</style>
      <Section title={t('stats.leaderboardTab')}>
        <Table>
          <div className="stats-leaderboard-header">
            <div>{t('stats.rank')}</div>
            <div>{t('stats.player')}</div>
            <div>{t('stats.games')}</div>
            <div>{t('stats.wins')}</div>
            <div>{t('stats.losses')}</div>
            <div>{t('stats.winRate')}</div>
          </div>
          {leaderboard.map((entry) => (
            <div
              key={entry.playerId}
              className={
                'stats-leaderboard-row' +
                (entry.playerId === currentUserId
                  ? ' stats-leaderboard-row--current-user'
                  : '')
              }
            >
              <RankDisplay rank={entry.rank} />
              <PlayerInfo>
                <EquippedPlayerAvatar
                  name={entry.username}
                  size="md"
                  equippedAvatarId={entry.equippedAvatarId ?? null}
                  equippedBadgeId={entry.equippedBadgeId ?? null}
                  equippedNameColorId={entry.equippedNameColorId}
                  equippedFrameId={entry.equippedFrameId}
                  equippedAuraId={entry.equippedAuraId}
                  equippedBannerId={entry.equippedBannerId}
                />
                <PlayerName>
                  <span className="">{entry.username}</span>
                  {entry.playerId === currentUserId && (
                    <Badge variant="info" size="sm">
                      {t('stats.you')}
                    </Badge>
                  )}
                </PlayerName>
              </PlayerInfo>
              <StatCell>{entry.totalGames}</StatCell>
              <StatCell color="var(--success)">{entry.wins}</StatCell>
              <StatCell color="var(--danger)">{entry.losses}</StatCell>
              <ProgressBar
                className={'h-[6px]'}
                value={entry.winRate}
                showLabel
              />
            </div>
          ))}
        </Table>

        <div
          ref={loadMoreRef}
          style={{
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loadingMore && (
            <LoadingMoreRow>
              <Spinner size="sm" />
              <span className="text-[rgba(236,239,238,0.7)] text-[16px]">
                {t('stats.loadingMore')}
              </span>
            </LoadingMoreRow>
          )}
          {!hasMore && leaderboard.length > 0 && (
            <EndOfList>{t('stats.endOfLeaderboard')}</EndOfList>
          )}
        </div>
      </Section>
    </>
  );
}

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <TrophyIcon
        style={{ filter: 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5))' }}
      >
        🥇
      </TrophyIcon>
    );
  }
  if (rank === 2) {
    return (
      <TrophyIcon
        style={{ filter: 'drop-shadow(0 2px 4px rgba(156, 163, 175, 0.5))' }}
      >
        🥈
      </TrophyIcon>
    );
  }
  if (rank === 3) {
    return (
      <TrophyIcon
        style={{ filter: 'drop-shadow(0 2px 4px rgba(217, 119, 6, 0.5))' }}
      >
        🥉
      </TrophyIcon>
    );
  }
  return <RankBadge>{rank}</RankBadge>;
}

function Table({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-stretch w-full rounded-xl overflow-hidden">
      {children}
    </div>
  );
}

function PlayerInfo({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-row items-center gap-3">{children}</div>;
}

function PlayerName({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-row items-center gap-2">{children}</div>;
}

function StatCell({
  color,
  children,
}: {
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className="font-medium text-[var(--color)]"
      style={color ? { color } : undefined}
    >
      {children}
    </span>
  );
}

function RankBadge({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center w-[36px] h-[36px] rounded-full border border-[var(--borderColor)] bg-[var(--background)]">
      {children}
    </div>
  );
}

function TrophyIcon({
  style,
  children,
}: {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <span className="text-[24px] leading-[30px]" style={style}>
      {children}
    </span>
  );
}

function LoadingMoreRow({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-row items-center gap-3 p-4">{children}</div>;
}

function EndOfList({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[14px] leading-[18px] p-4 opacity-[0.7] text-[rgba(236,239,238,0.45)]">
      {children}
    </span>
  );
}
