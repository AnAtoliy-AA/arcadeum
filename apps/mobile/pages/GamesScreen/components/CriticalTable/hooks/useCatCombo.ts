import { useCallback, useMemo, useState } from 'react';
import type {
  CriticalCatCard,
  CriticalCard,
  CatComboPromptState,
  ProcessedPlayer,
} from '../types';
import { CAT_COMBO_CARDS } from '../constants';
import { SPECIAL_CARDS } from '../types';

export function useCatCombo(
  selfPlayerHand: CriticalCard[] | undefined,
  aliveOpponents: ProcessedPlayer[],
  allowActionCardCombos = false,
) {
  const catCardCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (selfPlayerHand?.length) {
      selfPlayerHand.forEach((card) => {
        if (CAT_COMBO_CARDS.includes(card as CriticalCatCard)) {
          counts[card] = (counts[card] ?? 0) + 1;
        } else if (
          allowActionCardCombos &&
          !(SPECIAL_CARDS as readonly CriticalCard[]).includes(card)
        ) {
          counts[card] = (counts[card] ?? 0) + 1;
        }
      });
    }

    return counts;
  }, [selfPlayerHand, allowActionCardCombos]);

  const catComboAvailability = useMemo(() => {
    const availability: Record<string, { pair: boolean; trio: boolean }> = {};

    Object.keys(catCardCounts).forEach((card) => {
      const count = catCardCounts[card] ?? 0;
      availability[card] = {
        pair: count >= 2 && aliveOpponents.length > 0,
        trio: count >= 3 && aliveOpponents.length > 0,
      };
    });

    return availability;
  }, [catCardCounts, aliveOpponents]);

  // Check if fiver combo is available (has at least FIVER_COMBO_SIZE different cards)
  const FIVER_COMBO_SIZE = 5;
  const fiverAvailable = useMemo(() => {
    if (!selfPlayerHand || selfPlayerHand.length < FIVER_COMBO_SIZE)
      return false;
    const uniqueCards = new Set(selfPlayerHand);
    return uniqueCards.size >= FIVER_COMBO_SIZE;
  }, [selfPlayerHand]);

  const [catComboPrompt, setCatComboPrompt] =
    useState<CatComboPromptState | null>(null);

  const closeCatComboPrompt = useCallback(() => {
    setCatComboPrompt(null);
  }, []);

  const openCatComboPrompt = useCallback(
    (cat: CriticalCard) => {
      const availability = catComboAvailability[cat];
      if (!availability || (!availability.pair && !availability.trio)) {
        return;
      }

      const preferredMode = availability.pair ? 'pair' : 'trio';
      const defaultTarget = aliveOpponents[0]?.playerId ?? null;
      const defaultDesired = availability.trio ? 'defuse' : null;

      if (!defaultTarget) {
        return;
      }

      setCatComboPrompt({
        cat,
        mode: preferredMode,
        targetPlayerId: defaultTarget,
        desiredCard: preferredMode === 'trio' ? defaultDesired : null,
        selectedIndex: preferredMode === 'pair' ? 0 : null,
        requestedDiscardCard: null,
        available: { ...availability, fiver: false },
      });
    },
    [aliveOpponents, catComboAvailability],
  );

  // Open fiver combo prompt (uses all 5 different cat cards)
  const openFiverComboPrompt = useCallback(
    (discardPile: CriticalCard[]) => {
      if (!fiverAvailable || discardPile.length === 0) {
        return;
      }

      setCatComboPrompt({
        cat: null,
        mode: 'fiver',
        targetPlayerId: null,
        desiredCard: null,
        selectedIndex: null,
        requestedDiscardCard: discardPile[0] ?? null,
        available: { pair: false, trio: false, fiver: true },
      });
    },
    [fiverAvailable],
  );

  const handleCatComboModeChange = useCallback(
    (mode: 'pair' | 'trio' | 'fiver') => {
      setCatComboPrompt((prev) => {
        if (!prev || !prev.available[mode]) {
          return prev;
        }
        const nextTarget =
          prev.targetPlayerId ?? aliveOpponents[0]?.playerId ?? null;
        const nextDesired =
          mode === 'trio' ? (prev.desiredCard ?? 'defuse') : null;
        const nextSelectedIndex = mode === 'pair' ? 0 : null;
        return {
          ...prev,
          mode,
          targetPlayerId: nextTarget,
          desiredCard: nextDesired,
          selectedIndex: nextSelectedIndex,
        };
      });
    },
    [aliveOpponents],
  );

  const handleCatComboTargetChange = useCallback((playerId: string) => {
    setCatComboPrompt((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        targetPlayerId: playerId,
      };
    });
  }, []);

  const handleCatComboDesiredCardChange = useCallback((card: CriticalCard) => {
    setCatComboPrompt((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        desiredCard: card,
      };
    });
  }, []);

  const handleCatComboSelectedIndexChange = useCallback((index: number) => {
    setCatComboPrompt((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        selectedIndex: index,
      };
    });
  }, []);

  const handleRequestedDiscardCardChange = useCallback((card: CriticalCard) => {
    setCatComboPrompt((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        requestedDiscardCard: card,
      };
    });
  }, []);

  return {
    catCardCounts,
    catComboAvailability,
    fiverAvailable,
    catComboPrompt,
    closeCatComboPrompt,
    openCatComboPrompt,
    openFiverComboPrompt,
    handleCatComboModeChange,
    handleCatComboTargetChange,
    handleCatComboDesiredCardChange,
    handleCatComboSelectedIndexChange,
    handleRequestedDiscardCardChange,
  };
}
