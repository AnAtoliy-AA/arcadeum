'use client';

import { useMemo } from 'react';
import type { ClanWar } from '../model/types';
import { Button } from '@arcadeum/ui';

interface ClanWarCardProps {
  war: ClanWar;
  myClanId?: string;
  onRecordVictory?: (warId: string, winningClanId: string) => void;
  labels?: Record<string, string | undefined>;
}

export function ClanWarCard({
  war,
  myClanId,
  onRecordVictory,
  labels = {},
}: ClanWarCardProps) {
  const isParticipant =
    myClanId === war.initiatorClanId || myClanId === war.targetClanId;

  const initProgress = useMemo(
    () => Math.min(100, (war.initiatorScore / war.targetScore) * 100),
    [war.initiatorScore, war.targetScore],
  );

  const targetProgress = useMemo(
    () => Math.min(100, (war.targetClanScore / war.targetScore) * 100),
    [war.targetClanScore, war.targetScore],
  );

  const statusColor = useMemo(() => {
    switch (war.status) {
      case 'active':
        return 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30';
      case 'completed':
        return 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
    }
  }, [war.status]);

  const winningClanName = useMemo(() => {
    if (!war.winnerClanId) return null;
    return war.winnerClanId === war.initiatorClanId
      ? war.initiatorClanName
      : war.targetClanName;
  }, [
    war.winnerClanId,
    war.initiatorClanId,
    war.initiatorClanName,
    war.targetClanName,
  ]);

  return (
    <div
      data-testid={`clan-war-card-${war.id}`}
      className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--primary)]/30"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColor}`}
          >
            {labels[`status_${war.status}`] ?? war.status}
          </span>
          <span className="rounded bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            {war.gameId === 'all'
              ? (labels.allGames ?? 'All Games')
              : war.gameId}
          </span>
        </div>
        <div className="text-xs font-medium text-[var(--foreground)]/60">
          {labels.targetGoal ?? 'Target'}: {war.targetScore}{' '}
          {labels.wins ?? 'wins'}
        </div>
      </div>

      <div className="grid grid-cols-2 items-center gap-4 text-center">
        <div className="flex flex-col items-center gap-1 rounded-lg bg-[var(--surface)]/50 p-3">
          <span className="text-xs font-bold text-[var(--primary)]">
            [{war.initiatorClanTag}]
          </span>
          <h3 className="truncate text-base font-bold text-[var(--foreground)] max-w-full">
            {war.initiatorClanName}
          </h3>
          <div className="text-2xl font-black text-[var(--foreground)]">
            {war.initiatorScore}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)] mt-1">
            <div
              className={`h-full bg-[var(--primary)] transition-all duration-300 ${
                initProgress >= 100
                  ? 'w-full'
                  : initProgress >= 80
                    ? 'w-4/5'
                    : initProgress >= 60
                      ? 'w-3/5'
                      : initProgress >= 40
                        ? 'w-2/5'
                        : initProgress >= 20
                          ? 'w-1/5'
                          : initProgress > 0
                            ? 'w-1/12'
                            : 'w-0'
              }`}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-lg bg-[var(--surface)]/50 p-3">
          <span className="text-xs font-bold text-rose-400">
            [{war.targetClanTag}]
          </span>
          <h3 className="truncate text-base font-bold text-[var(--foreground)] max-w-full">
            {war.targetClanName}
          </h3>
          <div className="text-2xl font-black text-[var(--foreground)]">
            {war.targetClanScore}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)] mt-1">
            <div
              className={`h-full bg-rose-500 transition-all duration-300 ${
                targetProgress >= 100
                  ? 'w-full'
                  : targetProgress >= 80
                    ? 'w-4/5'
                    : targetProgress >= 60
                      ? 'w-3/5'
                      : targetProgress >= 40
                        ? 'w-2/5'
                        : targetProgress >= 20
                          ? 'w-1/5'
                          : targetProgress > 0
                            ? 'w-1/12'
                            : 'w-0'
              }`}
            />
          </div>
        </div>
      </div>

      {war.status === 'completed' && winningClanName && (
        <div className="rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 p-2 text-center text-xs font-semibold text-[var(--primary)]">
          🏆 {labels.warVictory ?? 'Victorious'}: {winningClanName}
        </div>
      )}

      {war.status === 'active' && onRecordVictory && isParticipant && (
        <div className="flex justify-end pt-2 border-t border-[var(--border)]">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRecordVictory(war.id, myClanId!)}
            data-testid={`report-victory-${war.id}`}
          >
            {labels.reportVictory ?? 'Report Match Win'}
          </Button>
        </div>
      )}

      {war.matchLogs && war.matchLogs.length > 0 && (
        <div className="mt-1 flex flex-col gap-1.5 text-xs text-[var(--foreground)]/60">
          <span className="font-semibold text-[var(--foreground)]/80">
            {labels.recentClashes ?? 'Recent Clashes'}:
          </span>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
            {war.matchLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded bg-[var(--surface)]/30 px-2 py-1"
              >
                <span className="truncate">
                  <strong className="text-[var(--primary)]">
                    {log.playerName}
                  </strong>{' '}
                  vs {log.opponentName}
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--success)]">
                  {labels.victory ?? 'Win'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
