import { CatComboModal } from './modals/CatComboModal';
import { StashModal } from './modals/StashModal';
import { SeeTheFutureModal } from './modals/SeeTheFutureModal';
import { AlterTheFutureModal } from './modals/AlterTheFutureModal';
import { FavorModal } from './modals/FavorModal';
import { TargetedAttackModal } from './modals/TargetedAttackModal';
import { GiveFavorModal } from './modals/GiveFavorModal';
import { DefuseModal } from './modals/DefuseModal';
import { RematchModal } from './modals/RematchModal';
import { RematchInvitationModal } from './modals/RematchInvitationModal';
import type {
  CriticalCard,
  CatComboModalState,
  CriticalCatCard,
  CriticalPlayerState,
} from '../types';

type SeeTheFutureModalState = {
  cards: CriticalCard[];
} | null;

export interface GameModalsProps {
  // Rematch Modal
  showRematchModal: boolean;
  players: Array<{ playerId: string; displayName: string; alive: boolean }>;
  currentUserId: string | null;
  rematchLoading: boolean;
  onCloseRematchModal: () => void;
  onConfirmRematch: (
    participantIds: string[],
    message?: string,
  ) => Promise<void>;

  // Rematch Invitation
  invitation: {
    newRoomId: string;
    hostId: string;
    hostName: string;
    message?: string;
    timeout: number;
  } | null;
  invitationTimeLeft: number;
  onAcceptInvitation: () => void;
  onDeclineInvitation: () => void;
  onBlockRematch?: (roomId: string) => void;
  onBlockUser?: (userId: string) => void;
  isAcceptingInvitation: boolean;

  // Cat Combo Modal
  catComboModal: CatComboModalState | null;
  onCloseCatComboModal: () => void;
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: CriticalCard | null;
  selectedIndex: number | null;
  selectedDiscardCard: CriticalCard | null;
  selectedFiverCards: CriticalCard[];
  aliveOpponents: CriticalPlayerState[];
  selfHand: CriticalCard[];
  discardPile: CriticalCard[];
  onSelectCat: (card: CriticalCatCard) => void;
  onSelectMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
  onSelectTarget: (target: string | null) => void;
  onSelectCard: (card: CriticalCard | null) => void;
  onSelectIndex: (index: number | null) => void;
  onSelectDiscardCard: (card: CriticalCard | null) => void;
  onToggleFiverCard: (card: CriticalCard) => void;
  onConfirmCatCombo: () => void;

  // See the Future Modal
  seeTheFutureModal: SeeTheFutureModalState;
  onCloseSeeTheFutureModal: () => void;
  // Alter the Future
  pendingAlter: { playerId: string; count: number; isShare?: boolean } | null;
  onConfirmAlterFuture: (cards: CriticalCard[]) => void;

  // Targeted Attack Modal
  targetedAttackModal: boolean;
  onCloseTargetedAttackModal: () => void;
  onConfirmTargetedAttack: () => void;

  // Favor Modal
  favorModal: boolean;
  onCloseFavorModal: () => void;
  onConfirmFavor: () => void;

  // Defuse Modal
  pendingDefuse: string | null;
  onPlayDefuse: (position: number) => void;
  deck: CriticalCard[]; // Changed from deckSize to deck

  // Give Favor Modal
  pendingFavor: { targetId: string; requesterId: string } | null;
  myHand: CriticalCard[];
  onGiveFavorCard: (card: CriticalCard) => void;

  // Shared
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: string, params?: Record<string, unknown>) => string;
  cardVariant?: string;
  // Theft Pack Modals
  stashModal: boolean;
  onCloseStashModal: () => void;
  onConfirmStash: (cards: CriticalCard[]) => void;
  markModal: boolean;
  onCloseMarkModal: () => void;
  onConfirmMark: () => void;
  stealDrawModal: boolean;
  onCloseStealDrawModal: () => void;
  onConfirmStealDraw: () => void;
}

