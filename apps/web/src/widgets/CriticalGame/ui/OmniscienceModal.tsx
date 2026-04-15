import React from 'react';
import { YStack } from 'tamagui';
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
  Card,
  CardFrame,
  CardCorner,
  GradientScrim,
} from './styles';
import { CardImage } from './styles/card-image';
import { type GameVariant } from '@arcadeum/ui';
import { getCardTranslationKey } from '../lib/cardUtils';
import type { OmniscienceModalState } from '../types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface OmniscienceModalProps {
  omniscienceModal: OmniscienceModalState | null;
  onClose: () => void;
  resolveDisplayName: (
    playerId?: string,
    fallbackName?: string,
  ) => string | undefined;
  t: (key: TranslationKey) => string;
  cardVariant?: string;
}

export function OmniscienceModal({
  omniscienceModal,
  onClose,
  resolveDisplayName,
  t,
  cardVariant,
}: OmniscienceModalProps) {
  if (!omniscienceModal) return null;

  return (
    <Modal>
      <ModalContent
        onPress={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            👁️ {t('games.table.cards.omniscience') || 'Omniscience'}
          </ModalTitle>
          <CloseButton onPress={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>

        {omniscienceModal.hands.map((hand) => (
          <ModalSection key={hand.playerId}>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {resolveDisplayName(hand.playerId, 'Player')}
            </SectionLabel>
            {hand.cards.length === 0 ? (
              <p style={{ opacity: 0.7, textAlign: 'center' }}>
                {t('games.table.modals.omniscience.emptyHand') ||
                  'No cards in hand.'}
              </p>
            ) : (
              <OptionGrid>
                {hand.cards.map((card, idx) => (
                  <OptionButton
                    key={`${hand.playerId}-${idx}`}
                    $selected={false}
                    $variant={cardVariant as GameVariant}
                    padding={0}
                    height="auto"
                  >
                    <YStack
                      alignItems="center"
                      width={100}
                      gap="$2"
                      padding="$2"
                    >
                      <Card
                        $cardType={card}
                        $variant={cardVariant as GameVariant}
                        width="100%"
                        cursor="default"
                      >
                        <CardCorner $position="tl" $variant={cardVariant} />
                        <CardCorner $position="tr" $variant={cardVariant} />
                        <CardCorner $position="bl" $variant={cardVariant} />
                        <CardCorner $position="br" $variant={cardVariant} />
                        <CardFrame $variant={cardVariant} />
                        <CardImage
                          variant={cardVariant ?? ''}
                          cardType={card}
                        />
                        <GradientScrim />
                      </Card>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t(getCardTranslationKey(card, cardVariant)) || card}
                      </div>
                    </YStack>
                  </OptionButton>
                ))}
              </OptionGrid>
            )}
          </ModalSection>
        ))}

        <ModalActions>
          <ModalButton onPress={onClose}>
            {t('games.table.modals.common.close') || 'Close'}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
}
