import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
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
} from './styles/modals';
import { Card } from './styles/cards';
import { CARD_GROUPS } from '../lib/constants';
import { CriticalCard } from '@/shared/types/games';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVariant: string;
  isFastMode?: boolean;
  isPrivate?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const snakeToCamel = (str: string) =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', ''),
  );

const RulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const CardRuleItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const CardVisual = styled.div`
  flex-shrink: 0;
  width: 80px;
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CardName = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: ${({ theme }) => theme.text.primary};
`;

const CardDescription = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 1.4;
`;

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
    // 1. Try variant specific description (usually not different, but could be)
    // Actually typically descriptions are generic but we might want them themed later.
    // For now, let's use the core descriptions which are generic but thematic enough.
    const camelKey = snakeToCamel(key);
    return t(`games.table.cards.descriptions.${camelKey}` as TranslationKey);
  };

  return createPortal(
    <Modal onClick={onClose} data-testid="rules-modal">
      <ModalContent
        onClick={(e) => e.stopPropagation()}
        $variant={currentVariant}
        style={{ maxWidth: '900px' }}
      >
        <ModalHeader $variant={currentVariant}>
          <ModalTitle $variant={currentVariant}>
            {t('games.critical_v1.rules.title' as TranslationKey)}
          </ModalTitle>
          <CloseButton onClick={onClose} $variant={currentVariant}>
            ×
          </CloseButton>
        </ModalHeader>

        <ModalSection>
          <SectionLabel $variant={currentVariant}>
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
            <SectionLabel $variant={currentVariant}>
              {t('games.critical_v1.rules.headers.fastGame' as TranslationKey)}
            </SectionLabel>
            <RulesText>
              {t('games.critical_v1.rules.fastGame' as TranslationKey)}
            </RulesText>
          </ModalSection>
        )}

        {isPrivate && (
          <ModalSection>
            <SectionLabel $variant={currentVariant}>
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
          <SectionLabel $variant={currentVariant}>
            {t('games.critical_v1.rules.headers.gameplay' as TranslationKey)}
          </SectionLabel>
          <RulesText>
            {t('games.critical_v1.rules.gameplay' as TranslationKey)}
          </RulesText>
        </ModalSection>

        <ModalSection>
          <SectionLabel $variant={currentVariant}>
            {t('games.critical_v1.rules.headers.combos' as TranslationKey)}
          </SectionLabel>
          <RulesTextPre>
            {t('games.critical_v1.rules.combos' as TranslationKey)}
          </RulesTextPre>
        </ModalSection>

        <ModalSection>
          <SectionLabel $variant={currentVariant}>
            {t('games.critical_v1.rules.headers.chat' as TranslationKey)}
          </SectionLabel>
          <RulesTextPre>
            {t('games.critical_v1.rules.chat' as TranslationKey)}
          </RulesTextPre>
        </ModalSection>

        {CARD_GROUPS.map((group) => (
          <ModalSection key={group.id}>
            <SectionLabel $variant={currentVariant}>
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
                    >
                      {/* Optional: Show name on card too if needed, but we show it on side */}
                    </Card>
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
    </Modal>,
    document.body,
  );
}
