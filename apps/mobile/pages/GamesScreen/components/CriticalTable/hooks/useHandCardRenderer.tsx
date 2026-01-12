import React, { useCallback } from 'react';
import type { TFunction } from '@/lib/i18n';
import type { ActionBusyType, CriticalCard, CriticalCatCard } from '../types';
import { CAT_COMBO_CARDS } from '../constants';
import { HandCard } from '../components/HandCard';
import type { useCardAnimations } from './useCardAnimations';
import type { useCatCombo } from './useCatCombo';
import type { CriticalTableStyles } from '../styles';

type CardAnimationsState = ReturnType<typeof useCardAnimations>;
type CatComboState = ReturnType<typeof useCatCombo>;

export function useHandCardRenderer(
  isSessionActive: boolean,
  isMyTurn: boolean,
  selfPlayerAlive: boolean,
  canPlaySkip: boolean,
  canPlayAttack: boolean,
  canPlaySeeTheFuture: boolean,
  canPlayShuffle: boolean,
  actionBusy: ActionBusyType | null,
  gridCardWidth: number,
  gridCardHeight: number,
  animations: CardAnimationsState,
  catCombo: CatComboState,
  t: TFunction,
  translateCardName: (card: CriticalCard) => string,
  translateCardDescription: (card: CriticalCard) => string,
  onPlay: (
    action:
      | 'skip'
      | 'attack'
      | 'shuffle'
      | 'personal_attack'
      | 'attack_of_the_dead'
      | 'super_skip'
      | 'reverse',
  ) => void,
  onPlaySeeTheFuture: () => void,
  onPlayTargetedAction: (card: CriticalCard) => void,
  styles: CriticalTableStyles,
) {
  const catComboBusy = actionBusy === 'cat_pair' || actionBusy === 'cat_trio';

  const renderHandCard = useCallback(
    (
      card: CriticalCard,
      index: number,
      count: number,
      mode: 'row' | 'grid' = 'row',
    ) => {
      const cardKey = `${card}-${index}`;
      // Determine if this is an action card that can be played directly
      const quickAction =
        card === 'skip'
          ? 'skip'
          : card === 'attack'
            ? 'attack'
            : card === 'shuffle'
              ? 'shuffle'
              : card === 'see_the_future'
                ? 'see_the_future'
                : card === 'targeted_attack'
                  ? 'targeted_attack'
                  : card === 'personal_attack'
                    ? 'personal_attack'
                    : card === 'attack_of_the_dead'
                      ? 'attack_of_the_dead'
                      : card === 'super_skip'
                        ? 'super_skip'
                        : card === 'reverse'
                          ? 'reverse'
                          : null;
      const isCatCard = CAT_COMBO_CARDS.includes(card as CriticalCatCard);
      const comboAvailability = isCatCard
        ? catCombo.catComboAvailability[card as CriticalCatCard]
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
          : quickAction === 'attack' ||
              quickAction === 'targeted_attack' ||
              quickAction === 'personal_attack' ||
              quickAction === 'attack_of_the_dead' ||
              quickAction === 'super_skip' ||
              quickAction === 'reverse'
            ? canPlayAttack
            : quickAction === 'see_the_future'
              ? canPlaySeeTheFuture
              : quickAction === 'shuffle'
                ? canPlayShuffle
                : comboPlayable;

      const isBusy =
        quickAction === 'skip'
          ? actionBusy === 'skip'
          : quickAction === 'attack'
            ? actionBusy === 'attack'
            : quickAction === 'see_the_future'
              ? actionBusy === 'see_the_future'
              : quickAction === 'shuffle'
                ? actionBusy === 'shuffle'
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
            : quickAction === 'see_the_future'
              ? t('games.table.cards.seeTheFuture')
              : quickAction === 'shuffle'
                ? t('games.table.cards.shuffle')
                : quickAction === 'targeted_attack' ||
                    quickAction === 'personal_attack' ||
                    quickAction === 'attack_of_the_dead' ||
                    quickAction === 'super_skip' ||
                    quickAction === 'reverse'
                  ? t('games.table.actions.playCard')
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
          if (quickAction === 'see_the_future') {
            onPlaySeeTheFuture();
            return;
          }
          if (quickAction === 'targeted_attack') {
            onPlayTargetedAction(card);
            return;
          }

          if (
            quickAction === 'skip' ||
            quickAction === 'attack' ||
            quickAction === 'shuffle' ||
            quickAction === 'personal_attack' ||
            quickAction === 'attack_of_the_dead' ||
            quickAction === 'super_skip' ||
            quickAction === 'reverse'
          ) {
            onPlay(quickAction);
            return;
          }

          if (isCatCard) {
            catCombo.openCatComboPrompt(card as CriticalCatCard);
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
      canPlaySeeTheFuture,
      canPlayShuffle,
      canPlaySkip,
      catCombo,
      catComboBusy,
      gridCardHeight,
      gridCardWidth,
      isMyTurn,
      isSessionActive,
      onPlay,
      onPlaySeeTheFuture,
      onPlayTargetedAction,
      selfPlayerAlive,
      t,
      translateCardDescription,
      translateCardName,
      styles,
    ],
  );

  return renderHandCard;
}
