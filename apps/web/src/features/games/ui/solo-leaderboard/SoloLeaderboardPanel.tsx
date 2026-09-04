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
  className?: string;
}

type Tab = 'best' | 'global';

export function SoloLeaderboardPanel({
  gameId,
  difficulty,
  sortBy = 'score',
  order = 'desc',
  className,
}: SoloLeaderboardPanelProps) {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const [tab, setTab] = useState<Tab>('best');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cx(
        'w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] backdrop-blur-md',
        className,
      )}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[var(--backgroundHover)]"
      >
        <span className="text-sm font-semibold text-[var(--color)]">
          {t('games.soloLeaderboard.title')}
        </span>
        <span
          className={cx(
            'text-xs text-[var(--textSecondary)] transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        >
          ▼
        </span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-[var(--glassBorder)] px-4 pb-4 pt-3">
          {/* Tabs */}
          <div className="mb-3 flex gap-1 rounded-xl bg-[var(--background)] p-1">
            <TabButton
              active={tab === 'best'}
              onClick={() => setTab('best')}
              label={t('games.soloLeaderboard.personalBest')}
            />
            <TabButton
              active={tab === 'global'}
              onClick={() => setTab('global')}
              label={t('games.soloLeaderboard.global')}
            />
          </div>

          {/* Tab content */}
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
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'bg-[var(--primary)] text-white shadow-md'
          : 'text-[var(--textSecondary)] hover:text-[var(--color)]',
      )}
    >
      {label}
    </button>
  );
}
