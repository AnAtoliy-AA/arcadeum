'use client';

import { useCallback, useMemo, useState } from 'react';
import { useGameChatIntegration } from '@/features/games/hooks';
import { usePostGameAnalytics } from '@/features/games/hooks/usePostGameAnalytics';
import { PostGameAnalytics } from '@/features/games/ui/PostGameAnalytics';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useRecordGameResult } from '@/features/stats/hooks/useRecordGameResult';
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
import { GameEndModals, GameWidgetContainer } from '@/features/games/ui';
import { MatchWidget } from './MatchWidget';
import { ActiveGameModals } from './ActiveGameModals';
import { getVariantStyles } from './styles/variants';
import { CRITICAL_VARIANTS } from '../lib/constants';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { SceneBackdrop } from './SceneBackdrop';
import type { GameVariant } from '@arcadeum/ui';
import type { UseGameActionsReturn } from '@/features/games/hooks/useGameActions';
import type { RematchInvitation } from '@/features/games/hooks/useRematch';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

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
  onOpenRules: () => void;
  // Rematch props
  rematch: {
    rematchLoading: boolean;
    rematchError: string | null;
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
  onOpenRules,
}: ActiveGameViewProps) {
  const { t } = useTranslation();
  const media = useMediaQuery();
  const isMobile = media.sm;
  const cardVariant =
    (room.gameOptions?.theme as string) ||
    (room.gameOptions?.cardVariant as string) ||
    (room.gameOptions?.variant as string) ||
    'adventure';
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
  const turnPlayerId = snapshot.playerOrder[snapshot.currentTurnIndex] ?? null;

  // Sync modal dismissal state with game over state
  const [modalDismissed, setModalDismissed] = useState(false);

  const [wasAlreadyOverOnMount] = useState(() => isGameOver === true);
  const [hasSeenActiveGame, setHasSeenActiveGame] = useState(false);

  if (!wasAlreadyOverOnMount && isGameOver && !hasSeenActiveGame) {
    setHasSeenActiveGame(true);
  }

  // Reset modal dismissal when game over state changes (e.g. new game starts or current game ends)
  const [prevIsGameOver, setPrevIsGameOver] = useState(isGameOver);

  // Reset modal dismissal when game over state changes (e.g. new game starts or current game ends)
  if (isGameOver !== prevIsGameOver) {
    setPrevIsGameOver(isGameOver);
    setModalDismissed(false);
  }

  const showResultModal = isGameOver && !modalDismissed && hasSeenActiveGame;
  useWebGameHaptics(isMyTurn);

  // Record game result to local stats
  const criticalResult = useMemo(() => {
    if (!isGameOver || !currentUserId) return null;
    const alivePlayer = snapshot.players.find((p) => p.alive)?.playerId;
    if (!alivePlayer) return 'draw' as const;
    return alivePlayer === currentUserId ? ('won' as const) : ('lost' as const);
  }, [isGameOver, currentUserId, snapshot.players]);
  useRecordGameResult(criticalResult, 'critical_v1');

  const opponentId = useMemo(() => {
    if (!snapshot.players || !currentUserId) return null;
    return (
      snapshot.players.find((p) => p.playerId !== currentUserId && p.alive)
        ?.playerId ?? null
    );
  }, [snapshot.players, currentUserId]);

  const analytics = usePostGameAnalytics({
    gameId: 'critical_v1',
    session: snapshot as unknown as Record<string, unknown> | undefined,
    currentUserId,
    opponentId,
  });

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
        containerBackground={scenePalette.handBackground}
        // Critical shows incoming chat as per-opponent bubbles over each tile,
        // so it opts out of the shared corner popup to avoid double display.
        showChatPopup={false}
        headerProps={{
          variantEmoji: variantMeta?.emoji ?? '🎴',
          title: headerTitle,
          subtitle: room.name,
          turn: { onClockUserId: turnPlayerId, isMyTurn, isGameOver },
        }}
        board={
          <>
            <SceneBackdrop />
            <div className="flex flex-col items-stretch flex-1 animate-entrance">
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
                onOpenRules={onOpenRules}
              />
            </div>
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
            <GameEndModals
              gameEnd={{
                showResultModal: !!showResultModal,
                sharedResult:
                  snapshot.players.find((p) => p.alive)?.playerId ===
                  currentUserId
                    ? 'victory'
                    : 'defeat',
                dismissResult: () => setModalDismissed(true),
                openResult: () => setModalDismissed(false),
                toggleResult: () => setModalDismissed((d) => !d),
                rematchLoading: rematch.rematchLoading,
                rematchError: rematch.rematchError ?? null,
                showRematchModal: rematch.showRematchModal,
                openRematchModal: rematch.openRematchModal,
                closeRematchModal: rematch.closeRematchModal,
                handleResultRematchClick: isHost
                  ? rematch.openRematchModal
                  : () => {},
                handleRematch: rematch.handleRematch,
                invitation: rematch.invitation,
                invitationTimeLeft: rematch.invitationTimeLeft,
                handleAcceptInvitation: rematch.handleAcceptInvitation,
                handleDeclineInvitation: rematch.handleDeclineInvitation,
                isAcceptingInvitation: rematch.isAcceptingInvitation,
                handleReinvite: rematch.handleReinvite,
                handleBlockRematch: rematch.handleBlockRematch,
                handleBlockUser: rematch.handleBlockUser,
                resultMessages: undefined,
                ratingDelta: null,
              }}
              players={snapshot.players.map((p) => ({
                playerId: p.playerId,
                displayName: resolveDisplayName(p.playerId),
                alive: p.alive,
              }))}
              currentUserId={currentUserId}
              gameName={(() => {
                const raw = t('games.names.critical' as TranslationKey);
                return raw && raw !== 'games.names.critical'
                  ? raw
                  : 'Exploding Cats';
              })()}
              cardVariant={cardVariant}
              theme={cardVariant}
              t={t}
              stats={analytics.stats}
              analysis={{
                content: (
                  <PostGameAnalytics
                    moveTimeline={analytics.moveTimeline}
                    headToHead={analytics.headToHead}
                    headToHeadLoading={analytics.headToHeadLoading}
                    trends={analytics.trends}
                    trendsLoading={analytics.trendsLoading}
                    onLoadHeadToHead={analytics.loadHeadToHead}
                    onLoadTrends={analytics.loadTrends}
                    currentUserId={currentUserId}
                    opponentId={opponentId}
                    t={t}
                  />
                ),
                viewLabel: t('games.table.analytics.view' as TranslationKey),
                backLabel: t('games.table.analytics.back' as TranslationKey),
              }}
            />
          </>
        }
      />
    </ScenePaletteProvider>
  );
}
