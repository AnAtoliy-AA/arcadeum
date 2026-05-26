'use client';

import { useMemo, useState } from 'react';
import { XStack, YStack } from 'tamagui';
import { Card } from './Card';
import { ColorPicker } from './ColorPicker';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import type {
  ActiveColor,
  CascadeCard,
  CascadeClientState,
} from '../types';

interface CascadeBoardProps {
  snapshot: CascadeClientState;
  currentUserId: string | null;
  myHand: CascadeCard[];
  myTurn: boolean;
  disabled: boolean;
  onPlayCard: (cardId: string, chosenColor?: ActiveColor) => void;
  onDraw: () => void;
}

export function CascadeBoard({
  snapshot,
  currentUserId,
  myHand,
  myTurn,
  disabled,
  onPlayCard,
  onDraw,
}: CascadeBoardProps) {
  const theme = useCascadeTheme();
  const [pendingWildCard, setPendingWildCard] = useState<string | null>(null);

  const opponents = useMemo(
    () => snapshot.players.filter((p) => p.playerId !== currentUserId),
    [snapshot.players, currentUserId],
  );

  const playableIds = useMemo(() => {
    const set = new Set<string>();
    if (!myTurn || disabled) return set;
    for (const c of myHand) {
      if (isPlayable(c, snapshot)) set.add(c.id);
    }
    return set;
  }, [myHand, snapshot, myTurn, disabled]);

  const handleCardClick = (card: CascadeCard) => {
    if (!myTurn || disabled) return;
    if (!playableIds.has(card.id)) return;
    if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') {
      setPendingWildCard(card.id);
      return;
    }
    onPlayCard(card.id);
  };

  const handlePickColor = (color: ActiveColor) => {
    if (!pendingWildCard) return;
    onPlayCard(pendingWildCard, color);
    setPendingWildCard(null);
  };

  return (
    <YStack
      width="100%"
      gap="$4"
      padding="$3"
      borderRadius="$4"
      style={{ background: theme.background, position: 'relative', minHeight: 520 }}
    >
      {/* Opponents */}
      <XStack gap="$3" flexWrap="wrap" justifyContent="center">
        {opponents.map((opp) => (
          <YStack
            key={opp.playerId}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$3"
            backgroundColor="rgba(0,0,0,0.35)"
            alignItems="center"
            minWidth={120}
          >
            <span style={{ color: theme.cardText, fontWeight: 600 }}>
              {opp.playerId.startsWith('bot-') ? 'Bot' : opp.playerId.slice(0, 6)}
            </span>
            <span style={{ color: '#cbd5e1', fontSize: 12 }}>
              {opp.hand.length} cards
            </span>
          </YStack>
        ))}
      </XStack>

      {/* Center: draw + discard */}
      <XStack gap="$5" justifyContent="center" alignItems="center" paddingVertical="$4">
        <button
          type="button"
          onClick={() => myTurn && !disabled && onDraw()}
          disabled={!myTurn || disabled}
          aria-label="Draw a card"
          style={{
            width: 88,
            height: 132,
            borderRadius: 12,
            background: theme.surface,
            border: `2px dashed ${theme.cardBorder}`,
            color: theme.cardText,
            cursor: myTurn && !disabled ? 'pointer' : 'default',
            fontSize: 14,
            fontWeight: 600,
            opacity: myTurn && !disabled ? 1 : 0.6,
          }}
        >
          Draw
          {snapshot.pendingDraw > 0 ? (
            <div style={{ fontSize: 12, marginTop: 6 }}>
              +{snapshot.pendingDraw}
            </div>
          ) : null}
        </button>

        <Card card={snapshot.topCard} size="lg" disabled />
      </XStack>

      {/* My hand */}
      <YStack gap="$2">
        <XStack
          gap="$2"
          padding="$2"
          borderRadius="$3"
          backgroundColor="rgba(0,0,0,0.25)"
          flexWrap="wrap"
          justifyContent="center"
        >
          {myHand.map((c) => (
            <Card
              key={c.id}
              card={c}
              playable={playableIds.has(c.id)}
              disabled={!myTurn || disabled || !playableIds.has(c.id)}
              onClick={() => handleCardClick(c)}
            />
          ))}
        </XStack>
      </YStack>

      <ColorPicker open={!!pendingWildCard} onPick={handlePickColor} />
    </YStack>
  );
}

function isPlayable(card: CascadeCard, snapshot: CascadeClientState): boolean {
  const { topCard, activeColor, pendingDraw, pendingStackKind } = snapshot;
  if (pendingDraw > 0 && pendingStackKind) {
    return card.kind === pendingStackKind;
  }
  if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') return true;
  if (card.color !== 'W' && card.color === activeColor) return true;
  if (
    card.kind === 'NUMBER' &&
    topCard.kind === 'NUMBER' &&
    card.value === topCard.value
  )
    return true;
  if (
    (card.kind === 'SKIP' ||
      card.kind === 'REVERSE' ||
      card.kind === 'DRAW_TWO') &&
    card.kind === topCard.kind
  )
    return true;
  return false;
}
