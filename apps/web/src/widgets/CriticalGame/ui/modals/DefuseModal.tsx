import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalActions,
  ModalButton,
} from '../styles';

interface DefuseModalProps {
  isOpen: boolean;
  onDefuse: (position: number) => void;
  deckSize: number;
  t: (key: string) => string;
  cardVariant?: string;
}

export const DefuseModal: React.FC<DefuseModalProps> = ({
  isOpen,
  onDefuse,
  deckSize,
  t,
  cardVariant,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<number>(0);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onDefuse(selectedPosition);
  };

  return (
    <Modal>
      <ModalContent onClick={(e) => e.stopPropagation()} $variant={cardVariant}>
        <ModalHeader $variant={cardVariant}>
          <ModalTitle $variant={cardVariant}>
            🛡️ {t('games.table.modals.defuse.title')}
          </ModalTitle>
        </ModalHeader>
        <Description>{t('games.table.modals.defuse.description')}</Description>
        <PositionSelector>
          <PositionLabel>
            {t('games.table.modals.defuse.positionLabel')}
          </PositionLabel>
          <SliderContainer>
            <SliderLabel>Top</SliderLabel>
            <Slider
              type="range"
              min={0}
              max={Math.max(0, deckSize)}
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(Number(e.target.value))}
            />
            <SliderLabel>Bottom</SliderLabel>
          </SliderContainer>
          <PositionValue>
            {selectedPosition === 0
              ? 'Top of deck'
              : selectedPosition >= deckSize
                ? 'Bottom of deck'
                : `Position ${selectedPosition + 1} from top`}
          </PositionValue>
        </PositionSelector>
        <ModalActions>
          <ModalButton onClick={handleConfirm}>
            {t('games.table.modals.defuse.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

const Description = styled.p`
  text-align: center;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const PositionSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const PositionLabel = styled.label`
  font-weight: 500;
  text-align: center;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SliderLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  min-width: 50px;
  text-align: center;
`;

const Slider = styled.input`
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
  }
`;

const PositionValue = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
`;
