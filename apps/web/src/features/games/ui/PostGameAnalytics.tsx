'use client';

import { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import {
  GameResultStatsGrid,
  type GameResultStats,
} from './GameResultStatsGrid';
import type { MoveEntry } from '../hooks/usePostGameAnalytics';
import type {
  HeadToHeadResponse,
  TrendsResponse,
} from '@/features/history/api';

type Tab = 'stats' | 'moves' | 'headToHead' | 'trends';

interface PostGameAnalyticsProps {
  stats: GameResultStats | null | undefined;
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

function StatsTab({
  stats,
  t,
}: {
  stats: GameResultStats | null | undefined;
  t: PostGameAnalyticsProps['t'];
}) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-2xl">📊</span>
        <p className="text-center text-[13px] text-white/50">
          {t('games.table.analytics.noStats')}
        </p>
      </div>
    );
  }
  return <GameResultStatsGrid stats={stats} t={t} />;
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
      {moveTimeline.map((entry) => {
        const isCurrent = entry.playerId === currentUserId;
        return (
          <div
            key={entry.turn}
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
      <div className="flex justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
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
            <span className="text-[10px] text-white/30">vs</span>
            <span className="text-lg font-bold text-emerald-400">
              {data.player2.wins}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.headToHead.losses')}
          </span>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-red-400">
              {data.player1.losses}
            </span>
            <span className="text-[10px] text-white/30">vs</span>
            <span className="text-lg font-bold text-red-400">
              {data.player2.losses}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.headToHead.draws')}
          </span>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-slate-400">
              {data.player1.draws}
            </span>
            <span className="text-[10px] text-white/30">vs</span>
            <span className="text-lg font-bold text-slate-400">
              {data.player2.draws}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-white/60">
            {t('games.table.analytics.headToHead.winRate')}
          </span>
          <span className="font-mono text-white/40">
            {data.totalGames}{' '}
            {t('games.table.analytics.headToHead.totalGames').toLowerCase()}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="flex h-full">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${p1WinRate}%` }}
            />
            <div
              className="bg-slate-500 transition-all duration-500"
              style={{
                width: `${(data.player1.draws / Math.max(data.totalGames, 1)) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-white/40">
          <span>{p1WinRate}%</span>
          <span>{p2WinRate}%</span>
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
      <div className="flex justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t('games.table.analytics.trends.winRate')}
          </span>
          <p className="mt-0.5 text-lg font-bold text-white">{data.winRate}%</p>
        </div>
        {data.currentStreak > 0 && (
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {t('games.table.analytics.trends.currentStreak')}
            </span>
            <p
              className={cx(
                'mt-0.5 text-lg font-bold',
                data.currentStreakType === 'won'
                  ? 'text-emerald-400'
                  : 'text-red-400',
              )}
            >
              {data.currentStreak}{' '}
              {data.currentStreakType === 'won' ? 'W' : 'L'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-end gap-1" style={{ height: 60 }}>
        {[...data.records].reverse().map((record, idx) => (
          <div
            key={idx}
            className={cx(
              'flex-1 rounded-sm transition-all duration-300 hover:opacity-80',
              record.result === 'won'
                ? 'bg-emerald-500'
                : record.result === 'lost'
                  ? 'bg-red-500'
                  : 'bg-slate-500',
            )}
            style={{
              height:
                record.result === 'won'
                  ? '100%'
                  : record.result === 'lost'
                    ? '40%'
                    : '60%',
            }}
            title={
              record.result === 'won'
                ? 'Win'
                : record.result === 'lost'
                  ? 'Loss'
                  : 'Draw'
            }
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-white/30">
        <span>{t('games.table.analytics.trends.oldest')}</span>
        <span>{t('games.table.analytics.trends.newest')}</span>
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'headToHead') onLoadHeadToHead();
    if (tab === 'trends') onLoadTrends();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        <TabButton
          active={activeTab === 'stats'}
          onClick={() => handleTabChange('stats')}
        >
          {t('games.table.analytics.tabs.stats')}
        </TabButton>
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
        {activeTab === 'stats' && <StatsTab stats={stats} t={t} />}
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
