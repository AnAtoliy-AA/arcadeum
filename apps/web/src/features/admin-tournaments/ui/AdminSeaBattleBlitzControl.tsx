'use client';

import React, { useState } from 'react';
import { Toggle, Button } from '@arcadeum/ui';
import {
  useSeaBattleBlitzAdminStatus,
  useToggleSeaBattleBlitz,
  useUpdateSeaBattleBlitzConfig,
} from '../hooks';

export interface AdminSeaBattleBlitzLabels {
  title: string;
  description: string;
  statusActive: string;
  statusPaused: string;
  toggleLabel: string;
  prizePoolLabel?: string;
  prizeDescriptionLabel?: string;
  editPrizes?: string;
  savePrizes?: string;
  cancel?: string;
  prizesSaved?: string;
}

export interface AdminSeaBattleBlitzControlProps {
  labels?: AdminSeaBattleBlitzLabels;
}

const DEFAULT_LABELS: Required<AdminSeaBattleBlitzLabels> = {
  title: 'Weekly Sea Battle Blitz Cup',
  description:
    'Automated Saturday 18:00 UTC single-elimination tournament scheduler',
  statusActive: 'Active (Scheduled weekly)',
  statusPaused: 'Paused (Scheduling disabled)',
  toggleLabel: 'Toggle automated Sea Battle Blitz Cup',
  prizePoolLabel: 'Prize Pool (Coins)',
  prizeDescriptionLabel: 'Prize Description',
  editPrizes: 'Configure Prizes',
  savePrizes: 'Save Prizes',
  cancel: 'Cancel',
  prizesSaved: 'Prizes saved',
};

export function AdminSeaBattleBlitzControl({
  labels: userLabels,
}: AdminSeaBattleBlitzControlProps) {
  const labels: Required<AdminSeaBattleBlitzLabels> = {
    ...DEFAULT_LABELS,
    ...userLabels,
  };

  const { data, isLoading } = useSeaBattleBlitzAdminStatus();
  const toggleMutation = useToggleSeaBattleBlitz();
  const updateConfigMutation = useUpdateSeaBattleBlitzConfig();

  const isEnabled = data?.enabled ?? true;
  const currentPrizePool = data?.prizePoolCoins ?? 500;
  const currentPrizeDesc =
    data?.prizeDescription ?? '500 Coins + Admiral Trophy';

  const [isEditing, setIsEditing] = useState(false);
  const [coinsInput, setCoinsInput] = useState(String(currentPrizePool));
  const [descInput, setDescInput] = useState(currentPrizeDesc);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isPending =
    toggleMutation.isPending || updateConfigMutation.isPending || isLoading;

  const handleToggle = (checked: boolean) => {
    if (isPending) return;
    toggleMutation.mutate({ enabled: checked });
  };

  const handleStartEdit = () => {
    setCoinsInput(String(currentPrizePool));
    setDescInput(currentPrizeDesc);
    setSavedSuccess(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCoinsInput(String(currentPrizePool));
    setDescInput(currentPrizeDesc);
  };

  const handleSavePrizes = async () => {
    if (isPending) return;
    const parsedCoins = Math.max(0, parseInt(coinsInput, 10) || 0);
    const trimmedDesc = descInput.trim() || `${parsedCoins} Coins`;
    await updateConfigMutation.mutateAsync({
      prizePoolCoins: parsedCoins,
      prizeDescription: trimmedDesc,
    });
    setIsEditing(false);
    setSavedSuccess(true);
  };

  return (
    <div
      data-testid="admin-sea-battle-blitz-control"
      className="flex flex-col gap-4 p-4 rounded-2xl border border-[var(--borderColor,#334155)] bg-[var(--surface,rgba(15,23,42,0.6))] backdrop-blur-md transition-all shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {!isEditing ? (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--borderColor,#334155)]/50">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 font-semibold text-amber-300">
              <span>🪙</span>
              <span data-testid="admin-blitz-prize-pool">
                {currentPrizePool} Coins
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-cyan-200">
              <span>🏆</span>
              <span data-testid="admin-blitz-prize-desc">
                {currentPrizeDesc}
              </span>
            </span>
            {savedSuccess && (
              <span
                data-testid="admin-blitz-saved-notice"
                className="text-xs text-emerald-400 font-medium"
              >
                ✓ {labels.prizesSaved}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEdit}
            data-testid="admin-blitz-edit-prizes"
          >
            {labels.editPrizes}
          </Button>
        </div>
      ) : (
        <div
          data-testid="admin-blitz-edit-section"
          className="flex flex-col gap-3 pt-3 border-t border-[var(--borderColor,#334155)]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[var(--mutedForeground,#94a3b8)]">
                {labels.prizePoolLabel}
              </label>
              <input
                type="number"
                min={0}
                value={coinsInput}
                onChange={(e) => setCoinsInput(e.target.value)}
                data-testid="admin-blitz-coins-input"
                className="rounded-lg border border-[var(--borderColor,#334155)] bg-slate-800/80 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[var(--mutedForeground,#94a3b8)]">
                {labels.prizeDescriptionLabel}
              </label>
              <input
                type="text"
                maxLength={120}
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                data-testid="admin-blitz-desc-input"
                className="rounded-lg border border-[var(--borderColor,#334155)] bg-slate-800/80 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              data-testid="admin-blitz-cancel-prizes"
            >
              {labels.cancel}
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleSavePrizes}
              data-testid="admin-blitz-save-prizes"
            >
              {labels.savePrizes}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
