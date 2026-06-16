import React from 'react';
import { styled, XStack, YStack, Text } from 'tamagui';
import type { PlayerStats } from '@/features/history/api';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  SkeletonCircle,
  SkeletonText,
  ProgressBar,
  Section,
} from '@arcadeum/ui';

export const gameBreakdownCSS = `
  .stats-breakdown-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    padding: 1rem 1.5rem;
    background: #151718;
    border-bottom: 1px solid #32353d;
    font-weight: 600;
    font-size: 0.85rem;
    color: rgba(236,239,238,0.45);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .stats-breakdown-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    padding: 1rem 1.5rem;
    background: #151718;
    border-bottom: 1px solid #32353d;
    align-items: center;
    transition: all 0.2s ease;
  }
  .stats-breakdown-row:last-child {
    border-bottom: none;
  }
  .stats-breakdown-row:hover {
    background: rgba(21,23,24,0.87);
  }
`;

interface GameBreakdownProps {
  stats: PlayerStats | null;
  loading: boolean;
}

export function GameBreakdown({ stats, loading }: GameBreakdownProps) {
  const { t } = useTranslation();

  if (loading && !stats) {
    return (
      <>
        <style>{gameBreakdownCSS}</style>
        <Section title={t('stats.gameBreakdownTitle')}>
          <Table>
            <div className="stats-breakdown-header">
              <div>{t('stats.game')}</div>
              <div>{t('stats.total')}</div>
              <div>{t('stats.wins')}</div>
              <div>{t('stats.winRate')}</div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="stats-breakdown-row">
                <GameInfo>
                  <SkeletonCircle width="40px" height="40px" delay={i * 0.1} />
                  <SkeletonText width="100px" delay={i * 0.1 + 0.05} />
                </GameInfo>
                <SkeletonText width="30px" delay={i * 0.1 + 0.1} />
                <SkeletonText width="30px" delay={i * 0.1 + 0.15} />
                <SkeletonText width="50px" delay={i * 0.1 + 0.2} />
              </div>
            ))}
          </Table>
        </Section>
      </>
    );
  }

  if (!stats?.byGameType?.length) return null;

  return (
    <>
      <style>{gameBreakdownCSS}</style>
      <Section title={t('stats.gameBreakdownTitle')}>
        <Table>
          <div className="stats-breakdown-header">
            <div>{t('stats.game')}</div>
            <div>{t('stats.total')}</div>
            <div>{t('stats.wins')}</div>
            <div>{t('stats.winRate')}</div>
          </div>
          {stats.byGameType.map((game) => (
            <div key={game.gameId} className="stats-breakdown-row">
              <GameInfo>
                <GameIcon>🎯</GameIcon>
                <GameName>
                  {t(`games.${game.gameId}.name` as TranslationKey)}
                </GameName>
              </GameInfo>
              <StatCell>{game.totalGames}</StatCell>
              <StatCell>{game.wins}</StatCell>
              <WinRateCell>
                <ProgressBar value={game.winRate} height={8} showLabel />
              </WinRateCell>
            </div>
          ))}
        </Table>
      </Section>
    </>
  );
}

const Table = styled(YStack, {
  name: 'GameBreakdownTable',
  width: '100%',
  borderRadius: 12,
  overflow: 'hidden',
});

const GameInfo = styled(XStack, {
  name: 'GameBreakdownGameInfo',
  alignItems: 'center',
  gap: '$3',
});

const GameIcon = styled(Text, {
  name: 'GameBreakdownGameIcon',
  fontSize: '$5',
  width: 40,
  height: 40,
});

const GameName = styled(Text, {
  name: 'GameBreakdownGameName',
  fontWeight: '600',
  color: '$color',
});

const StatCell = styled(Text, {
  name: 'GameBreakdownStatCell',
  fontWeight: '500',
  color: '$color',
});

const WinRateCell = styled(XStack, {
  name: 'GameBreakdownWinRateCell',
  alignItems: 'center',
  gap: '$3',
  minWidth: 120,
});
