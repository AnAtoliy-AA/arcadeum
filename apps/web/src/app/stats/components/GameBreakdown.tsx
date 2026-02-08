import React from 'react';
import styled from 'styled-components';
import type { PlayerStats } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import { SkeletonCircle, SkeletonText } from '@/shared/ui/Skeleton';
import { ProgressBar } from '@/shared/ui/Progress';
import { Section } from '@/shared/ui';

interface GameBreakdownProps {
  stats: PlayerStats | null;
  loading: boolean;
}

export function GameBreakdown({ stats, loading }: GameBreakdownProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <Section title={t('stats.gameBreakdownTitle')}>
        <Table>
          <TableHeader>
            <div>{t('stats.game')}</div>
            <div>{t('stats.total')}</div>
            <div>{t('stats.wins')}</div>
            <div>{t('stats.winRate')}</div>
          </TableHeader>
          {[1, 2].map((i) => (
            <TableRow key={i}>
              <GameInfo>
                <SkeletonCircle width="40px" height="40px" delay={i * 0.1} />
                <SkeletonText width="100px" delay={i * 0.1 + 0.05} />
              </GameInfo>
              <SkeletonText width="30px" delay={i * 0.1 + 0.1} />
              <SkeletonText width="30px" delay={i * 0.1 + 0.15} />
              <SkeletonText width="50px" delay={i * 0.1 + 0.2} />
            </TableRow>
          ))}
        </Table>
      </Section>
    );
  }

  if (!stats?.byGameType?.length) return null;

  const formatGameName = (gameId: string) => {
    if (gameId.includes('exploding')) return 'Exploding Cats';
    if (gameId.includes('holdem')) return "Texas Hold'em";
    if (gameId.includes('critical')) return 'Critical';
    return gameId;
  };

  return (
    <Section title={t('stats.gameBreakdownTitle')}>
      <Table>
        <TableHeader>
          <div>{t('stats.game')}</div>
          <div>{t('stats.total')}</div>
          <div>{t('stats.wins')}</div>
          <div>{t('stats.winRate')}</div>
        </TableHeader>
        {stats.byGameType.map((game) => (
          <TableRow key={game.gameId}>
            <GameInfo>
              <GameIcon>
                {game.gameId.includes('holdem') ? '♠️' : '🎯'}
              </GameIcon>
              <GameName>{formatGameName(game.gameId)}</GameName>
            </GameInfo>
            <StatCell>{game.totalGames}</StatCell>
            <StatCell>{game.wins}</StatCell>
            <WinRateCell>
              <ProgressBar value={game.winRate} height={8} showInlineLabel />
            </WinRateCell>
          </TableRow>
        ))}
      </Table>
    </Section>
  );
}

const Table = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  font-weight: 600;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  align-items: center;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background}dd;
  }
`;

const GameInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const GameIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ theme }) => theme.buttons.primary.gradientStart}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const GameName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const StatCell = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

const WinRateCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 120px;
`;
