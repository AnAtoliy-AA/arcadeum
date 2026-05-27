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
  /**
   * Fire the "Cascade!" race call. Available to ALL alive players whenever
   * `snapshot.lastCardWindow` is open — not gated on whose turn it is.
   */
  onCallCascade?: () => void;
}

export function CascadeBoard({
  snapshot,
  currentUserId,
  myHand,
  myTurn,
  disabled,
  onPlayCard,
  onDraw,
  onCallCascade,
}: CascadeBoardProps) {
  const theme = useCascadeTheme();
  const [pendingWildCard, setPendingWildCard] = useState<string | null>(null);

  const cascadeOpen =
    snapshot.options.lastCardCallEnabled && !!snapshot.lastCardWindow;
  const atRiskIsMe =
    cascadeOpen && snapshot.lastCardWindow!.playerId === currentUserId;

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

      {/* Last-Card race: pulsing call button visible to ALL alive players
          while the window is open. First press wins — the engine sorts the
          race by arrival order. Self-press = safe; other-press = at-risk
          player draws 2 penalty cards. */}
      {cascadeOpen && onCallCascade ? (
        <XStack justifyContent="center" paddingTop="$2">
          <button
            type="button"
            onClick={onCallCascade}
            aria-label={
              atRiskIsMe ? 'Call Cascade — save yourself' : 'Call Cascade'
            }
            style={{
              padding: '12px 28px',
              borderRadius: 999,
              border: '2px solid rgba(251, 191, 36, 0.6)',
              background:
                'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow:
                '0 0 0 4px rgba(251, 191, 36, 0.18), 0 6px 16px rgba(0,0,0,0.45)',
              animation: 'cascade-pulse 900ms ease-in-out infinite',
            }}
          >
            Cascade!
          </button>
          <style>{`@keyframes cascade-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }`}</style>
        </XStack>
      ) : null}

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
