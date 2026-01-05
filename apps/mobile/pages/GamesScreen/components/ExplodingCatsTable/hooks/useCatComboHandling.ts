import { useCallback } from 'react';
import type { ActionBusyType } from '../types';
import type { useCatCombo } from './useCatCombo';

type CatComboState = ReturnType<typeof useCatCombo>;

export function useCatComboHandling(
  catCombo: CatComboState,
  actionBusy: ActionBusyType | null,
  onPlayCatCombo: (params: {
    cat: string;
    mode: 'pair' | 'trio';
    targetPlayerId: string;
    desiredCard?: string;
    selectedIndex?: number;
  }) => void,
) {
  const catComboBusy = actionBusy === 'cat_pair' || actionBusy === 'cat_trio';

  const handleConfirmCatCombo = useCallback(() => {
    if (!catCombo.catComboPrompt || !catCombo.catComboPrompt.mode) {
      return;
    }

    if (!catCombo.catComboPrompt.targetPlayerId) {
      return;
    }

    if (catCombo.catComboPrompt.mode === 'pair') {
      if (catCombo.catComboPrompt.selectedIndex === null) {
        return;
      }
      onPlayCatCombo({
        cat: catCombo.catComboPrompt.cat,
        mode: 'pair',
        targetPlayerId: catCombo.catComboPrompt.targetPlayerId,
        selectedIndex: catCombo.catComboPrompt.selectedIndex,
      });
      catCombo.closeCatComboPrompt();
      return;
    }

    if (!catCombo.catComboPrompt.desiredCard) {
      return;
    }

    onPlayCatCombo({
      cat: catCombo.catComboPrompt.cat,
      mode: 'trio',
      targetPlayerId: catCombo.catComboPrompt.targetPlayerId,
      desiredCard: catCombo.catComboPrompt.desiredCard,
    });
    catCombo.closeCatComboPrompt();
  }, [catCombo, onPlayCatCombo]);

  const comboConfirmDisabled = !catCombo.catComboPrompt
    ? true
    : catComboBusy ||
      !catCombo.catComboPrompt.mode ||
      !catCombo.catComboPrompt.targetPlayerId ||
      (catCombo.catComboPrompt.mode === 'pair' &&
        catCombo.catComboPrompt.selectedIndex === null) ||
      (catCombo.catComboPrompt.mode === 'trio' &&
        !catCombo.catComboPrompt.desiredCard);

  return {
    catComboBusy,
    handleConfirmCatCombo,
    comboConfirmDisabled,
  };
}
