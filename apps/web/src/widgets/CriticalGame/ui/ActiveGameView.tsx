'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMedia, YStack } from 'tamagui';
import { useGameChatIntegration } from '@/features/games/hooks';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import type {
  CriticalCard,
  CriticalPlayerState,
  GameRoomSummary,
  CriticalSnapshot,
} from '../types';
import { getCardTranslationKey } from '../lib/cardUtils';
import { useDisplayNames } from '../lib/displayUtils';
import {
  useCriticalModals,
  useWebGameHaptics,
  useSeeTheFutureFromLogs,
  useOmniscienceFromLogs,
  useGameAutoplayIntegration,
} from '../hooks';
import { useGameHandlers } from '../hooks/useGameHandlers';
import { GameStatusMessage } from './GameStatusMessage';
import { GameResultModal } from '@/features/games/ui/GameResultModal';
import { GameWidgetContainer } from '@/features/games/ui';
import { MatchWidget } from './MatchWidget';
import { ActiveGameModals } from './ActiveGameModals';
import { getVariantStyles } from './styles/variants';
import { CRITICAL_VARIANTS } from '../lib/constants';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { SceneBackdrop } from './SceneBackdrop';
import type { GameVariant } from '@arcadeum/ui';
import type { UseGameActionsReturn } from '@/features/games/hooks/useGameActions';
import type { RematchInvitation } from '../hooks/useRematch';

interface ActiveGameViewProps {
  currentUserId: string | null;
  room: GameRoomSummary;
  snapshot: CriticalSnapshot;
  isHost: boolean;
  // From useCriticalState
  actions: UseGameActionsReturn;
  currentPlayer: CriticalPlayerState | null;
  isMyTurn: boolean;
  canAct: boolean;
  canPlayNope: boolean;
  aliveOpponents: CriticalPlayerState[];
  isGameOver: boolean;
  // Rules modal state from parent
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
  // Rematch props
  rematch: {
    rematchLoading: boolean;
    showRematchModal: boolean;
    openRematchModal: () => void;
    closeRematchModal: () => void;
    handleRematch: (
      participantIds: string[],
      message?: string,
    ) => Promise<void>;
    invitation: RematchInvitation | null;
    invitationTimeLeft: number;
    handleAcceptInvitation: () => void;
    handleDeclineInvitation: () => void;
    isAcceptingInvitation: boolean;
    handleReinvite: (userIds: string[]) => void;
    handleBlockRematch: (roomId: string) => void;
    handleBlockUser: (userId: string) => void;
  };
}

