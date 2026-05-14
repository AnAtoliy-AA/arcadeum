'use client';

import { YStack } from 'tamagui';
import { TurnBanner } from '../TurnBanner';
import { ThreatStrip } from '../ThreatStrip';
import { FlashBanner } from '../FlashBanner';
import { FlashHistory } from '../FlashHistory';
import { HudStyles } from '../hudStyles';
import { ComboCard, type ComboKind } from './ComboCard';
import type { CriticalCard, CriticalLogEntry } from '../../types';

interface ArenaCenterProps {
  // Turn banner
  isMyTurn: boolean;
  currentPlayerName: string;
  pendingDraws: number;
  // Combo card
  hand: CriticalCard[];
  allowActionCardCombos: boolean;
  combo?: { kind: ComboKind; label: string };
  // Threat strip
  deck: CriticalCard[];
  /** Server-authoritative overload odds; forwarded to ThreatStrip. */
  serverOverloadOdds?: number | null;
  /** Cards the snapshot has hidden — folded into client-fallback odds. */
  hiddenCount?: number;
  // Flash banner
  logs: CriticalLogEntry[];
  formatLogMessage: (message?: string | null) => string;
  /**
   * Phones: drop `minHeight` so the centre column doesn't burn 180px
   * of vertical real estate when content is just a turn pill. Passed
   * from `Arena` so the layout decision lives in one place.
   */
  isNarrow?: boolean;
}

/**
 * Center column of the Arena. Stacks the turn pill, combo intent card, and
 * threat strip vertically; the flash banner is absolutely positioned at the
 * top so it overlays without pushing the stack down.
 *
 * Selection-aware combo intent (the `combo` prop) lands when HandZone
 * lifts `selectedUids` in ARC-635. ARC-633 ships the shell.
 */
export function ArenaCenter({
  isMyTurn,
  currentPlayerName,
  pendingDraws,
  hand,
  allowActionCardCombos,
  combo,
  deck,
  serverOverloadOdds,
  hiddenCount,
  logs,
  formatLogMessage,
  isNarrow = false,
}: ArenaCenterProps) {
  return (
    <YStack
      data-testid="arena-center"
      flex={1}
      minHeight={isNarrow ? 0 : 180}
      alignItems="center"
      justifyContent="center"
      gap="$2"
      position="relative"
    >
      <HudStyles />
      <YStack
        data-testid="arena-flash-slot"
        position="absolute"
        top={8}
        left={0}
        right={0}
        alignItems="center"
        pointerEvents="none"
        zIndex={5}
      >
        <FlashBanner logs={logs} formatMessage={formatLogMessage} />
      </YStack>
      <TurnBanner
        isMyTurn={isMyTurn}
        currentPlayerName={currentPlayerName}
        secondsRemaining={null}
        pendingDraws={pendingDraws}
      />
      <ComboCard
        hand={hand}
        allowActionCardCombos={allowActionCardCombos}
        combo={combo}
      />
      <ThreatStrip
        hand={hand}
        deck={deck}
        serverOverloadOdds={serverOverloadOdds}
        hiddenCount={hiddenCount}
      />
      {/* §4.7 — last-5 timeline strip beneath the threat strip. The
          single-shot FlashBanner clears in 1.6s; this surfaces a
          short history so players who were watching their hand can
          still see what just happened. */}
      <FlashHistory logs={logs} formatMessage={formatLogMessage} />
    </YStack>
  );
}
