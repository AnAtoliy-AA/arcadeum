'use client';

import React from 'react';
import { Toggle } from '@arcadeum/ui';
import {
  useSeaBattleBlitzAdminStatus,
  useToggleSeaBattleBlitz,
} from '../hooks';

export interface AdminSeaBattleBlitzLabels {
  title: string;
  description: string;
  statusActive: string;
  statusPaused: string;
  toggleLabel: string;
}

export interface AdminSeaBattleBlitzControlProps {
  labels?: AdminSeaBattleBlitzLabels;
}

const DEFAULT_LABELS: AdminSeaBattleBlitzLabels = {
  title: 'Weekly Sea Battle Blitz Cup',
  description:
    'Automated Saturday 18:00 UTC single-elimination tournament scheduler',
  statusActive: 'Active (Scheduled weekly)',
  statusPaused: 'Paused (Scheduling disabled)',
  toggleLabel: 'Toggle automated Sea Battle Blitz Cup',
};

export function AdminSeaBattleBlitzControl({
  labels = DEFAULT_LABELS,
}: AdminSeaBattleBlitzControlProps) {
  const { data, isLoading } = useSeaBattleBlitzAdminStatus();
  const toggleMutation = useToggleSeaBattleBlitz();

  const isEnabled = data?.enabled ?? true;
  const isPending = toggleMutation.isPending || isLoading;

  const handleToggle = (checked: boolean) => {
    if (isPending) return;
    toggleMutation.mutate({ enabled: checked });
  };

  return (
    <div
      data-testid="admin-sea-battle-blitz-control"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--borderColor,#334155)] bg-[var(--surface,rgba(15,23,42,0.6))] backdrop-blur-md transition-all shadow-sm"
    >
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold tracking-wide text-[var(--foreground,#f8fafc)]">
            {labels.title}
          </span>
          <span
            data-testid="admin-blitz-status-pill"
            className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
              isEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {isEnabled ? labels.statusActive : labels.statusPaused}
          </span>
        </div>
        <p className="text-xs text-[var(--mutedForeground,#94a3b8)]">
          {labels.description}
        </p>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <Toggle
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isPending}
          ariaLabel={labels.toggleLabel}
          testId="admin-blitz-toggle"
        />
      </div>
    </div>
  );
}
