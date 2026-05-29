'use client';

import { useMemo, useState } from 'react';
import { XStack, YStack } from 'tamagui';
import { Card } from './Card';
import { ColorPicker } from './ColorPicker';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import styles from './CascadeGame.module.css';
import type { ActiveColor, CascadeCard, CascadeClientState } from '../types';

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

/** Card-backs shown in an opponent pod, capped so a huge hand stays tidy. */
const MAX_FAN_BACKS = 7;

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

  const activeTurnId = snapshot.playerOrder[snapshot.currentTurnIndex] ?? null;

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

  const handCount = myHand.length;
  const drawEnabled = myTurn && !disabled;

  return (
    <YStack
      width="100%"
      gap="$3"
      padding="$3"
      borderRadius="$4"
      className={styles.table}
      style={
        {
          background: theme.background,
          minHeight: 540,
          '--cascade-text': theme.cardText,
          '--cascade-surface': theme.surface,
          '--cascade-card-border': theme.cardBorder,
          '--cascade-card-text': theme.cardText,
        } as React.CSSProperties
      }
    >
      <YStack gap="$3" className={styles.tableLayer}>
        {/* Opponents */}
        <XStack gap="$3" flexWrap="wrap" justifyContent="center">
          {opponents.map((opp) => {
            const backs = Math.min(opp.hand.length, MAX_FAN_BACKS);
            const isActive = opp.playerId === activeTurnId;
            return (
              <YStack
                key={opp.playerId}
                className={`${styles.pod} ${isActive ? styles.podActive : ''}`}
              >
                <span
                  className={styles.podAvatar}
                  style={{
                    background: theme.palette[avatarColor(opp.playerId)],
                  }}
                  aria-hidden="true"
                >
                  {shortName(opp.playerId).charAt(0).toUpperCase()}
                </span>
                <span className={styles.podName}>
                  {shortName(opp.playerId)}
                </span>
                <span className={styles.podCount}>{opp.hand.length} cards</span>
                <div className={styles.podFan} aria-hidden="true">
                  {Array.from({ length: backs }).map((_, i) => (
                    <span
                      key={i}
                      className={styles.podFanCard}
                      style={{
                        transform: `rotate(${(i - (backs - 1) / 2) * 7}deg)`,
                      }}
                    />
                  ))}
                </div>
              </YStack>
            );
          })}
        </XStack>

        {/* Last-Card race: pulsing call button visible to ALL alive players
            while the window is open. First press wins — the engine sorts the
            race by arrival order. Self-press = safe; other-press = at-risk
            player draws 2 penalty cards. */}
        {cascadeOpen && onCallCascade ? (
          <XStack justifyContent="center" paddingTop="$1">
            <button
              type="button"
              onClick={onCallCascade}
              className={styles.callButton}
              aria-label={
                atRiskIsMe ? 'Call Cascade — save yourself' : 'Call Cascade'
              }
            >
              Cascade!
            </button>
          </XStack>
        ) : null}

        {/* Center: draw deck + discard pile */}
        <div className={styles.piles}>
          <div className={styles.deck} style={{ width: 92, height: 138 }}>
            <span
              className={styles.deckBack}
              style={{ transform: 'translate(6px, 6px) rotate(4deg)' }}
              aria-hidden="true"
            />
            <span
              className={styles.deckBack}
              style={{ transform: 'translate(3px, 3px) rotate(2deg)' }}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => drawEnabled && onDraw()}
              disabled={!drawEnabled}
              aria-label="Draw a card"
              className={styles.drawButton}
            >
              Draw
              {snapshot.pendingDraw > 0 ? (
                <span className={styles.drawPlus}>+{snapshot.pendingDraw}</span>
              ) : null}
            </button>
          </div>

          <div className={styles.discard} style={{ width: 92, height: 138 }}>
            <span
              className={styles.discardUnder}
              style={{ transform: 'translate(-5px, 5px) rotate(-5deg)' }}
              aria-hidden="true"
            />
            <span
              className={styles.discardUnder}
              style={{ transform: 'translate(4px, 3px) rotate(4deg)' }}
              aria-hidden="true"
            />
            <Card card={snapshot.topCard} size="lg" disabled />
          </div>
        </div>

        {/* My hand — fanned, with hover-lift on each card */}
        <div className={styles.hand}>
          {myHand.map((c, i) => {
            const center = (handCount - 1) / 2;
            const offset = i - center;
            const step = Math.min(6, 46 / Math.max(handCount, 1));
            return (
              <div
                key={c.id}
                className={styles.handSlot}
                style={
                  {
                    '--rot': `${offset * step}deg`,
                    '--lift': `${Math.abs(offset) * 3}px`,
                  } as React.CSSProperties
                }
              >
                <Card
                  card={c}
                  playable={playableIds.has(c.id)}
                  disabled={!myTurn || disabled || !playableIds.has(c.id)}
                  onClick={() => handleCardClick(c)}
                />
              </div>
            );
          })}
        </div>
      </YStack>

      <ColorPicker open={!!pendingWildCard} onPick={handlePickColor} />
    </YStack>
  );
}

function shortName(id: string): string {
  return id.startsWith('bot-') ? 'Bot' : id.slice(0, 6);
}

/** Deterministic theme color for an opponent's avatar disc, from their id. */
function avatarColor(id: string): 'R' | 'Y' | 'G' | 'B' {
  const palette = ['R', 'Y', 'G', 'B'] as const;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1)
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
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
