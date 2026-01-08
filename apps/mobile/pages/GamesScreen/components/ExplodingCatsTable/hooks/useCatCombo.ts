import { useCallback, useMemo, useState } from 'react';
import type {
  ExplodingCatsCatCard,
  ExplodingCatsCard,
  CatComboPromptState,
  ProcessedPlayer,
} from '../types';
import { CAT_COMBO_CARDS } from '../constants';

export function useCatCombo(
  selfPlayerHand: ExplodingCatsCard[] | undefined,
  aliveOpponents: ProcessedPlayer[],
) {
  const catCardCounts = useMemo(() => {
    const counts: Record<ExplodingCatsCatCard, number> = {
      tacocat: 0,
      hairy_potato_cat: 0,
      rainbow_ralphing_cat: 0,
      cattermelon: 0,
      bearded_cat: 0,
    };

    if (selfPlayerHand?.length) {
      selfPlayerHand.forEach((card) => {
        if (CAT_COMBO_CARDS.includes(card as ExplodingCatsCatCard)) {
          const catCard = card as ExplodingCatsCatCard;
          counts[catCard] = (counts[catCard] ?? 0) + 1;
        }
      });
    }

    return counts;
  }, [selfPlayerHand]);

  const catComboAvailability = useMemo(() => {
    const availability: Record<
      ExplodingCatsCatCard,
      { pair: boolean; trio: boolean }
    > = {
      tacocat: { pair: false, trio: false },
      hairy_potato_cat: { pair: false, trio: false },
      rainbow_ralphing_cat: { pair: false, trio: false },
      cattermelon: { pair: false, trio: false },
      bearded_cat: { pair: false, trio: false },
    };

    CAT_COMBO_CARDS.forEach((cat) => {
      const count = catCardCounts[cat] ?? 0;
      availability[cat] = {
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
    (cat: ExplodingCatsCatCard) => {
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
    (discardPile: ExplodingCatsCard[]) => {
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
    (mode: 'pair' | 'trio') => {
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

  const handleCatComboDesiredCardChange = useCallback(
    (card: ExplodingCatsCard) => {
      setCatComboPrompt((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          desiredCard: card,
        };
      });
    },
    [],
  );

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

  const handleRequestedDiscardCardChange = useCallback(
    (card: ExplodingCatsCard) => {
      setCatComboPrompt((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          requestedDiscardCard: card,
        };
      });
    },
    [],
  );

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
