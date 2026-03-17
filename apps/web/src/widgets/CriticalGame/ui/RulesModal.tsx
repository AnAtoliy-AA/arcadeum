import React from 'react';
import { VisuallyHidden, XStack, YStack, Dialog } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalSection,
  SectionLabel,
  RulesText,
  RulesTextPre,
} from '@/features/games/ui/SharedModalStyles';
import { Card } from './styles/cards';
import { CARD_GROUPS } from '../lib/constants';
import { CriticalCard } from '@/shared/types/games';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { CloseIcon } from '@/shared/ui';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVariant: string;
  isFastMode?: boolean;
  isPrivate?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

// Rules grid using Tamagui
const RulesGrid = ({ children }: { children: React.ReactNode }) => (
  <XStack flexWrap="wrap" gap="$4">
    {children}
  </XStack>
);

const CardRuleItem = ({ children }: { children: React.ReactNode }) => (
  <XStack
    gap="$3"
    alignItems="flex-start"
    backgroundColor="rgba(255, 255, 255, 0.03)"
    padding="$3"
    borderRadius={12}
    borderWidth={1}
    borderColor="rgba(255, 255, 255, 0.05)"
    width="100%"
    $gtSm={{ width: 'calc(50% - 8px)' }}
  >
    {children}
  </XStack>
);

const CardVisual = ({ children }: { children: React.ReactNode }) => (
  <YStack flexShrink={0} width={80}>
    {children}
  </YStack>
);

const CardInfo = ({ children }: { children: React.ReactNode }) => (
  <YStack gap="$1" flex={1}>
    {children}
  </YStack>
);

const CardName = ({ children }: { children: React.ReactNode }) => (
  <RulesText fontWeight="700" fontSize="$4">
    {children}
  </RulesText>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <RulesText fontSize="$2" opacity={0.7} lineHeight={16}>
    {children}
  </RulesText>
);

export function RulesModal({
  isOpen,
  onClose,
  currentVariant,
  isFastMode,
  isPrivate,
  t,
}: RulesModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const getCardName = (key: string) => {
    // 1. Try variant specific name
    const variantKey =
      `games.table.cards.variants.${currentVariant}.${key}` as TranslationKey;
    const variantName = t(variantKey);

    // If translation returns key (and it's not the fallback we want), try default
    if (variantName !== variantKey) return variantName;

    // 2. Try default name (snake to camel)
    const camelKey = snakeToCamel(key);
    return t(`games.table.cards.${camelKey}` as TranslationKey);
  };

  const getCardDescription = (key: string) => {
    const camelKey = snakeToCamel(key);
    return t(`games.table.cards.descriptions.${camelKey}` as TranslationKey);
  };

  const snakeToCamel = (str: string) =>
    str.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', ''),
    );

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          {...({
            animation: 'quick',
            enterStyle: { opacity: 0 },
            exitStyle: { opacity: 0 },
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
          } as unknown as object)}
        />
        <ModalContent
          $variant={currentVariant}
          style={{ maxWidth: 900 }}
          data-testid="rules-modal"
        >
          <VisuallyHidden>
            <Dialog.Title>
              {t('games.critical_v1.rules.title' as TranslationKey)}
            </Dialog.Title>
            <Dialog.Description>Game rules for Critical</Dialog.Description>
          </VisuallyHidden>

          <ModalHeader variant={currentVariant as unknown as 'cyberpunk'}>
            <ModalTitle variant={currentVariant as unknown as 'cyberpunk'}>
              {t('games.critical_v1.rules.title' as TranslationKey)}
            </ModalTitle>
            <Dialog.Close asChild>
              <CloseButton
                onClick={onClose}
                onPress={onClose}
                $variant={currentVariant}
                data-testid="modal-close-button"
              >
                <CloseIcon size={20} />
              </CloseButton>
            </Dialog.Close>
          </ModalHeader>

          <ModalSection>
            <SectionLabel variant={currentVariant as unknown as 'cyberpunk'}>
              {t('games.critical_v1.rules.headers.objective' as TranslationKey)}
            </SectionLabel>
            <RulesText>
              {t('games.critical_v1.rules.objective' as TranslationKey, {
                criticalEvent: getCardName('critical_event'),
                neutralizer: getCardName('neutralizer'),
              })}
            </RulesText>
          </ModalSection>

          {isFastMode && (
            <ModalSection>
              <SectionLabel variant={currentVariant as unknown as 'cyberpunk'}>
                {t(
                  'games.critical_v1.rules.headers.fastGame' as TranslationKey,
                )}
              </SectionLabel>
              <RulesText>
                {t('games.critical_v1.rules.fastGame' as TranslationKey)}
              </RulesText>
            </ModalSection>
          )}

          {isPrivate && (
            <ModalSection>
              <SectionLabel variant={currentVariant as unknown as 'cyberpunk'}>
                {t(
                  'games.critical_v1.rules.headers.privateRoom' as TranslationKey,
                )}
              </SectionLabel>
              <RulesText>
                {t('games.critical_v1.rules.privateRoom' as TranslationKey)}
              </RulesText>
            </ModalSection>
          )}

          <ModalSection>
            <SectionLabel variant={currentVariant as unknown as 'cyberpunk'}>
              {t('games.critical_v1.rules.headers.gameplay' as TranslationKey)}
            </SectionLabel>
            <RulesText>
              {t('games.critical_v1.rules.gameplay' as TranslationKey)}
            </RulesText>
          </ModalSection>

          <ModalSection>
            <SectionLabel variant={currentVariant as unknown as 'cyberpunk'}>
              {t('games.critical_v1.rules.headers.combos' as TranslationKey)}
            </SectionLabel>
            <RulesTextPre>
              {t('games.critical_v1.rules.combos' as TranslationKey)}
            </RulesTextPre>
          </ModalSection>

          <ModalSection>
            <SectionLabel variant={currentVariant as unknown as 'cyberpunk'}>
              {t('games.critical_v1.rules.headers.chat' as TranslationKey)}
            </SectionLabel>
            <RulesTextPre>
              {t('games.critical_v1.rules.chat' as TranslationKey)}
            </RulesTextPre>
          </ModalSection>

          {CARD_GROUPS.map((group) => (
            <ModalSection key={group.id}>
              <SectionLabel variant={currentVariant as unknown as 'cyberpunk'}>
                {t(
                  `games.critical_v1.rules.cardGroups.${group.id}` as TranslationKey,
                )}
              </SectionLabel>
              <RulesGrid>
                {group.cards.map((cardKey) => (
                  <CardRuleItem key={cardKey}>
                    <CardVisual>
                      <Card
                        $cardType={cardKey as CriticalCard}
                        $variant={currentVariant}
                      />
                    </CardVisual>
                    <CardInfo>
                      <CardName>{getCardName(cardKey)}</CardName>
                      <CardDescription>
                        {getCardDescription(cardKey)}
                      </CardDescription>
                    </CardInfo>
                  </CardRuleItem>
                ))}
              </RulesGrid>
            </ModalSection>
          ))}
        </ModalContent>
      </Dialog.Portal>
    </Modal>
  );
}
