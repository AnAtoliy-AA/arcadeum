'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMedia, YStack, XStack } from 'tamagui';
import { useGameChatIntegration } from '@/features/games/hooks';
import { useTranslation } from '@/shared/lib/useTranslation';
import type {
  CriticalCard,
  HandLayoutMode,
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
import { ActiveGameContent } from './ActiveGameContent';
import { MatchWidget } from './MatchWidget';
import { CriticalGameHeader } from './CriticalGameHeader';
import { ActiveGameModals } from './ActiveGameModals';
import { getVariantStyles } from './styles/variants';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { SceneBackdrop } from './SceneBackdrop';
import { TurnBanner } from './TurnBanner';
import { MatchHud } from './MatchHud';
import { useWidgetMode } from '../hooks/useWidgetMode';
import type { UseGameActionsReturn } from '@/features/games/hooks/useGameActions';
import type { RematchInvitation } from '../hooks/useRematch';

interface ActiveGameViewProps {
  currentUserId: string | null;
  room: GameRoomSummary;
  snapshot: CriticalSnapshot;
  isHost: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  // From useCriticalState
  actionBusy: string | null;
  actions: UseGameActionsReturn;
  currentPlayer: CriticalPlayerState | null;
  currentTurnPlayer: CriticalPlayerState | undefined;
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
  isFullscreen,
  toggleFullscreen,
  actionBusy,
  actions,
  currentPlayer,
  currentTurnPlayer,
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
  const widgetMode = useWidgetMode();
  // Layout State
  const [handLayout, setHandLayout] = useState<HandLayoutMode>('grid');
  const cardVariant = room.gameOptions?.cardVariant;
  const scenePalette = useMemo(
    () => getVariantStyles(cardVariant).scene,
    [cardVariant],
  );

  // Sync modal dismissal state with game over state
  const [modalDismissed, setModalDismissed] = useState(false);
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
    handleOpenFavorModal,
    handleCloseFavorModal,
    handleConfirmFavor,
    targetedAttackModal,
    setTargetedAttackModal,
    seeTheFutureModal,
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
    handleCloseOmniscienceModal,
  } = useCriticalModals({
    playFavor: actions.playFavor,
  });

  // Monitor logs for seeTheFuture.reveal and omniscience.reveal entries
  useSeeTheFutureFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setSeeTheFutureModal: (_val: unknown) => {
      // Compatibility if needed, but useCriticalModals should handle it
    },
  });
  useOmniscienceFromLogs({
    logs: snapshot?.logs,
    currentUserId,
    setOmniscienceModal: (_val: unknown) => {
      // Compatibility
    },
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
  // (No registered actor-color resolver in Critical — GameChat falls back
  // to the shared getPlayerColor(id), which is exactly what we want for FFA.)

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
    handleConfirmEventCombo,
    handleOpenFiverCombo,
    handleConfirmStash,
    handleConfirmMark,
    handleConfirmStealDraw,
    handleUnstash,
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

  const buildSharedProps = () => ({
    room,
    snapshot,
    currentUserId,
    currentPlayer,
    cardVariant,
    isGameOver: !!isGameOver,
    isMyTurn: !!isMyTurn,
    canAct: !!canAct,
    canPlayNope,
    actionBusy,
    aliveOpponents,
    handLayout,
    setHandLayout,
    resolveDisplayName,
    t: t as unknown as (
      k: string,
      p?: Record<string, string | number>,
    ) => string,
    actions,
    idleTimerTriggered,
    autoplayState,
    handleUnstash,
    handlePlayActionCard,
    handleOpenFavorModal,
    handleOpenEventCombo,
    handleOpenFiverCombo,
  });

  return (
    <ScenePaletteProvider palette={scenePalette}>
      <SceneBackdrop />
      <YStack flex={1} className="animate-entrance">
        {/* Flag-off: legacy header sits above the match. Widget mode hoists */}
        {/* Rules / Fullscreen into a small menu inside HandRail (ARC-636). */}
        {!widgetMode && (
          <CriticalGameHeader
            room={room}
            t={
              t as unknown as (
                key: string,
                params?: Record<string, string | number>,
              ) => string
            }
            idleTimerEnabled={idleTimerEnabled}
            actionBusy={actionBusy}
            isGameOver={!!isGameOver}
            currentPlayer={currentPlayer ?? undefined}
            canAct={!!canAct}
            isMyTurn={!!isMyTurn}
            handleIdleTimeout={handleIdleTimeout}
            autoplayState={autoplayState}
            idleTimerTriggered={idleTimerTriggered}
            handleStopAutoplay={handleStopAutoplay}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        )}
        {/* Flag-off: legacy top-of-page TurnBanner + MatchHud. In widget */}
        {/* mode these move inside the Arena's center column (ARC-633). */}
        {!widgetMode && (
          <>
            <XStack justifyContent="center">
              <TurnBanner
                isMyTurn={!!isMyTurn}
                currentPlayerName={
                  currentTurnPlayer
                    ? resolveDisplayName(currentTurnPlayer.playerId, 'Player')
                    : ''
                }
                secondsRemaining={null}
                pendingDraws={snapshot.pendingDraws}
              />
            </XStack>
            <MatchHud
              snapshot={snapshot}
              currentPlayer={currentPlayer}
              isGameOver={!!isGameOver}
              formatLogMessage={formatLogMessage}
            />
          </>
        )}

        {widgetMode ? (
          <MatchWidget
            {...buildSharedProps()}
            formatLogMessage={formatLogMessage}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        ) : (
          <ActiveGameContent {...buildSharedProps()} />
        )}
      </YStack>
      {currentPlayer && (
        <GameStatusMessage
          currentPlayerAlive={currentPlayer.alive}
          isGameOver={!!isGameOver}
          t={t as (key: string) => string}
        />
      )}{' '}
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
    </ScenePaletteProvider>
  );
}
