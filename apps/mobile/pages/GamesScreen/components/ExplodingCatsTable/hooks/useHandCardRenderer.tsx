import React, { useCallback } from 'react';
import type {
  ActionBusyType,
  ExplodingCatsCard,
  ExplodingCatsCatCard,
} from '../types';
import { CAT_COMBO_CARDS } from '../constants';
import { HandCard } from '../components/HandCard';
import type { useCardAnimations } from './useCardAnimations';
import type { useCatCombo } from './useCatCombo';
import type { ExplodingCatsTableStyles } from '../styles';

type CardAnimationsState = ReturnType<typeof useCardAnimations>;
type CatComboState = ReturnType<typeof useCatCombo>;

export function useHandCardRenderer(
  isSessionActive: boolean,
  isMyTurn: boolean,
  selfPlayerAlive: boolean,
  canPlaySkip: boolean,
  canPlayAttack: boolean,
  actionBusy: ActionBusyType | null,
  gridCardWidth: number,
  gridCardHeight: number,
  animations: CardAnimationsState,
  catCombo: CatComboState,
  t: (key: string, replacements?: Record<string, string | number>) => string,
  translateCardName: (card: ExplodingCatsCard) => string,
  translateCardDescription: (card: ExplodingCatsCard) => string,
  onPlay: (action: 'skip' | 'attack') => void,
  styles: ExplodingCatsTableStyles,
) {
  const catComboBusy = actionBusy === 'cat_pair' || actionBusy === 'cat_trio';

  const renderHandCard = useCallback(
    (
      card: ExplodingCatsCard,
      index: number,
      count: number,
      mode: 'row' | 'grid' = 'row',
    ) => {
      const cardKey = `${card}-${index}`;
      const quickAction =
        card === 'skip' ? 'skip' : card === 'attack' ? 'attack' : null;
      const isCatCard = CAT_COMBO_CARDS.includes(card as ExplodingCatsCatCard);
      const comboAvailability = isCatCard
        ? catCombo.catComboAvailability[card as ExplodingCatsCatCard]
        : null;
      const comboPlayable = Boolean(
        isCatCard &&
          comboAvailability &&
          (comboAvailability.pair || comboAvailability.trio) &&
          isSessionActive &&
          isMyTurn &&
          selfPlayerAlive,
      );

      const isPlayable =
        quickAction === 'skip'
          ? canPlaySkip
          : quickAction === 'attack'
            ? canPlayAttack
            : comboPlayable;

      const isBusy =
        quickAction === 'skip'
          ? actionBusy === 'skip'
          : quickAction === 'attack'
            ? actionBusy === 'attack'
            : isCatCard && catComboBusy;

      const isAnimating = animations.animatingCardKey === cardKey;
      const isGrid = mode === 'grid';
      const cardWidth = isGrid ? gridCardWidth : 148;
      const cardHeight = isGrid ? gridCardHeight : 228;

      const actionHint =
        quickAction === 'skip'
          ? t('games.table.actions.playSkip')
          : quickAction === 'attack'
            ? t('games.table.actions.playAttack')
            : comboPlayable
              ? t('games.table.actions.playCatCombo')
              : undefined;

      const comboHint =
        comboPlayable && comboAvailability
          ? comboAvailability.pair && comboAvailability.trio
            ? t('games.table.catCombo.optionPairOrTrio')
            : comboAvailability.trio
              ? t('games.table.catCombo.optionTrio')
              : t('games.table.catCombo.optionPair')
          : undefined;

      const handlePress = () => {
        if (!isPlayable || isBusy || animations.animatingCardKey !== null) {
          return;
        }

        const execute = () => {
          if (quickAction) {
            onPlay(quickAction);
            return;
          }

          if (isCatCard) {
            catCombo.openCatComboPrompt(card as ExplodingCatsCatCard);
          }
        };

        animations.triggerCardAnimation(cardKey, execute);
      };

      return (
        <HandCard
          key={cardKey}
          card={card}
          index={index}
          count={count}
          mode={mode}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          isPlayable={isPlayable}
          isBusy={isBusy}
          isAnimating={isAnimating}
          animationScale={animations.cardPressScale}
          actionHint={actionHint}
          comboHint={comboHint}
          translateCardName={translateCardName}
          translateCardDescription={translateCardDescription}
          onPress={handlePress}
          styles={styles}
        />
      );
    },
    [
      actionBusy,
      animations,
      canPlayAttack,
      canPlaySkip,
      catCombo,
      catComboBusy,
      gridCardHeight,
      gridCardWidth,
      isMyTurn,
      isSessionActive,
      onPlay,
      selfPlayerAlive,
      t,
      translateCardDescription,
      translateCardName,
      styles,
    ],
  );

  return renderHandCard;
}
