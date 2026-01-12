import { CatComboModal } from './CatComboModal';
import { DefuseModal } from './DefuseModal';
import { GiveFavorModal } from './GiveFavorModal';
import { PlayerSelectionModal } from './PlayerSelectionModal';

import type {
  CriticalCard,
  CatComboPromptState,
  ProcessedPlayer,
} from '../types';
import type { CriticalTableStyles } from '../styles';

interface CriticalModalsProps {
  catComboPrompt: CatComboPromptState | null;
  aliveOpponents: ProcessedPlayer[];
  catComboBusy: boolean;
  comboConfirmDisabled: boolean;
  onCloseCatCombo: () => void;
  onModeChange: (mode: 'pair' | 'trio' | 'fiver') => void;
  onTargetChange: (target: string) => void;
  onDesiredCardChange: (card: CriticalCard) => void;
  onConfirmCatCombo: () => void;
  translateCardName: (card: CriticalCard) => string;
  styles: CriticalTableStyles;

  mustDefuse: boolean;
  actionBusy: string | null;
  deckCount: number;
  onConfirmDefuse: (position: number) => void;

  mustGiveFavor: boolean;
  favorRequesterName: string;
  myHand: CriticalCard[];
  onGiveFavorCard: (card: CriticalCard) => void;

  targetedActionPrompt: { card: CriticalCard } | null;
  otherPlayers: ProcessedPlayer[];
  onCloseTargetedAction: () => void;
  onConfirmTargetedAction: (targetId: string) => void;
}

export function CriticalModals({
  catComboPrompt,
  aliveOpponents,
  catComboBusy,
  comboConfirmDisabled,
  onCloseCatCombo,
  onModeChange,
  onTargetChange,
  onDesiredCardChange,
  onConfirmCatCombo,
  translateCardName,
  styles,
  mustDefuse,
  actionBusy,
  deckCount,
  onConfirmDefuse,
  mustGiveFavor,
  favorRequesterName,
  myHand,
  onGiveFavorCard,
  targetedActionPrompt,
  otherPlayers,
  onCloseTargetedAction,
  onConfirmTargetedAction,
}: CriticalModalsProps) {
  return (
    <>
      <CatComboModal
        catComboPrompt={catComboPrompt}
        aliveOpponents={aliveOpponents}
        catComboBusy={catComboBusy}
        comboConfirmDisabled={comboConfirmDisabled}
        onClose={onCloseCatCombo}
        onModeChange={onModeChange}
        onTargetChange={onTargetChange}
        onDesiredCardChange={onDesiredCardChange}
        onConfirm={onConfirmCatCombo}
        translateCardName={translateCardName}
        styles={styles}
      />
      <DefuseModal
        visible={mustDefuse && !actionBusy}
        deckSize={deckCount}
        onConfirm={onConfirmDefuse}
      />
      <GiveFavorModal
        visible={mustGiveFavor && !actionBusy}
        requesterName={favorRequesterName}
        myHand={myHand}
        onGiveCard={onGiveFavorCard}
      />
      <PlayerSelectionModal
        visible={!!targetedActionPrompt}
        card={targetedActionPrompt?.card ?? null}
        aliveOpponents={otherPlayers.filter((p) => p.alive)}
        busy={actionBusy === 'attack'}
        onClose={onCloseTargetedAction}
        onConfirm={onConfirmTargetedAction}
        translateCardName={translateCardName}
        styles={styles}
      />
    </>
  );
}
