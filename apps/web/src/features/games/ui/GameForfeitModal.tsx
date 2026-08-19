'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { ConfirmationModal } from './ConfirmationModal';

export interface GameForfeitModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when the player confirms they want to forfeit. */
  onConfirm: () => void;
  /** Optional custom labels; default to games.table.forfeit.* */
  labels?: {
    title?: string;
    message?: string;
    confirm?: string;
    cancel?: string;
  };
}

/**
 * Shared "Confirm forfeit" modal for turn-based games. Games pass their
 * forfeit action (e.g. `xxx.session.forfeit`) as `onConfirm`.
 */
export function GameForfeitModal({
  open,
  onClose,
  onConfirm,
  labels,
}: GameForfeitModalProps) {
  const { t } = useTranslation();

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={
        labels?.title ??
        (t('games.table.forfeit.title' as TranslationKey) || 'Forfeit game?')
      }
      message={
        labels?.message ??
        (t('games.table.forfeit.message' as TranslationKey) ||
          'Are you sure you want to forfeit? Your opponent wins.')
      }
      confirmLabel={
        labels?.confirm ??
        (t('games.table.forfeit.confirm' as TranslationKey) || 'Forfeit')
      }
      cancelLabel={
        labels?.cancel ??
        (t('games.table.forfeit.cancel' as TranslationKey) || 'Cancel')
      }
    />
  );
}
