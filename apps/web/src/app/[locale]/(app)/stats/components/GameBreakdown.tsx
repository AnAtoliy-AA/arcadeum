import type React from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
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

function Table({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-col items-stretch w-full rounded-xl overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

function GameInfo({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-row items-center gap-3', className)}
      {...props}
    />
  );
}

function GameIcon({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx('text-[20px] w-[40px] h-[40px]', className)}
      {...props}
    />
  );
}

function GameName({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[16px] leading-[20px] font-semibold text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

function StatCell({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'text-[16px] leading-[20px] font-medium text-[var(--color)]',
        className,
      )}
      {...props}
    />
  );
}

function WinRateCell({
  className,
  ...props
}: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-3 min-w-[120px]',
        className,
      )}
      {...props}
    />
  );
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
                <ProgressBar
                  className={'h-[8px]'}
                  value={game.winRate}
                  showLabel
                />
              </WinRateCell>
            </div>
          ))}
        </Table>
      </Section>
    </>
  );
}
