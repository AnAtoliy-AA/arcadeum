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
  CardCorner,
  CardFrame,
  GradientScrim,
} from './styles';
import { Typography, type GameVariant } from '@arcadeum/ui';
import { CardImage } from './styles/card-image';
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

export default function OmniscienceModal({
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
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
        $variant={cardVariant as GameVariant}
      >
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            👁️ {t('games.table.cards.omniscience') || 'Omniscience'}
          </ModalTitle>
          <CloseButton onClick={onClose} $variant={cardVariant as GameVariant}>
            ×
          </CloseButton>
        </ModalHeader>

        {omniscienceModal.hands.map((hand) => (
          <ModalSection key={hand.playerId}>
            <SectionLabel $variant={cardVariant as GameVariant}>
              {resolveDisplayName(hand.playerId, 'Player')}
            </SectionLabel>
            {hand.cards.length === 0 ? (
              <Typography className={'text-center'} uiSize="sm" alpha="medium">
                {t('games.table.modals.omniscience.emptyHand') ||
                  'No cards in hand.'}
              </Typography>
            ) : (
              <OptionGrid>
                {hand.cards.map((card, idx) => (
                  <OptionButton
                    key={`${hand.playerId}-${idx}`}
                    active={false}
                    gameVariant={cardVariant as GameVariant}
                    style={{ padding: 0, height: 'auto' }}
                  >
                    <div className="box-border flex flex-col items-center w-[100px] gap-2 p-2">
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
                      <Typography
                        className={'text-center w-full line-clamp-1'}
                        uiSize="xs"
                      >
                        {t(getCardTranslationKey(card, cardVariant)) || card}
                      </Typography>
                    </div>
                  </OptionButton>
                ))}
              </OptionGrid>
            )}
          </ModalSection>
        ))}

        <ModalActions>
          <ModalButton onClick={onClose}>
            {t('games.table.modals.common.close') || 'Close'}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
}
