import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalSection,
  SectionLabel,
  OptionGrid,
  OptionButton,
  ModalActions,
  ModalButton,
} from '../styles';
import { getCardEmoji, getCardTranslationKey } from '../../lib/cardUtils';
import { CAT_CARDS } from '../../types';
import type {
  ExplodingCatsCard,
  ExplodingCatsCatCard,
  CatComboModalState,
} from '../../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface CatComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  catComboModal: CatComboModalState | null;
  selectedMode: 'pair' | 'trio' | null;
  selectedTarget: string | null;
  selectedCard: ExplodingCatsCard | null;
  selectedIndex: number | null;
  aliveOpponents: Array<{
    playerId: string;
    hand: ExplodingCatsCard[];
  }>;
  onSelectCat: (cat: ExplodingCatsCatCard) => void;
  onSelectMode: (mode: 'pair' | 'trio') => void;
  onSelectTarget: (target: string) => void;
  onSelectCard: (card: ExplodingCatsCard) => void;
  onSelectIndex: (index: number) => void;
  onConfirm: () => void;
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: TranslationKey) => string;
}

export const CatComboModal: React.FC<CatComboModalProps> = ({
  isOpen,
  onClose,
  catComboModal,
  selectedMode,
  selectedTarget,
  selectedCard,
  selectedIndex,
  aliveOpponents,
  onSelectCat,
  onSelectMode,
  onSelectTarget,
  onSelectCard,
  onSelectIndex,
  onConfirm,
  resolveDisplayName,
  t,
}) => {
  if (!isOpen || !catComboModal) return null;

  const { availableCats, selectedCat } = catComboModal;
  const currentCatData = selectedCat
    ? availableCats.find((c) => c.cat === selectedCat)
    : null;
  const targetOpponent = aliveOpponents.find(
    (o) => o.playerId === selectedTarget,
  );
  const targetHandSize = targetOpponent?.hand.length ?? 0;
  const showCatSelection = availableCats.length > 1;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {selectedCat ? getCardEmoji(selectedCat) : '🐱'}{' '}
            {t('games.table.modals.catCombo.title')}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {/* Cat Selection - only show if multiple cats available */}
        {showCatSelection && (
          <ModalSection>
            <SectionLabel>Select Cat Card</SectionLabel>
            <OptionGrid>
              {availableCats.map(({ cat, availableModes }) => (
                <OptionButton
                  key={cat}
                  $selected={selectedCat === cat}
                  onClick={() => onSelectCat(cat)}
                >
                  <div style={{ fontSize: '1.5rem' }}>{getCardEmoji(cat)}</div>
                  <div>{t(getCardTranslationKey(cat))}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {availableModes.includes('trio') ? '2-3 cards' : '2 cards'}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Mode Selection - only show after cat is selected */}
        {selectedCat && currentCatData && (
          <ModalSection>
            <SectionLabel>
              {t('games.table.modals.catCombo.selectMode')}
            </SectionLabel>
            <OptionGrid>
              {currentCatData.availableModes.includes('pair') && (
                <OptionButton
                  $selected={selectedMode === 'pair'}
                  onClick={() => onSelectMode('pair')}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎴🎴</div>
                  <div>{t('games.table.modals.catCombo.pair')}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {t('games.table.modals.catCombo.pairDesc')}
                  </div>
                </OptionButton>
              )}
              {currentCatData.availableModes.includes('trio') && (
                <OptionButton
                  $selected={selectedMode === 'trio'}
                  onClick={() => onSelectMode('trio')}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎴🎴🎴</div>
                  <div>{t('games.table.modals.catCombo.trio')}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {t('games.table.modals.catCombo.trioDesc')}
                  </div>
                </OptionButton>
              )}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Target Selection - only show after cat is selected */}
        {selectedCat && (
          <ModalSection>
            <SectionLabel>
              {t('games.table.modals.catCombo.selectTarget')}
            </SectionLabel>
            <OptionGrid>
              {aliveOpponents.map((opponent) => (
                <OptionButton
                  key={opponent.playerId}
                  $selected={selectedTarget === opponent.playerId}
                  onClick={() => onSelectTarget(opponent.playerId)}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎮</div>
                  <div>
                    {resolveDisplayName(
                      opponent.playerId,
                      `Player ${opponent.playerId.slice(0, 8)}`,
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {t('games.table.modals.catCombo.cardsCount').replace(
                      '{count}',
                      opponent.hand.length.toString(),
                    )}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Card Index Selection for Pair */}
        {selectedMode === 'pair' && selectedTarget && targetHandSize > 0 && (
          <ModalSection>
            <SectionLabel>Pick a card (blind)</SectionLabel>
            <OptionGrid>
              {Array.from({ length: targetHandSize }, (_, index) => (
                <OptionButton
                  key={index}
                  $selected={selectedIndex === index}
                  onClick={() => onSelectIndex(index)}
                >
                  <div style={{ fontSize: '1.5rem' }}>🎴</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Card {index + 1}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        {/* Card Type Selection for Trio */}
        {selectedMode === 'trio' && (
          <ModalSection>
            <SectionLabel>
              {t('games.table.modals.catCombo.selectCard')}
            </SectionLabel>
            <OptionGrid>
              {[
                'defuse',
                'attack',
                'skip',
                'favor',
                'shuffle',
                'see_the_future',
                ...CAT_CARDS,
              ].map((card) => (
                <OptionButton
                  key={card}
                  $selected={selectedCard === card}
                  onClick={() => onSelectCard(card as ExplodingCatsCard)}
                >
                  <div style={{ fontSize: '1.5rem' }}>
                    {getCardEmoji(card as ExplodingCatsCard)}
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    {t(getCardTranslationKey(card as ExplodingCatsCard)) ||
                      card}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}

        <ModalActions>
          <ModalButton variant="secondary" onClick={onClose}>
            {t('games.table.modals.common.cancel')}
          </ModalButton>
          <ModalButton
            onClick={onConfirm}
            disabled={
              !selectedCat ||
              !selectedTarget ||
              (selectedMode === 'trio' && !selectedCard) ||
              (selectedMode === 'pair' && selectedIndex === null)
            }
          >
            {t('games.table.modals.catCombo.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
