'use client';

import { useState, useTransition } from 'react';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import { markCompleteAction } from '../server/tournament.actions';
import type { TournamentRegistrationEntry } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarkCompleteDialogLabels {
  button: string;
  dialog: {
    title: string;
    body: string;
    confirm: string;
    cancel: string;
  };
  errors: {
    notRegistered: string;
    notLive: string;
    generic: string;
  };
}

export interface MarkCompleteDialogProps {
  tournament: {
    id: string;
    registrations?: TournamentRegistrationEntry[];
  };
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  labels: MarkCompleteDialogLabels;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarkCompleteDialog({
  tournament,
  open,
  onClose,
  onSuccess,
  labels,
}: MarkCompleteDialogProps) {
  const registrations = tournament.registrations ?? [];
  const [selectedUserId, setSelectedUserId] = useState<string>(
    registrations[0]?.userId ?? '',
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleConfirm = () => {
    if (!selectedUserId) return;
    setErrorMsg(null);

    startTransition(async () => {
      const result = await markCompleteAction({
        tournamentId: tournament.id,
        winnerUserId: selectedUserId,
      });

      if (result.ok) {
        onSuccess?.();
        onClose();
      } else {
        const errorMap: Record<string, string> = {
          not_registered: labels.errors.notRegistered,
          not_live: labels.errors.notLive,
          generic: labels.errors.generic,
          validation: labels.errors.generic,
        };
        setErrorMsg(errorMap[result.error] ?? labels.errors.generic);
      }
    });
  };

  const OVERLAY_STYLE: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const DIALOG_STYLE: React.CSSProperties = {
    background: '#1a1a2e',
    border: '1px solid #444',
    borderRadius: 12,
    padding: 24,
    minWidth: 360,
    maxWidth: 480,
  };

  const SELECT_STYLE: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid #555',
    background: 'transparent',
    color: 'inherit',
    width: '100%',
  };

  return (
    <div style={OVERLAY_STYLE} data-testid="mark-complete-dialog">
      <div style={DIALOG_STYLE}>
        <YStack gap="$3">
          <Text fontWeight="700" fontSize="$5">
            {labels.dialog.title}
          </Text>

          <Text fontSize="$2" opacity={0.85}>
            {labels.dialog.body}
          </Text>

          {registrations.length === 0 ? (
            <Text fontSize="$2" opacity={0.6}>
              No registrations found.
            </Text>
          ) : (
            <select
              data-testid="winner-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={SELECT_STYLE}
            >
              {registrations.map((r) => (
                <option key={r.userId} value={r.userId}>
                  {r.displayName ? `${r.displayName} (${r.userId})` : r.userId}
                </option>
              ))}
            </select>
          )}

          {errorMsg && (
            <Text
              fontSize="$1"
              color="$errorText"
              data-testid="mark-complete-error"
            >
              {errorMsg}
            </Text>
          )}

          <XStack gap="$3" justifyContent="flex-end" paddingTop="$2">
            <Button
              variant="outline"
              onPress={onClose}
              disabled={isPending}
              data-testid="mark-complete-cancel"
            >
              {labels.dialog.cancel}
            </Button>
            <Button
              onPress={handleConfirm}
              disabled={
                isPending || !selectedUserId || registrations.length === 0
              }
              data-testid="mark-complete-confirm"
            >
              {isPending ? '…' : labels.dialog.confirm}
            </Button>
          </XStack>
        </YStack>
      </div>
    </div>
  );
}
