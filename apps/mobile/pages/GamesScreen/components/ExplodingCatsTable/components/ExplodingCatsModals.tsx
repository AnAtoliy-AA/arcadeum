import { CatComboModal } from './CatComboModal';
import { DefuseModal } from './DefuseModal';
import { GiveFavorModal } from './GiveFavorModal';
import { PlayerSelectionModal } from './PlayerSelectionModal';

import type {
  ExplodingCatsCard,
  CatComboPromptState,
  ProcessedPlayer,
} from '../types';
import type { ExplodingCatsTableStyles } from '../styles';

interface ExplodingCatsModalsProps {
  catComboPrompt: CatComboPromptState | null;
  aliveOpponents: ProcessedPlayer[];
  catComboBusy: boolean;
  comboConfirmDisabled: boolean;
  onCloseCatCombo: () => void;
  onModeChange: (mode: 'pair' | 'trio' | 'fiver') => void;
  onTargetChange: (target: string) => void;
  onDesiredCardChange: (card: ExplodingCatsCard) => void;
  onConfirmCatCombo: () => void;
  translateCardName: (card: ExplodingCatsCard) => string;
  styles: ExplodingCatsTableStyles;

  mustDefuse: boolean;
  actionBusy: string | null;
  deckCount: number;
  onConfirmDefuse: (position: number) => void;

  mustGiveFavor: boolean;
  favorRequesterName: string;
  myHand: ExplodingCatsCard[];
  onGiveFavorCard: (card: ExplodingCatsCard) => void;

  targetedActionPrompt: { card: ExplodingCatsCard } | null;
  otherPlayers: ProcessedPlayer[];
  onCloseTargetedAction: () => void;
  onConfirmTargetedAction: (targetId: string) => void;
}

export function ExplodingCatsModals({
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
}: ExplodingCatsModalsProps) {
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
