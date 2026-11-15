'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ClanWar, Clan } from '../model/types';
import { ClanWarCard } from './ClanWarCard';
import { DeclareWarModal } from './DeclareWarModal';
import { Button } from '@arcadeum/ui';

interface ClanWarsHubProps {
  wars: ClanWar[];
  myClan: Clan | null;
  popularClans: Clan[];
  onRecordVictory?: (warId: string, winningClanId: string) => void;
  labels?: Record<string, string | undefined>;
}

export function ClanWarsHub({
  wars,
  myClan,
  popularClans,
  onRecordVictory,
  labels = {},
}: ClanWarsHubProps) {
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const activeCount = useMemo(
    () => wars.filter((w) => w.status === 'active').length,
    [wars],
  );

  const completedCount = useMemo(
    () => wars.filter((w) => w.status === 'completed').length,
    [wars],
  );

  const totalClashes = useMemo(
    () => wars.reduce((acc, w) => acc + (w.matchLogs?.length ?? 0), 0),
    [wars],
  );

  const filteredWars = useMemo(() => {
    if (filter === 'active') return wars.filter((w) => w.status === 'active');
    if (filter === 'completed')
      return wars.filter((w) => w.status === 'completed');
    return wars;
  }, [wars, filter]);

  const handleOpenDeclare = useCallback(() => {
    setShowDeclareModal(true);
  }, []);

  const handleCloseDeclare = useCallback(() => {
    setShowDeclareModal(false);
  }, []);

  return (
    <div className="flex flex-col gap-6" data-testid="clan-wars-hub">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {labels.warsHubTitle ?? 'Clan Wars & Inter-Clan Tournaments'}
          </h2>
          <p className="text-sm text-[var(--foreground)]/60 max-w-xl">
            {labels.warsHubSubtitle ??
              'Compete in strategic head-to-head clan showdowns to climb the platform rankings and claim seasonal dominance.'}
          </p>
        </div>

        {myClan && (
          <Button
            variant="primary"
            onClick={handleOpenDeclare}
            data-testid="declare-war-button"
          >
            ⚔️ {labels.declareWarBtn ?? 'Declare War'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 text-center">
          <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">
            {labels.activeWarsCount ?? 'Active Wars'}
          </span>
          <span
            className="text-2xl font-bold text-[var(--primary)]"
            data-testid="active-wars-counter"
          >
            {activeCount}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 text-center">
          <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">
            {labels.completedWarsCount ?? 'Resolved Wars'}
          </span>
          <span className="text-2xl font-bold text-[var(--success)]">
            {completedCount}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50 p-4 text-center">
          <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wider">
            {labels.totalClashesCount ?? 'Total Battles'}
          </span>
          <span className="text-2xl font-bold text-[var(--foreground)]">
            {totalClashes}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          data-testid="filter-wars-all"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-[var(--primary)] text-[var(--buttonText)]'
              : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {labels.filterAllWars ?? 'All Wars'} ({wars.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          data-testid="filter-wars-active"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'active'
              ? 'bg-[var(--primary)] text-[var(--buttonText)]'
              : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {labels.filterActiveWars ?? 'Active'} ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          data-testid="filter-wars-completed"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'completed'
              ? 'bg-[var(--primary)] text-[var(--buttonText)]'
              : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
          }`}
        >
          {labels.filterCompletedWars ?? 'Resolved'} ({completedCount})
        </button>
      </div>

      {filteredWars.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30 p-8 text-center text-sm text-[var(--foreground)]/60">
          <p>{labels.noWarsFound ?? 'No clan wars matching this filter.'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredWars.map((war) => (
            <ClanWarCard
              key={war.id}
              war={war}
              myClanId={myClan?.id}
              onRecordVictory={onRecordVictory}
              labels={labels}
            />
          ))}
        </div>
      )}

      {myClan && (
        <DeclareWarModal
          open={showDeclareModal}
          onClose={handleCloseDeclare}
          popularClans={popularClans}
          myClanId={myClan.id}
          labels={labels}
        />
      )}
    </div>
  );
}
