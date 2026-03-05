import dynamic from 'next/dynamic';

const ComboModal = dynamic(
  () => import('./modals/ComboModal').then((m) => m.ComboModal),
  { ssr: false },
);
const StashModal = dynamic(
  () => import('./modals/StashModal').then((m) => m.StashModal),
  { ssr: false },
);
const SeeTheFutureModal = dynamic(
  () => import('./modals/SeeTheFutureModal').then((m) => m.SeeTheFutureModal),
  { ssr: false },
);
const AlterTheFutureModal = dynamic(
  () =>
    import('./modals/AlterTheFutureModal').then((m) => m.AlterTheFutureModal),
  { ssr: false },
);
const FavorModal = dynamic(
  () => import('./modals/FavorModal').then((m) => m.FavorModal),
  { ssr: false },
);
const TargetedAttackModal = dynamic(
  () =>
    import('./modals/TargetedAttackModal').then((m) => m.TargetedAttackModal),
  { ssr: false },
);
const GiveFavorModal = dynamic(
  () => import('./modals/GiveFavorModal').then((m) => m.GiveFavorModal),
  { ssr: false },
);
const DefuseModal = dynamic(
  () => import('./modals/DefuseModal').then((m) => m.DefuseModal),
  { ssr: false },
);
const RematchModal = dynamic(
  () => import('./modals/RematchModal').then((m) => m.RematchModal),
  { ssr: false },
);
const RematchInvitationModal = dynamic(
  () =>
    import('./modals/RematchInvitationModal').then(
      (m) => m.RematchInvitationModal,
    ),
  { ssr: false },
);
const OmniscienceModal = dynamic(
  () => import('./OmniscienceModal').then((m) => m.OmniscienceModal),
  { ssr: false },
);
import type {
  CriticalCard,
  EventComboModalState,
  CriticalComboCard,
  CriticalPlayerState,
  OmniscienceModalState,
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

  // Event Combo Modal
  eventComboModal: EventComboModalState | null;
  onCloseEventComboModal: () => void;
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: CriticalCard | null;
  selectedIndex: number | null;
  selectedDiscardCard: CriticalCard | null;
  selectedFiverCards: CriticalCard[];
  aliveOpponents: CriticalPlayerState[];
  selfHand: CriticalCard[];
  discardPile: CriticalCard[];
  onSelectComboCard: (card: CriticalComboCard) => void;
  onSelectMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
  onSelectTarget: (target: string | null) => void;
  onSelectCard: (card: CriticalCard | null) => void;
  onSelectIndex: (index: number | null) => void;
  onSelectDiscardCard: (card: CriticalCard | null) => void;
  onToggleFiverCard: (card: CriticalCard) => void;
  onConfirmEventCombo: () => void;

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
  smiteModal: boolean;
  onCloseSmiteModal: () => void;
  onConfirmSmite: () => void;
  omniscienceModal: OmniscienceModalState | null;
  onCloseOmniscienceModal: () => void;
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

  // Event Combo Modal
  eventComboModal,
  onCloseEventComboModal,
  selectedMode,
  selectedTarget,
  selectedCard,
  selectedIndex,
  selectedDiscardCard,
  selectedFiverCards,
  aliveOpponents,
  selfHand,
  discardPile,
  onSelectComboCard,
  onSelectMode,
  onSelectCard,
  onSelectIndex,
  onSelectDiscardCard,
  onToggleFiverCard,
  onConfirmEventCombo,

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
  smiteModal,
  onCloseSmiteModal,
  onConfirmSmite,
  onSelectTarget,
  omniscienceModal,
  onCloseOmniscienceModal,
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
        cardVariant={cardVariant}
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
        cardVariant={cardVariant}
      />

      {/* Event Combo Modal */}
      <ComboModal
        isOpen={!!eventComboModal}
        onClose={onCloseEventComboModal}
        comboModal={eventComboModal}
        selectedMode={selectedMode}
        selectedTarget={selectedTarget}
        selectedCard={selectedCard}
        selectedIndex={selectedIndex}
        selectedDiscardCard={selectedDiscardCard}
        selectedFiverCards={selectedFiverCards}
        aliveOpponents={aliveOpponents}
        selfHand={selfHand}
        discardPile={discardPile}
        onSelectComboCard={onSelectComboCard}
        onSelectMode={onSelectMode}
        onSelectTarget={onSelectTarget}
        onSelectCard={onSelectCard}
        onSelectIndex={onSelectIndex}
        onSelectDiscardCard={onSelectDiscardCard}
        onToggleFiverCard={onToggleFiverCard}
        onConfirm={onConfirmEventCombo}
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
        cardVariant={cardVariant}
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
        cardVariant={cardVariant}
      />

      {/* Defuse Modal - shows when player must defuse */}
      <DefuseModal
        isOpen={!!currentUserId && pendingDefuse === currentUserId}
        onDefuse={onPlayDefuse}
        deckSize={deck.length}
        t={t as (key: string) => string}
        cardVariant={cardVariant}
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
        cardVariant={cardVariant}
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
        cardVariant={cardVariant}
      />

      {/* Smite Modal (Target Selection) */}
      <TargetedAttackModal
        isOpen={smiteModal}
        onClose={onCloseSmiteModal}
        aliveOpponents={aliveOpponents}
        selectedTarget={selectedTarget}
        onSelectTarget={onSelectTarget}
        onConfirm={onConfirmSmite}
        resolveDisplayName={resolveDisplayName}
        t={t}
        titleKey="games.table.cards.smite"
        descriptionKey="games.table.cards.descriptions.smite"
        emoji="⚡"
        cardVariant={cardVariant}
      />

      {/* Omniscience Modal */}
      <OmniscienceModal
        omniscienceModal={omniscienceModal}
        onClose={onCloseOmniscienceModal}
        resolveDisplayName={resolveDisplayName}
        t={t}
        cardVariant={cardVariant}
      />
    </>
  );
}
