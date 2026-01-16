import React from 'react';
import styled from 'styled-components';
import type { PlayerStats } from '@/features/history/api';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  BreakdownTable,
  TableHeader,
  TableRow,
  GameInfo,
  GameIcon,
  GameName,
} from '../styles';
import { SkeletonCircle, SkeletonText } from '@/shared/ui/Skeleton';
import { ProgressBar } from '@/shared/ui/Progress';

interface GameBreakdownProps {
  stats: PlayerStats | null;
  loading: boolean;
}

export function GameBreakdown({ stats, loading }: GameBreakdownProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <BreakdownTable style={{ marginTop: '2.5rem' }}>
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
      </BreakdownTable>
    );
  }

  if (!stats?.byGameType?.length) return null;

  const formatGameName = (gameId: string) => {
    if (gameId.includes('exploding')) return 'Exploding Cats';
    if (gameId.includes('holdem')) return "Texas Hold'em";
    return gameId;
  };

  return (
    <BreakdownTable style={{ marginTop: '2.5rem' }}>
      <TableHeader>
        <div>{t('stats.game')}</div>
        <div>{t('stats.total')}</div>
        <div>{t('stats.wins')}</div>
        <div>{t('stats.winRate')}</div>
      </TableHeader>
      {stats.byGameType.map((game) => (
        <TableRow key={game.gameId}>
          <GameInfo>
            <GameIcon>{game.gameId.includes('holdem') ? '♠️' : '🎯'}</GameIcon>
            <GameName>{formatGameName(game.gameId)}</GameName>
          </GameInfo>
          <div>{game.totalGames}</div>
          <div>{game.wins}</div>
          <WinRateCell>
            <ProgressBar value={game.winRate} height={8} showInlineLabel />
          </WinRateCell>
        </TableRow>
      ))}
    </BreakdownTable>
  );
}

const WinRateCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 120px;
`;