export function GameModals({
  // Rematch Modal
  showRematchModal,
  players,
  currentUserId,
  rematchLoading,
  onCloseRematchModal,
  onConfirmRematch,

  // Rematch Invitation
  invitation,
  invitationTimeLeft,
  onAcceptInvitation,
  onDeclineInvitation,
  onBlockRematch,
  onBlockUser,
  isAcceptingInvitation,

  // Cat Combo Modal
  catComboModal,
  onCloseCatComboModal,
  selectedMode,
  selectedTarget,
  selectedCard,
  selectedIndex,
  selectedDiscardCard,
  selectedFiverCards,
  aliveOpponents,
  selfHand,
  discardPile,
  onSelectCat,
  onSelectMode,
  onSelectCard,
  onSelectIndex,
  onSelectDiscardCard,
  onToggleFiverCard,
  onConfirmCatCombo,

  // See the Future Modal
  seeTheFutureModal,
  onCloseSeeTheFutureModal,
  // Alter the Future
  pendingAlter,
  onConfirmAlterFuture,
  // Targeted Attack Modal
  targetedAttackModal,
  onCloseTargetedAttackModal,
  onConfirmTargetedAttack,

  // Favor Modal
  favorModal,
  onCloseFavorModal,
  onConfirmFavor,

  // Defuse Modal
  pendingDefuse,
  onPlayDefuse,
  deck,

  // Give Favor Modal
  pendingFavor,
  myHand,
  onGiveFavorCard,

  // Shared
  resolveDisplayName,
  t,
  cardVariant,
  // Theft Pack
  stashModal,
  onCloseStashModal,
  onConfirmStash,
  markModal,
  onCloseMarkModal,
  onConfirmMark,
  stealDrawModal,
  onCloseStealDrawModal,
  onConfirmStealDraw,
  onSelectTarget,
}: GameModalsProps) {
  return (
    <>
      {/* Rematch Modal */}
      <RematchModal
        isOpen={showRematchModal}
        players={players}
        currentUserId={currentUserId}
        rematchLoading={rematchLoading}
        onClose={onCloseRematchModal}
        onConfirm={onConfirmRematch}
        t={t as (key: string) => string}
      />

      {/* Rematch Invitation Modal */}
      <RematchInvitationModal
        isOpen={!!invitation}
        hostId={invitation?.hostId}
        roomId={invitation?.newRoomId}
        hostName={invitation?.hostName || ''}
        message={invitation?.message}
        timeLeft={invitationTimeLeft}
        onAccept={onAcceptInvitation}
        onDecline={onDeclineInvitation}
        onBlockRematch={onBlockRematch}
        onBlockUser={onBlockUser}
        accepting={isAcceptingInvitation}
        t={t as (key: string) => string}
      />

      {/* Cat Combo Modal */}
      <CatComboModal
        isOpen={!!catComboModal}
        onClose={onCloseCatComboModal}
        catComboModal={catComboModal}
        selectedMode={selectedMode}
        selectedTarget={selectedTarget}
        selectedCard={selectedCard}
        selectedIndex={selectedIndex}
        selectedDiscardCard={selectedDiscardCard}
        selectedFiverCards={selectedFiverCards}
        aliveOpponents={aliveOpponents}
        selfHand={selfHand}
        discardPile={discardPile}
        onSelectCat={onSelectCat}
        onSelectMode={onSelectMode}
        onSelectTarget={onSelectTarget}
        onSelectCard={onSelectCard}
        onSelectIndex={onSelectIndex}
        onSelectDiscardCard={onSelectDiscardCard}
        onToggleFiverCard={onToggleFiverCard}
        onConfirm={onConfirmCatCombo}
        resolveDisplayName={resolveDisplayName}
        t={t}
        cardVariant={cardVariant}
      />

      {/* See the Future Modal */}
      <SeeTheFutureModal
        isOpen={!!seeTheFutureModal}
        onClose={onCloseSeeTheFutureModal}
        cards={seeTheFutureModal?.cards || []}
        t={t}
        cardVariant={cardVariant}
      />

      {/* Alter the Future Modal */}
      {!!currentUserId &&
        !!pendingAlter &&
        pendingAlter.playerId === currentUserId && (
          <AlterTheFutureModal
            isOpen={true}
            onClose={() => {}}
            cards={deck.slice(0, pendingAlter?.count || 0)}
            onConfirm={onConfirmAlterFuture}
            isShare={pendingAlter?.isShare}
            cardVariant={cardVariant}
          />
        )}

      {/* Targeted Attack Modal */}
      <TargetedAttackModal
        isOpen={targetedAttackModal}
        onClose={onCloseTargetedAttackModal}
        aliveOpponents={aliveOpponents}
        selectedTarget={selectedTarget}
        onSelectTarget={onSelectTarget}
        onConfirm={onConfirmTargetedAttack}
        resolveDisplayName={resolveDisplayName}
        t={t}
      />

      {/* Favor Modal */}
      <FavorModal
        isOpen={favorModal}
        onClose={onCloseFavorModal}
        aliveOpponents={aliveOpponents}
        selectedTarget={selectedTarget}
        onSelectTarget={onSelectTarget}
        onConfirm={onConfirmFavor}
        resolveDisplayName={resolveDisplayName}
        t={t}
      />

      {/* Defuse Modal - shows when player must defuse */}
      <DefuseModal
        isOpen={!!currentUserId && pendingDefuse === currentUserId}
        onDefuse={onPlayDefuse}
        deckSize={deck.length}
        t={t as (key: string) => string}
      />

      {/* Give Favor Modal - shows when someone requested a favor from current user */}
      <GiveFavorModal
        isOpen={
          !!currentUserId &&
          !!pendingFavor &&
          pendingFavor.targetId === currentUserId
        }
        requesterName={
          pendingFavor
            ? resolveDisplayName(pendingFavor.requesterId, 'Player')
            : 'Player'
        }
        myHand={myHand}
        onGiveCard={onGiveFavorCard}
        t={t}
        cardVariant={cardVariant}
      />

      {/* Stash Modal */}
      <StashModal
        isOpen={stashModal}
        onClose={onCloseStashModal}
        hand={selfHand}
        onConfirm={onConfirmStash}
        t={t}
        cardVariant={cardVariant}
      />

      {/* Mark Modal (Target Selection) */}
      <TargetedAttackModal
        isOpen={markModal}
        onClose={onCloseMarkModal}
        aliveOpponents={aliveOpponents}
        selectedTarget={selectedTarget}
        onSelectTarget={onSelectTarget}
        onConfirm={onConfirmMark}
        resolveDisplayName={resolveDisplayName}
        t={t}
        titleKey="games.table.modals.mark.title"
        descriptionKey="games.table.modals.mark.description"
        emoji="🏷️"
      />

      {/* Steal Draw Modal (Target Selection) */}
      <TargetedAttackModal
        isOpen={stealDrawModal}
        onClose={onCloseStealDrawModal}
        aliveOpponents={aliveOpponents}
        selectedTarget={selectedTarget}
        onSelectTarget={onSelectTarget}
        onConfirm={onConfirmStealDraw}
        resolveDisplayName={resolveDisplayName}
        t={t}
        titleKey="games.table.modals.stealDraw.title"
        descriptionKey="games.table.modals.stealDraw.description"
        emoji="🤏"
      />
    </>
  );
}
