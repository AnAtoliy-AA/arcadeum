'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@arcadeum/ui';
import { useClansStore } from '../store/clansStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import type { Clan } from '../model/types';

interface DeclareWarModalProps {
  open: boolean;
  onClose: () => void;
  popularClans: Clan[];
  myClanId: string;
  labels?: Record<string, string | undefined>;
}

export function DeclareWarModal({
  open,
  onClose,
  popularClans,
  myClanId,
  labels = {},
}: DeclareWarModalProps) {
  const { snapshot } = useSessionTokens();
  const declareWar = useClansStore((s) => s.declareWar);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [targetScore, setTargetScore] = useState(5);
  const [gameId, setGameId] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const eligibleClans = popularClans.filter((c) => c.id !== myClanId);

  const handleDeclare = async () => {
    if (!snapshot.accessToken || !selectedTargetId) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await declareWar(
        selectedTargetId,
        { gameId, targetScore },
        snapshot.accessToken,
      );
      if (res) {
        onClose();
        setSelectedTargetId('');
      } else {
        setError(labels.declareWarError ?? 'Failed to declare war');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6" data-testid="declare-war-modal">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          {labels.declareWarTitle ?? 'Declare Clan War'}
        </h2>
        <p className="text-sm text-[var(--foreground)]/60">
          {labels.declareWarDesc ??
            'Challenge another clan to a competitive victory race.'}
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            {labels.selectOpponentClan ?? 'Select Opponent Clan'}
          </label>
          {eligibleClans.length > 0 ? (
            <select
              aria-label={labels.selectOpponentClan ?? 'Select Opponent Clan'}
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              data-testid="select-opponent-clan"
            >
              <option value="">
                {labels.chooseClanPrompt ?? '-- Choose an opponent clan --'}
              </option>
              {eligibleClans.map((clan) => (
                <option key={clan.id} value={clan.id}>
                  [{clan.tag}] {clan.name} ({clan.memberCount} members)
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              placeholder={
                labels.enterClanIdPlaceholder ?? 'Enter target clan ID'
              }
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {labels.warGameField ?? 'Featured Game'}
            </label>
            <select
              aria-label={labels.warGameField ?? 'Featured Game'}
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              data-testid="select-war-game"
            >
              <option value="all">{labels.allGames ?? 'All Games'}</option>
              <option value="sea-battle">Sea Battle</option>
              <option value="chess">Chess</option>
              <option value="checkers">Checkers</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              {labels.targetScoreLabel ?? 'Wins to Victory'}
            </label>
            <select
              aria-label={labels.targetScoreLabel ?? 'Wins to Victory'}
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              data-testid="select-war-score"
            >
              <option value="3">3 {labels.wins ?? 'wins'}</option>
              <option value="5">5 {labels.wins ?? 'wins'}</option>
              <option value="10">10 {labels.wins ?? 'wins'}</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            {labels.cancel ?? 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={handleDeclare}
            disabled={!selectedTargetId || submitting}
            data-testid="confirm-declare-war"
          >
            {submitting
              ? (labels.declaringWar ?? 'Declaring...')
              : (labels.confirmDeclareWar ?? 'Declare War')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
