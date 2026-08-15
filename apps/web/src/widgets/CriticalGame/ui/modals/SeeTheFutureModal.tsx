import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  OptionGrid,
  OptionButton,
  ModalActions,
  ModalButton,
  Card,
  CardFrame,
  CardCorner,
  GradientScrim,
} from '../styles';
import { CardImage } from '../styles/card-image';
import { type GameVariant } from '@arcadeum/ui';
import { getCardTranslationKey } from '../../lib/cardUtils';
import type { CriticalCard } from '../../types';

interface SeeTheFutureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CriticalCard[];
  t: (key: string) => string;
  cardVariant?: string;
}

const SeeTheFutureModal: React.FC<SeeTheFutureModalProps> = ({
  isOpen,
  onClose,
  cards,
  t,
  cardVariant,
}) => {
  if (!isOpen) return null;

  return (
    <Modal open={isOpen}>
      <ModalContent
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            🔮 {t('games.table.modals.seeTheFuture.title')}
          </ModalTitle>
          <CloseButton onClick={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>
        <OptionGrid>
          {cards.map((card, index) => (
            <OptionButton
              key={`${card}-${index}`}
              active={false}
              gameVariant={cardVariant as GameVariant}
              style={{ padding: 0, height: 'auto' }}
            >
              <div className="box-border flex flex-col items-center w-[100px] gap-2 p-2">
                <span className="box-border text-[14px] opacity-[0.7]">
                  #{index + 1}
                </span>
                <Card
                  $cardType={card}
                  $variant={cardVariant as GameVariant}
                  className="w-full cursor-default"
                >
                  <CardCorner $position="tl" $variant={cardVariant} />
                  <CardCorner $position="tr" $variant={cardVariant} />
                  <CardCorner $position="bl" $variant={cardVariant} />
                  <CardCorner $position="br" $variant={cardVariant} />
                  <CardFrame $variant={cardVariant} />
                  <CardImage variant={cardVariant ?? ''} cardType={card} />
                  <GradientScrim />
                </Card>
                <span className="box-border text-[14px] text-center line-clamp-1">
                  {t(getCardTranslationKey(card, cardVariant)) || card}
                </span>
              </div>
            </OptionButton>
          ))}
        </OptionGrid>
        <ModalActions>
          <ModalButton onClick={onClose}>
            {t('games.table.modals.seeTheFuture.confirm')}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export default SeeTheFutureModal;
