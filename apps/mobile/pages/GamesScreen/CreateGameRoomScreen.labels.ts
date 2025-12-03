import { useMemo } from 'react';
import type { GameCatalogueEntry } from './catalog';

type TranslateFn = (key: string, replacements?: Record<string, unknown>) => string;

export function useCreateGameRoomLabels(
  t: TranslateFn,
  selectedGame: GameCatalogueEntry | undefined,
) {
  const loadingFallbackMessage = t('games.create.loadingFallback');
  const introTitle = t('games.create.title');
  const introSubtitle = t('games.create.subtitle');
  const sectionGame = t('games.create.sectionGame');
  const sectionDetails = t('games.create.sectionDetails');
  const sectionPreview = t('games.create.sectionPreview');
  const comingSoonLabel = t('games.create.badgeComingSoon');
  const disabledAlertTitle = t('games.create.alerts.gameUnavailableTitle');
  const disabledAlertMessage = t('games.create.alerts.gameUnavailableMessage');

  const detailLabels = useMemo(
    () => ({
      name: t('games.create.fieldName'),
      maxPlayers: t('games.create.fieldMaxPlayers'),
      visibility: t('games.create.fieldVisibility'),
      notes: t('games.create.fieldNotes'),
    }),
    [t],
  );

  const detailPlaceholders = useMemo(
    () => ({
      name: t('games.create.namePlaceholder', {
        example: selectedGame?.name ?? t('games.rooms.unknownGame'),
      }),
      maxPlayers: t('games.create.autoPlaceholder'),
      notes: t('games.create.notesPlaceholder'),
    }),
    [t, selectedGame],
  );

  const visibilityLabels = useMemo(
    () => ({
      public: t('games.create.visibilityPublic'),
      private: t('games.create.visibilityPrivate'),
    }),
    [t],
  );

  const submitCreatingLabel = t('games.create.submitCreating');
  const submitLabel = t('games.common.createRoom');

  return {
    loadingFallbackMessage,
    introTitle,
    introSubtitle,
    sectionGame,
    sectionDetails,
    sectionPreview,
    comingSoonLabel,
    disabledAlertTitle,
    disabledAlertMessage,
    detailLabels,
    detailPlaceholders,
    visibilityLabels,
    submitCreatingLabel,
    submitLabel,
  };
}
