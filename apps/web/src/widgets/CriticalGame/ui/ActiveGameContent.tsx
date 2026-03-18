'use client';

import { YStack } from '@arcadeum/ui';
import { GameBoard, TableArea } from './styles/layout';
import { GameTableSection } from './GameTableSection';
import { PlayerHand } from './PlayerHand';
import type {
  CriticalSnapshot,
  GameRoomSummary,
  CriticalPlayerState,
  CriticalCard,
  CriticalComboCard,
} from '../types';
import { HandLayoutMode } from '../types';
import type { UseGameActionsReturn } from '@/features/games/hooks/useGameActions';

interface ActiveGameContentProps {
  room: GameRoomSummary;
  snapshot: CriticalSnapshot;
  currentUserId: string | null;
  currentPlayer: CriticalPlayerState | null;
  cardVariant?: string;
  isGameOver: boolean;
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  actionBusy: string | null;
  aliveOpponents: CriticalPlayerState[];
  handLayout: HandLayoutMode;
  setHandLayout: (mode: HandLayoutMode) => void;
  resolveDisplayName: (
    playerId?: string,
    fallbackName?: string,
  ) => string | undefined;
  t: (key: string, params?: Record<string, string | number>) => string;
  actions: UseGameActionsReturn;
  idleTimerTriggered: boolean;
  autoplayState: {
    setAllEnabled: (enabled: boolean) => void;
  };
  handleUnstash: (card: CriticalCard) => void;
  handlePlayActionCard: (card: CriticalCard) => void;
  handleOpenFavorModal: () => void;
  handleOpenEventCombo: (
    cards: CriticalComboCard[],
    hand: CriticalCard[],
  ) => void;
  handleOpenFiverCombo: () => void;
}

export function ActiveGameContent({
  snapshot,
  currentUserId,
  currentPlayer,
  cardVariant,
  isGameOver,
  isMyTurn,
  canAct,
  canPlayNope,
  actionBusy,
  aliveOpponents,
  handLayout,
  setHandLayout,
  resolveDisplayName,
  t,
  actions,
  idleTimerTriggered,
  autoplayState,
  handleUnstash,
  handlePlayActionCard,
  handleOpenFavorModal,
  handleOpenEventCombo,
  handleOpenFiverCombo,
}: ActiveGameContentProps) {
  return (
    <GameBoard>
      <TableArea>
        <YStack flex={2} gap="$4">
          <GameTableSection
            players={snapshot.players}
            playerOrder={snapshot.playerOrder}
            currentTurnIndex={snapshot.currentTurnIndex}
            currentUserId={currentUserId}
            deck={snapshot.deck}
            discardPileLength={snapshot.discardPile.length}
            pendingDraws={snapshot.pendingDraws}
            discardPile={snapshot.discardPile}
            logs={snapshot.logs ?? []}
            resolveDisplayName={(id, fb) => resolveDisplayName(id, fb) ?? fb}
            t={t as (key: string) => string}
            cardVariant={cardVariant}
          />

          {currentPlayer && currentPlayer.alive && !isGameOver && (
            <PlayerHand
              currentPlayer={currentPlayer}
              onUnstashCard={handleUnstash}
              isMyTurn={isMyTurn}
              isGameOver={isGameOver}
              canAct={canAct}
              canPlayNope={canPlayNope}
              actionBusy={actionBusy}
              aliveOpponents={aliveOpponents}
              discardPileLength={snapshot?.discardPile?.length ?? 0}
              logs={snapshot?.logs ?? []}
              pendingAction={snapshot?.pendingAction ?? null}
              pendingFavor={snapshot?.pendingFavor ?? null}
              pendingDefuse={snapshot?.pendingDefuse ?? null}
              deckSize={snapshot?.deck?.length ?? 0}
              playerOrder={snapshot?.playerOrder ?? []}
              currentUserId={currentUserId}
              allowActionCardCombos={snapshot?.allowActionCardCombos ?? false}
              t={t as (key: string) => string}
              onDraw={actions.drawCard}
              onPlayActionCard={handlePlayActionCard}
              onPlayNope={actions.playNope}
              onPlaySeeTheFuture={actions.playSeeTheFuture}
              onOpenFavorModal={handleOpenFavorModal}
              onGiveFavorCard={actions.giveFavorCard}
              onPlayDefuse={actions.playDefuse}
              onOpenEventCombo={handleOpenEventCombo}
              onOpenFiverCombo={handleOpenFiverCombo}
              forceEnableAutoplay={idleTimerTriggered}
              onAutoplayEnabledChange={autoplayState.setAllEnabled}
              cardVariant={cardVariant}
              handLayout={handLayout}
              setHandLayout={setHandLayout}
            />
          )}
        </YStack>
      </TableArea>
    </GameBoard>
  );
}
