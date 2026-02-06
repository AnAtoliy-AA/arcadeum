import React, { useCallback } from 'react';
import type { TFunction } from '@/lib/i18n';
import type {
  ActionBusyType,
  CriticalCard,
  CriticalCatCard,
  CriticalActionCard,
} from '../types';
import { CAT_COMBO_CARDS, QUICK_ACTION_CARDS } from '../constants';
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
  onPlay: (action: CriticalActionCard) => void,
  onPlaySeeTheFuture: () => void,
  onPlayTargetedAction: (card: CriticalCard) => void,
  styles: CriticalTableStyles,
  cardVariant?: string,
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
      const quickAction = (QUICK_ACTION_CARDS as readonly string[]).includes(
        card,
      )
        ? (card as (typeof QUICK_ACTION_CARDS)[number])
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

      const isAnimating = animations.animatingCardKey === cardKey;
      const isGrid = mode === 'grid';
      const cardWidth = isGrid ? gridCardWidth : 148;
      const cardHeight = isGrid ? gridCardHeight : 228;

      const checkIsPlayable = () => {
        if (!quickAction) return comboPlayable;

        switch (quickAction) {
          case 'evade':
            return canPlaySkip;
          case 'strike':
          case 'targeted_strike':
          case 'private_strike':
          case 'recursive_strike':
          case 'mega_evade':
          case 'invert':
            return canPlayAttack;
          case 'insight':
            return canPlaySeeTheFuture;
          case 'reorder':
            return canPlayShuffle;
          default:
            return comboPlayable;
        }
      };

      const checkIsBusy = () => {
        if (!quickAction) return isCatCard && catComboBusy;

        switch (quickAction) {
          case 'evade':
            return actionBusy === 'evade';
          case 'strike':
            return actionBusy === 'strike';
          case 'insight':
            return actionBusy === 'see_the_future';
          case 'reorder':
            return actionBusy === 'reorder';
          default:
            return false;
        }
      };

      const getActionHint = () => {
        if (!quickAction) {
          return comboPlayable
            ? t('games.table.actions.playCatCombo')
            : undefined;
        }

        switch (quickAction) {
          case 'evade':
            return t('games.table.actions.playSkip');
          case 'strike':
            return t('games.table.actions.playAttack');
          case 'insight':
            return t('games.table.cards.seeTheFuture');
          case 'reorder':
            return t('games.table.cards.shuffle');
          case 'targeted_strike':
          case 'private_strike':
          case 'recursive_strike':
          case 'mega_evade':
          case 'invert':
            return t('games.table.actions.playCard');
          default:
            return undefined;
        }
      };

      const isPlayable = checkIsPlayable();
      const isBusy = checkIsBusy();
      const actionHint = getActionHint();

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
          if (!quickAction) {
            if (isCatCard) {
              catCombo.openCatComboPrompt(card as CriticalCatCard);
            }
            return;
          }

          if (quickAction === 'insight') {
            onPlaySeeTheFuture();
            return;
          }
          if (quickAction === 'targeted_strike') {
            onPlayTargetedAction(card);
            return;
          }

          if (
            quickAction === 'evade' ||
            quickAction === 'strike' ||
            quickAction === 'reorder' ||
            quickAction === 'private_strike' ||
            quickAction === 'recursive_strike' ||
            quickAction === 'mega_evade' ||
            quickAction === 'invert'
          ) {
            onPlay(quickAction);
            return;
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
          gameVariant={cardVariant}
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
      cardVariant,
    ],
  );

  return renderHandCard;
}
