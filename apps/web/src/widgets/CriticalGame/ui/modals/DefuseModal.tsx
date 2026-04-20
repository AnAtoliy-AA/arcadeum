import React, { useState } from 'react';
import { YStack, XStack, Text, Slider as TamaSlider, styled } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalActions,
  ModalButton,
} from '../styles';
import { type GameVariant } from '@arcadeum/ui';

interface DefuseModalProps {
  isOpen: boolean;
  onDefuse: (position: number) => void;
  deckSize: number;
  t: (key: string) => string;
  cardVariant?: string;
}

const Description = styled(Text, {
  name: 'Description',
  textAlign: 'center',
  marginBottom: '$6',
  opacity: 0.8,
});

const PositionSelector = styled(YStack, {
  name: 'PositionSelector',
  gap: '$3',
  marginBottom: '$6',
});

const PositionLabel = styled(Text, {
  name: 'PositionLabel',
  fontWeight: '500',
  textAlign: 'center',
});

const SliderContainer = styled(XStack, {
  name: 'SliderContainer',
  alignItems: 'center',
  gap: '$2',
});

const SliderLabel = styled(Text, {
  name: 'SliderLabel',
  fontSize: '$2',
  opacity: 0.6,
  minWidth: 50,
  textAlign: 'center',
});

const PositionValue = styled(Text, {
  name: 'PositionValue',
  textAlign: 'center',
  fontSize: '$3',
  padding: '$2',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '$2',
});

const DefuseModal: React.FC<DefuseModalProps> = ({
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
    <Modal open={isOpen}>
      <ModalContent
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
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
            <TamaSlider
              flex={1}
              size="$4"
              value={[selectedPosition]}
              onValueChange={(val) => setSelectedPosition(val[0])}
              min={0}
              max={Math.max(0, deckSize)}
              step={1}
            >
              <TamaSlider.Track backgroundColor="rgba(255, 255, 255, 0.1)">
                <TamaSlider.TrackActive backgroundColor="#10b981" />
              </TamaSlider.Track>
              <TamaSlider.Thumb
                index={0}
                circular
                backgroundColor="#10b981"
                elevate
              />
            </TamaSlider>
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

export default DefuseModal;