export function ActiveGameView({
  currentUserId,
  room,
  snapshot,
  isHost,
  actions,
  currentPlayer,
  isMyTurn,
  canAct,
  canPlayNope,
  aliveOpponents,
  isGameOver,
  rematch,
}: ActiveGameViewProps) {
  const { t } = useTranslation();
  const media = useMedia();
  const isMobile = media.sm;
  const cardVariant = room.gameOptions?.cardVariant;
  const scenePalette = useMemo(
    () => getVariantStyles(cardVariant).scene,
    [cardVariant],
  );

  // Shared-header metadata. Title is "Critical · {variant}"; the on-clock
  // player drives the turn pill (avatar + name) for free.
  const variantMeta = useMemo(
    () => CRITICAL_VARIANTS.find((v) => v.id === cardVariant),
    [cardVariant],
  );
  const headerTitle = variantMeta
    ? `${t('games.critical_v1.name')} · ${t(variantMeta.name as TranslationKey)}`
    : t('games.critical_v1.name');
  const turnPlayerId =
    snapshot.playerOrder[snapshot.currentTurnIndex] ?? null;

  // Sync modal dismissal state with game over state
  const [modalDismissed, setModalDismissed] = useState(false);

  // Reset modal dismissal when game over state changes (e.g. new game starts or current game ends)
  const [prevIsGameOver, setPrevIsGameOver] = useState(isGameOver);

  // Reset modal dismissal when game over state changes (e.g. new game starts or current game ends)
  if (isGameOver !== prevIsGameOver) {
    setPrevIsGameOver(isGameOver);
    setModalDismissed(false);
  }

  const showResultModal = isGameOver && !modalDismissed;
  useWebGameHaptics(isMyTurn);

  const {
    eventComboModal,
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedDiscardCard,
    selectedFiverCards,
    setSelectedMode,
    setSelectedTarget,
    setSelectedCard,
    setSelectedIndex,
    setSelectedDiscardCard,
    handleOpenEventCombo,
    handleCloseEventComboModal,
    handleSelectComboCard,
    handleToggleFiverCard,
    handleCloseFavorModal,
    handleConfirmFavor,
    targetedAttackModal,
    setTargetedAttackModal,
    seeTheFutureModal,
    setSeeTheFutureModal,
    handleCloseSeeTheFutureModal,
    stashModal,
    handleCloseStashModal,
    markModal,
    handleCloseMarkModal,
    stealDrawModal,
    handleCloseStealDrawModal,
    smiteModal,
    handleCloseSmiteModal,
    omniscienceModal,
    setOmniscienceModal,
    handleCloseOmniscienceModal,
    handleConfirmEventCombo,
    favorModal,
  } = useCriticalModals({
    playFavor: actions.playFavor,
    playEventCombo: actions.playEventCombo,
  });

  // Monitor logs for seeTheFuture.reveal and omniscience.reveal entries
  useSeeTheFutureFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setSeeTheFutureModal,
  });
  useOmniscienceFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setOmniscienceModal,
  });

  const youLabel = t('games.table.players.you');
  const seeTheFutureLabel = t('games.table.cards.insight');
  const translateCardType = useCallback(
    (cardType: CriticalCard) => t(getCardTranslationKey(cardType, cardVariant)),
    [t, cardVariant],
  );
  const { resolveDisplayName, formatLogMessage } = useDisplayNames({
    currentUserId,
    room,
    snapshot,
    youLabel,
    translateCardType,
    seeTheFutureLabel,
  });

  useGameChatIntegration(
    snapshot?.logs,
    actions.postHistoryNote,
    resolveDisplayName,
  );

  const gameHandlers = useGameHandlers({
    selectedMode,
    selectedTarget,
    selectedCard,
    selectedIndex,
    selectedFiverCards,
    selectedDiscardCard,
    eventComboModal,
    currentPlayerHand: currentPlayer?.hand ?? [],
    discardPile: snapshot?.discardPile ?? [],
    actions,
    handleCloseEventComboModal,
    handleOpenEventCombo,
    setSelectedMode,
    setSelectedTarget,
    setStashModal: () => {}, // Handled by useCriticalModals
    setMarkModal: () => {},
    setStealDrawModal: () => {},
    setSmiteModal: () => {},
    setTargetedAttackModal,
  });

  const {
    handleOpenFiverCombo,
    handleConfirmStash,
    handleConfirmMark,
    handleConfirmStealDraw,
    handlePlayActionCard,
    handleCloseTargetedAttackModal,
    handleConfirmTargetedAttack,
    handleConfirmAlterFuture,
    handleConfirmSmite,
  } = gameHandlers;

  // Autoplay hook integration
  const {
    autoplayState,
    idleTimerTriggered,
    handleStopAutoplay,
    idleTimerEnabled,
    handleIdleTimeout,
  } = useGameAutoplayIntegration({
    room,
    isMyTurn: !!isMyTurn,
    canAct: !!canAct,
    canPlayNope: !!canPlayNope,
    currentPlayer,
    snapshot,
    currentUserId,
    actions,
    handlePlayActionCard,
  });

  return (
    <ScenePaletteProvider palette={scenePalette}>
      <GameWidgetContainer
        variant={cardVariant as GameVariant}
        isMyTurn={isMyTurn}
        isGameOver={isGameOver}
        headerProps={{
          variantEmoji: variantMeta?.emoji ?? '🎴',
          title: headerTitle,
          subtitle: room.name,
          turn: { onClockUserId: turnPlayerId, isMyTurn, isGameOver },
        }}
        board={
          <>
            <SceneBackdrop />
            <YStack flex={1} className="animate-entrance">
              <MatchWidget
          room={room}
          snapshot={snapshot}
          currentUserId={currentUserId}
          currentPlayer={currentPlayer}
          cardVariant={cardVariant}
          isGameOver={!!isGameOver}
          isMyTurn={!!isMyTurn}
          canAct={!!canAct}
          canPlayNope={canPlayNope}
          resolveDisplayName={resolveDisplayName}
          t={
            t as unknown as (
              k: string,
              p?: Record<string, string | number>,
            ) => string
          }
          actions={actions}
          handlePlayActionCard={handlePlayActionCard}
          handleOpenEventCombo={handleOpenEventCombo}
          handleOpenFiverCombo={handleOpenFiverCombo}
          formatLogMessage={formatLogMessage}
          autoplayState={autoplayState}
          idleTimerEnabled={idleTimerEnabled}
          idleTimerTriggered={idleTimerTriggered}
          handleIdleTimeout={handleIdleTimeout}
          handleStopAutoplay={handleStopAutoplay}
              />
            </YStack>
            {currentPlayer && (
              <GameStatusMessage
                currentPlayerAlive={currentPlayer.alive}
                isGameOver={!!isGameOver}
                t={t as (key: string) => string}
              />
            )}
          </>
        }
        modals={
          <>
            <ActiveGameModals
        currentUserId={currentUserId}
        snapshot={snapshot}
        isMobile={isMobile}
        cardVariant={cardVariant}
        aliveOpponents={aliveOpponents}
        currentPlayer={currentPlayer}
        actions={actions}
        rematch={rematch}
        modals={{
          eventComboModal,
          selectedMode,
          selectedTarget,
          selectedCard,
          selectedIndex,
          selectedDiscardCard,
          selectedFiverCards,
          seeTheFutureModal,
          stashModal,
          markModal,
          stealDrawModal,
          smiteModal,
          omniscienceModal,
          targetedAttackModal,
          favorModal,
        }}
        handlers={{
          handleCloseEventComboModal,
          handleSelectComboCard,
          setSelectedMode,
          setSelectedTarget,
          setSelectedCard,
          setSelectedIndex,
          setSelectedDiscardCard,
          handleToggleFiverCard,
          handleConfirmEventCombo,
          handleCloseSeeTheFutureModal,
          handleConfirmAlterFuture,
          handleCloseTargetedAttackModal,
          handleConfirmTargetedAttack,
          handleCloseFavorModal,
          handleConfirmFavor,
          handleCloseStashModal,
          handleConfirmStash,
          handleCloseMarkModal,
          handleConfirmMark,
          handleCloseStealDrawModal,
          handleConfirmStealDraw,
          handleCloseSmiteModal,
          handleConfirmSmite,
          handleCloseOmniscienceModal,
        }}
        resolveDisplayName={resolveDisplayName}
      />
      <GameResultModal
        isOpen={!!showResultModal}
        data-testid="game-result-modal"
        result={
          snapshot.players.find((p) => p.alive)?.playerId === currentUserId
            ? 'victory'
            : 'defeat'
        }
        onRematch={isHost ? rematch.openRematchModal : undefined}
        onClose={() => setModalDismissed(true)}
        rematchLoading={rematch.rematchLoading}
        t={t}
      />
          </>
        }
      />
    </ScenePaletteProvider>
  );
}
