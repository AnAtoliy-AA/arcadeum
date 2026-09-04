'use client';

import { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { SoloPersonalBests } from './SoloPersonalBests';
import { SoloGlobalLeaderboard } from './SoloGlobalLeaderboard';

interface SoloLeaderboardPanelProps {
  gameId: string;
  difficulty: string;
  sortBy?: 'score' | 'durationMs';
  order?: 'asc' | 'desc';
  defaultExpanded?: boolean;
  className?: string;
}

type Tab = 'best' | 'global';

export function SoloLeaderboardPanel({
  gameId,
  difficulty,
  sortBy = 'score',
  order = 'desc',
  defaultExpanded = true,
  className,
}: SoloLeaderboardPanelProps) {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const [tab, setTab] = useState<Tab>('best');
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cx(
        'w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] shadow-xl backdrop-blur-xl transition-all duration-300',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="solo-leaderboard-toggle"
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[var(--backgroundHover)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-sm text-amber-500 shadow-sm shadow-amber-500/20">
            🏆
          </span>
          <span className="text-sm font-bold tracking-tight text-[var(--color)]">
            {t('games.soloLeaderboard.title')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cx(
              'flex h-6 w-6 items-center justify-center rounded-full bg-[var(--backgroundHover)] text-xs text-[var(--textSecondary)] transition-transform duration-300',
              isExpanded && 'rotate-180',
            )}
          >
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div
          data-testid="solo-leaderboard-content"
          className="border-t border-[var(--glassBorder)] px-4 pb-4 pt-3.5"
        >
          <div className="mb-4 flex gap-1.5 rounded-xl bg-[var(--background)] p-1.5 shadow-inner">
            <TabButton
              active={tab === 'best'}
              onClick={() => setTab('best')}
              label={t('games.soloLeaderboard.personalBest')}
              testId="tab-personal-bests"
            />
            <TabButton
              active={tab === 'global'}
              onClick={() => setTab('global')}
              label={t('games.soloLeaderboard.global')}
              testId="tab-global-leaderboard"
            />
          </div>

          {tab === 'best' ? (
            <SoloPersonalBests gameId={gameId} difficulty={difficulty} />
          ) : (
            <SoloGlobalLeaderboard
              gameId={gameId}
              difficulty={difficulty}
              sortBy={sortBy}
              order={order}
              currentUserId={snapshot.accessToken?.slice(0, 16)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cx(
        'flex-1 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
        active
          ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30'
          : 'text-[var(--textSecondary)] hover:text-[var(--color)] hover:bg-[var(--backgroundHover)]',
      )}
    >
      {label}
    </button>
  );
}
