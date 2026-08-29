'use client';

import './../styles/hud.scss';

import { TurnBanner } from '../TurnBanner';
import { ThreatStrip } from '../ThreatStrip';
import { FlashBanner } from '../FlashBanner';
import { GameMoveHistory } from '@/features/games/ui/GameMoveHistory';
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
  onClearSelection?: () => void;
  // Threat strip
  deck: CriticalCard[];
  /** Server-authoritative overload odds; forwarded to ThreatStrip. */
  serverOverloadOdds?: number | null;
  /** Raw dangerous-card count; forwarded to ThreatStrip for `△ N left`. */
  criticalsRemaining?: number | null;
  /** Cards the snapshot has hidden — folded into client-fallback odds. */
  hiddenCount?: number;
  // Flash banner
  logs: CriticalLogEntry[];
  formatLogMessage: (message?: string | null) => string;
  /**
   * Resolves a log entry's `senderId` to its display name for the
   * `GameMoveHistory` actor column. Passes through from `MatchWidget`.
   */
  resolveDisplayName?: (playerId: string, fallback: string) => string;
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
  onClearSelection,
  deck,
  serverOverloadOdds,
  criticalsRemaining,
  hiddenCount,
  logs,
  formatLogMessage,
  resolveDisplayName,
}: ArenaCenterProps) {
  return (
    <div
      className="flex flex-col flex-1 items-center justify-center gap-2 relative"
      data-testid="arena-center"
    >
      <div
        className="flex flex-col absolute top-[8px] left-0 right-0 items-center pointer-events-none z-[500]"
        data-testid="arena-flash-slot"
      >
        <FlashBanner logs={logs} formatMessage={formatLogMessage} />
      </div>
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
        onClearSelection={onClearSelection}
      />
      <ThreatStrip
        hand={hand}
        deck={deck}
        serverOverloadOdds={serverOverloadOdds}
        criticalsRemaining={criticalsRemaining}
        hiddenCount={hiddenCount}
      />
      {/* §4.7 — last-5 timeline strip beneath the threat strip. The
          single-shot FlashBanner clears in 1.6s; this surfaces a
          short history so players who were watching their hand can
          still see what just happened. Each row carries the actor
          name so it's obvious who did what. */}
      <GameMoveHistory
        logs={logs}
        formatMessage={formatLogMessage}
        resolveDisplayName={resolveDisplayName}
      />
    </div>
  );
}
