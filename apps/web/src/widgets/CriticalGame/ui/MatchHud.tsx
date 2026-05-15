'use client';

import { XStack } from 'tamagui';
import { HudStyles } from './hudStyles';
import { ThreatStrip } from './ThreatStrip';
import { ComboHints } from './ComboHints';
import { FlashBanner } from './FlashBanner';
import type {
  CriticalLogEntry,
  CriticalPlayerState,
  CriticalSnapshot,
} from '../types';

interface MatchHudProps {
  snapshot: CriticalSnapshot;
  currentPlayer: CriticalPlayerState | null;
  isGameOver: boolean;
  formatLogMessage: (message?: string | null) => string;
}

export function MatchHud({
  snapshot,
  currentPlayer,
  isGameOver,
  formatLogMessage,
}: MatchHudProps) {
  const showStrip = !!currentPlayer?.alive && !isGameOver;
  const logs: CriticalLogEntry[] = snapshot.logs ?? [];

  return (
    <>
      <HudStyles />
      {showStrip && currentPlayer && (
        <XStack
          justifyContent="center"
          alignItems="center"
          gap="$2"
          flexWrap="wrap"
          paddingHorizontal="$2"
          paddingTop="$1"
        >
          <ThreatStrip hand={currentPlayer.hand} deck={snapshot.deck ?? []} />
          <ComboHints
            hand={currentPlayer.hand}
            allowActionCardCombos={snapshot.allowActionCardCombos ?? false}
          />
        </XStack>
      )}
      {/* FlashBanner owns its own centered wrapper and returns null when */}
      {/* there's nothing to flash — no empty band on game-over. */}
      <FlashBanner logs={logs} formatMessage={formatLogMessage} />
    </>
  );
}
