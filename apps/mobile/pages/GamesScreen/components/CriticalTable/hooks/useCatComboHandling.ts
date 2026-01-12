import { useCallback } from 'react';
import type { ActionBusyType, CriticalCatComboInput } from '../types';
import type { useCatCombo } from './useCatCombo';

type CatComboState = ReturnType<typeof useCatCombo>;

export function useCatComboHandling(
  catCombo: CatComboState,
  actionBusy: ActionBusyType | null,
  onPlayCatCombo: (params: CriticalCatComboInput) => void,
) {
  const catComboBusy =
    actionBusy === 'cat_pair' ||
    actionBusy === 'cat_trio' ||
    actionBusy === 'cat_fiver';

  const handleConfirmCatCombo = useCallback(() => {
    if (!catCombo.catComboPrompt || !catCombo.catComboPrompt.mode) {
      return;
    }

    // Fiver mode: uses 5 different cat cards to pick from discard pile
    if (catCombo.catComboPrompt.mode === 'fiver') {
      if (!catCombo.catComboPrompt.requestedDiscardCard) {
        return;
      }
      onPlayCatCombo({
        mode: 'fiver',
        requestedDiscardCard: catCombo.catComboPrompt.requestedDiscardCard,
      });
      catCombo.closeCatComboPrompt();
      return;
    }

    // Pair and Trio require targetPlayerId
    if (!catCombo.catComboPrompt.targetPlayerId) {
      return;
    }

    // Pair and Trio require cat selection
    if (!catCombo.catComboPrompt.cat) {
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
      // Fiver mode: requires requestedDiscardCard
      (catCombo.catComboPrompt.mode === 'fiver' &&
        !catCombo.catComboPrompt.requestedDiscardCard) ||
      // Pair/Trio: requires targetPlayerId and cat
      (catCombo.catComboPrompt.mode !== 'fiver' &&
        (!catCombo.catComboPrompt.targetPlayerId ||
          !catCombo.catComboPrompt.cat)) ||
      // Pair: requires selectedIndex
      (catCombo.catComboPrompt.mode === 'pair' &&
        catCombo.catComboPrompt.selectedIndex === null) ||
      // Trio: requires desiredCard
      (catCombo.catComboPrompt.mode === 'trio' &&
        !catCombo.catComboPrompt.desiredCard);

  return {
    catComboBusy,
    handleConfirmCatCombo,
    comboConfirmDisabled,
  };
}
