'use client';

import { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { MoveEntry } from '../hooks/usePostGameAnalytics';
import type {
  HeadToHeadResponse,
  TrendsResponse,
} from '@/features/history/api';

type Tab = 'moves' | 'headToHead' | 'trends';

interface PostGameAnalyticsProps {
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
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all',
        active
          ? 'bg-white/15 text-white shadow-[0_0_8px_rgba(255,255,255,0.1)]'
          : 'text-white/40 hover:bg-white/5 hover:text-white/60',
      )}
    >
      {children}
    </button>
  );
}

function MovesTab({
  moveTimeline,
  currentUserId,
  t,
}: {
  moveTimeline: MoveEntry[];
  currentUserId: string | null;
  t: PostGameAnalyticsProps['t'];
}) {
  if (moveTimeline.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-2xl">🎯</span>
        <p className="text-center text-[13px] text-white/50">
          {t('games.table.analytics.moves.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-h-[240px] flex-col gap-1 overflow-y-auto pr-1">
      {moveTimeline.map((entry, idx) => {
        const isCurrent = entry.playerId === currentUserId;
        return (
          <div
            key={`${entry.turn}-${entry.playerId}-${idx}`}
            className={cx(
              'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors',
              isCurrent ? 'bg-white/8 text-white/90' : 'text-white/50',
            )}
          >
            <span className="w-6 shrink-0 text-center font-mono text-[10px] text-white/30">
              {entry.turn}
            </span>
            <span className="truncate">{entry.description}</span>
          </div>
        );
      })}
    </div>
  );
}

function HeadToHeadTab({
  data,
  loading,
  opponentId,
  t,
}: {
  data: HeadToHeadResponse | null;
  loading: boolean;
  opponentId?: string | null;
  t: PostGameAnalyticsProps['t'];
}) {
  if (!opponentId) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-2xl">⚔️</span>
        <p className="text-center text-[13px] text-white/50">
          {t('games.table.analytics.headToHead.noOpponent')}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-2xl">⚔️</span>
        <p className="text-center text-[13px] text-white/50">
          {t('games.table.analytics.headToHead.empty')}
        </p>
      </div>
    );
  }

  const p1WinRate =
    data.totalGames > 0
      ? Math.round((data.player1.wins / data.totalGames) * 100)
      : 0;
  const p2WinRate =
    data.totalGames > 0
      ? Math.round((data.player2.wins / data.totalGames) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.headToHead.wins')}
          </span>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-emerald-400">
              {data.player1.wins}
            </span>
            <span className="text-xs text-white/30">:</span>
            <span className="text-lg font-bold text-rose-400">
              {data.player2.wins}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.headToHead.draws')}
          </span>
          <p className="mt-1 text-lg font-bold text-slate-300">
            {data.player1.draws}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.headToHead.totalGames')}
          </span>
          <p className="mt-1 text-lg font-bold text-white">{data.totalGames}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] text-white/50">
          <span>{p1WinRate}%</span>
          <span>{p2WinRate}%</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${p1WinRate}%` }}
          />
          <div
            className="h-full bg-rose-400 transition-all duration-500"
            style={{ width: `${p2WinRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TrendsTab({
  data,
  loading,
  t,
}: {
  data: TrendsResponse | null;
  loading: boolean;
  t: PostGameAnalyticsProps['t'];
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!data || data.records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-2xl">📈</span>
        <p className="text-center text-[13px] text-white/50">
          {t('games.table.analytics.trends.empty')}
        </p>
      </div>
    );
  }

  const last10 = data.records.slice(-10);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.trends.winRate')}
          </span>
          <p className="mt-1 text-lg font-bold text-emerald-400">
            {data.winRate}%
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.trends.currentStreak')}
          </span>
          <p
            className={cx(
              'mt-1 text-lg font-bold',
              data.currentStreakType === 'won'
                ? 'text-emerald-400'
                : data.currentStreakType === 'lost'
                  ? 'text-rose-400'
                  : 'text-white/60',
            )}
          >
            {data.currentStreak > 0
              ? `${data.currentStreak}${data.currentStreakType === 'won' ? 'W' : 'L'}`
              : '-'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {t('games.table.analytics.trends.title')}
        </span>
        <div className="flex items-center gap-1">
          {last10.map((r, i) => {
            const isWin = r.result === 'won';
            const isLoss = r.result === 'lost';
            return (
              <div
                key={`${r.sessionId}-${i}`}
                title={new Date(r.timestamp).toLocaleDateString()}
                className={cx(
                  'flex h-6 flex-1 items-center justify-center rounded text-[10px] font-bold',
                  isWin && 'bg-emerald-500/20 text-emerald-400',
                  isLoss && 'bg-rose-500/20 text-rose-400',
                  !isWin && !isLoss && 'bg-white/10 text-white/50',
                )}
              >
                {isWin ? 'W' : isLoss ? 'L' : 'D'}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] text-white/30">
          <span>{t('games.table.analytics.trends.oldest')}</span>
          <span>{t('games.table.analytics.trends.newest')}</span>
        </div>
      </div>
    </div>
  );
}

export function PostGameAnalytics({
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
    if (moveTimeline.length > 0) return 'moves';
    if (opponentId) return 'headToHead';
    return 'trends';
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'headToHead') onLoadHeadToHead();
    if (tab === 'trends') onLoadTrends();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {moveTimeline.length > 0 && (
          <TabButton
            active={activeTab === 'moves'}
            onClick={() => handleTabChange('moves')}
          >
            {t('games.table.analytics.tabs.moves')}
          </TabButton>
        )}
        {opponentId && (
          <TabButton
            active={activeTab === 'headToHead'}
            onClick={() => handleTabChange('headToHead')}
          >
            {t('games.table.analytics.tabs.headToHead')}
          </TabButton>
        )}
        <TabButton
          active={activeTab === 'trends'}
          onClick={() => handleTabChange('trends')}
        >
          {t('games.table.analytics.tabs.trends')}
        </TabButton>
      </div>

      <div className="min-h-[80px]">
        {activeTab === 'moves' && (
          <MovesTab
            moveTimeline={moveTimeline}
            currentUserId={currentUserId}
            t={t}
          />
        )}
        {activeTab === 'headToHead' && (
          <HeadToHeadTab
            data={headToHead}
            loading={headToHeadLoading}
            opponentId={opponentId}
            t={t}
          />
        )}
        {activeTab === 'trends' && (
          <TrendsTab data={trends} loading={trendsLoading} t={t} />
        )}
      </div>
    </div>
  );
}
