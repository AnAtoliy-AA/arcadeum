'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { XStack, YStack } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Card } from './Card';
import { ColorPicker } from './ColorPicker';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import { useActionToasts } from '../hooks/useActionToasts';
import { useCardFly } from '../hooks/useCardFly';
import styles from './CascadeGame.module.css';
import type {
  ActiveColor,
  CascadeCard,
  CascadeCardStyle,
  CascadeClientState,
} from '../types';

interface CascadeBoardProps {
  snapshot: CascadeClientState;
  currentUserId: string | null;
  myHand: CascadeCard[];
  myTurn: boolean;
  disabled: boolean;
  cardStyle?: CascadeCardStyle;
  members?: Array<{ id: string; displayName: string }>;
  onPlayCard: (cardId: string, chosenColor?: ActiveColor) => void;
  onDraw: () => void;
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
  cardStyle = 'neon',
  members,
  onPlayCard,
  onDraw,
  onCallCascade,
}: CascadeBoardProps) {
  const theme = useCascadeTheme();
  const { t } = useTranslation();
  const [pendingWildCard, setPendingWildCard] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const discardRef = useRef<HTMLDivElement | null>(null);
  const { node: flyNode, launch: launchFly } = useCardFly();
  const toasts = useActionToasts(snapshot.topCard, theme.symbols);

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

  const flyToDiscard = useCallback(
    (cardId: string, card: CascadeCard) => {
      launchFly(card, slotRefs.current.get(cardId), discardRef.current);
    },
    [launchFly],
  );

  const handleCardClick = (card: CascadeCard) => {
    if (!myTurn || disabled) return;
    // Unplayable card on your turn: shake it instead of a dead click.
    if (!playableIds.has(card.id)) {
      setShakeId(card.id);
      window.setTimeout(() => setShakeId(null), 400);
      return;
    }
    if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') {
      setPendingWildCard(card.id);
      return;
    }
    flyToDiscard(card.id, card);
    onPlayCard(card.id);
  };

  const handlePickColor = (color: ActiveColor) => {
    if (!pendingWildCard) return;
    const wild = myHand.find((c) => c.id === pendingWildCard);
    if (wild) flyToDiscard(wild.id, wild);
    onPlayCard(pendingWildCard, color);
    setPendingWildCard(null);
  };

  const handCount = myHand.length;
  const drawEnabled = myTurn && !disabled;
  const mustDraw = drawEnabled && snapshot.pendingDraw > 0;
  const deckEmblem = theme.symbols.WILD;

  return (
    <YStack
      width="100%"
      gap="$3"
      padding="$0"
      paddingTop="$4"
      borderRadius="$4"
      className={`${styles.table} ${cardStyle === 'aurora' ? styles.aurora : ''}`}
      style={
        {
          background: theme.background,
          minHeight: 540,
          '--cascade-text': theme.cardText,
          '--cascade-surface': theme.surface,
          '--cascade-card-border': theme.cardBorder,
          '--cascade-card-text': theme.cardText,
          '--cascade-accent': theme.accent,
          '--cascade-accent-rgb': theme.accentRGB,
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
                {isActive && !disabled ? (
                  <span className={styles.podThink} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
                {opp.alive && opp.hand.length === 1 ? (
                  <span className={styles.podLast}>
                    {t('games.cascade_v1.board.last')}
                  </span>
                ) : null}
                <span
                  className={styles.podAvatar}
                  style={{
                    background: theme.palette[avatarColor(opp.playerId)],
                  }}
                  aria-hidden="true"
                >
                  {shortName(opp.playerId, members).charAt(0).toUpperCase()}
                </span>
                <span className={styles.podName}>
                  {shortName(opp.playerId, members)}
                </span>
                <span className={styles.podCount}>
                  {t('games.cascade_v1.board.cards', {
                    count: opp.hand.length,
                  })}
                </span>
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
                atRiskIsMe
                  ? t('games.cascade_v1.board.callCascadeSelf')
                  : t('games.cascade_v1.board.callCascade')
              }
            >
              {t('games.cascade_v1.board.callCascade')}
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
              aria-label={t('games.cascade_v1.board.draw')}
              className={`${styles.drawButton} ${mustDraw ? styles.drawMust : ''}`}
            >
              <span className={styles.drawEmblem} aria-hidden="true">
                {deckEmblem}
              </span>
              {snapshot.pendingDraw > 0 ? (
                <span className={styles.drawPlus}>+{snapshot.pendingDraw}</span>
              ) : null}
            </button>
            <span className={styles.pileLabel}>
              {t('games.cascade_v1.board.draw')}
            </span>
          </div>

          <div
            ref={discardRef}
            className={styles.discard}
            style={{ width: 92, height: 138 }}
          >
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
            <span className={styles.pileLabel}>
              {t('games.cascade_v1.board.discard')}
            </span>
          </div>
        </div>

        {/* My hand — fanned, with hover-lift on each card */}
        <div className={styles.hand}>
          {myHand.map((c, i) => {
            const center = (handCount - 1) / 2;
            const offset = i - center;
            const step = Math.min(6, 46 / Math.max(handCount, 1));
            const isPlayableCard = playableIds.has(c.id);
            return (
              <div
                key={c.id}
                ref={(el) => {
                  if (el) slotRefs.current.set(c.id, el);
                  else slotRefs.current.delete(c.id);
                }}
                className={`${styles.handSlot} ${
                  isPlayableCard ? styles.handSlotPlay : ''
                } ${shakeId === c.id ? styles.shake : ''}`}
                style={
                  {
                    '--rot': `${offset * step}deg`,
                    '--lift': `${Math.abs(offset) * 3}px`,
                  } as React.CSSProperties
                }
              >
                <Card
                  card={c}
                  playable={isPlayableCard}
                  disabled={!myTurn || disabled}
                  dimmed={myTurn && !disabled && !isPlayableCard}
                  onClick={() => handleCardClick(c)}
                />
              </div>
            );
          })}
        </div>
      </YStack>

      {toasts.length ? (
        <div className={styles.toasts} aria-hidden="true">
          {toasts.map((t) => (
            <div key={t.key} className={styles.toast}>
              {t.glyph ? (
                <span className={styles.toastGlyph}>{t.glyph}</span>
              ) : null}
              {t.label}
            </div>
          ))}
        </div>
      ) : null}

      <ColorPicker open={!!pendingWildCard} onPick={handlePickColor} />
      {flyNode}
    </YStack>
  );
}

function shortName(
  id: string,
  members?: Array<{ id: string; displayName: string }>,
): string {
  if (id.startsWith('bot-')) return 'Bot';
  const member = members?.find((m) => m.id === id);
  if (member?.displayName) return member.displayName;
  return id.slice(0, 6) + '…';
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
