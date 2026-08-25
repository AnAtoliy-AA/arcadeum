'use client';

import { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { MoveEntry } from '../hooks/usePostGameAnalytics';
import type { GameResultStats } from './GameResultStatsGrid';
import type {
  HeadToHeadResponse,
  TrendsResponse,
} from '@/features/history/api';
import { PostGameTimeline } from './analytics/PostGameTimeline';
import { PostGameHeadToHead } from './analytics/PostGameHeadToHead';
import { PostGameTrends } from './analytics/PostGameTrends';

type Tab = 'moves' | 'headToHead' | 'trends';

export interface PostGameAnalyticsProps {
  stats?: GameResultStats | null;
  moveTimeline: MoveEntry[];
  headToHead: HeadToHeadResponse | null;
  headToHeadLoading: boolean;
  trends: TrendsResponse | null;
  trendsLoading: boolean;
  onLoadHeadToHead: () => void;
  onLoadTrends: () => void;
  currentUserId: string | null;
  opponentId?: string | null;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
        active
          ? 'border border-white/20 bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.12)]'
          : 'border border-transparent text-white/40 hover:bg-white/5 hover:text-white/70',
      )}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </button>
  );
}

export function PostGameAnalytics({
  stats,
  moveTimeline,
  headToHead,
  headToHeadLoading,
  trends,
  trendsLoading,
  onLoadHeadToHead,
  onLoadTrends,
  currentUserId,
  opponentId,
  t,
}: PostGameAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (moveTimeline.length > 0 || stats) return 'moves';
    if (opponentId) return 'headToHead';
    return 'trends';
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'headToHead') onLoadHeadToHead();
    if (tab === 'trends') onLoadTrends();
  };

  return (
    <div className="flex w-full flex-col gap-3.5">
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-2.5">
        <TabButton
          active={activeTab === 'moves'}
          onClick={() => handleTabChange('moves')}
          icon="🎯"
        >
          {t('games.table.analytics.tabs.moves')}
        </TabButton>
        {opponentId && (
          <TabButton
            active={activeTab === 'headToHead'}
            onClick={() => handleTabChange('headToHead')}
            icon="⚔️"
          >
            {t('games.table.analytics.tabs.headToHead')}
          </TabButton>
        )}
        <TabButton
          active={activeTab === 'trends'}
          onClick={() => handleTabChange('trends')}
          icon="📈"
        >
          {t('games.table.analytics.tabs.trends')}
        </TabButton>
      </div>

      <div className="min-h-[120px]">
        {activeTab === 'moves' && (
          <PostGameTimeline
            stats={stats}
            moveTimeline={moveTimeline}
            currentUserId={currentUserId}
            t={t}
          />
        )}
        {activeTab === 'headToHead' && (
          <PostGameHeadToHead
            data={headToHead}
            loading={headToHeadLoading}
            opponentId={opponentId}
            t={t}
          />
        )}
        {activeTab === 'trends' && (
          <PostGameTrends data={trends} loading={trendsLoading} t={t} />
        )}
      </div>
    </div>
  );
}
