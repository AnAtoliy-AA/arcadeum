'use client';
import React from 'react';
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
} from './styles';
import { Card, CardFrame, CardCorner, GradientScrim } from './styles';
import { CardImage } from './styles/card-image';
import { CARD_GROUPS } from '../lib/constants';
import { CriticalCard } from '../types';
import type { GameVariant } from '@arcadeum/ui';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { CloseIcon } from '@arcadeum/ui/components/Icons/index';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVariant: string;
  isFastMode?: boolean;
  isPrivate?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const RulesGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="box-border flex flex-row items-stretch flex-wrap gap-4">
    {children}
  </div>
);

const CardRuleItem = ({ children }: { children: React.ReactNode }) => (
  <div className="box-border flex flex-row gap-3 items-start bg-[rgba(255,_255,_255,_0.03)] p-3 rounded-[12px] border border-[rgba(255,_255,_255,_0.05)] w-full">
    {children}
  </div>
);

const CardVisual = ({ children }: { children: React.ReactNode }) => (
  <div className="box-border flex flex-col items-stretch shrink-0 w-[80px]">
    {children}
  </div>
);

const CardInfo = ({ children }: { children: React.ReactNode }) => (
  <div className="box-border flex flex-col items-stretch gap-1 flex-1">
    {children}
  </div>
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount detection
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const getCardName = (key: string) => {
    const variantKey =
      `games.table.cards.variants.${currentVariant}.${key}` as TranslationKey;
    const variantName = t(variantKey);

    if (variantName !== variantKey) return variantName;

    const camelKey = snakeToCamel(key);
    return t(`games.table.cards.${camelKey}` as TranslationKey);
  };

  const getCardDescription = (key: string) => {
    const camelKey = snakeToCamel(key);
    return t(`games.table.cards.descriptions.${camelKey}` as TranslationKey);
  };

  const snakeToCamel = (str: string) =>
    str.replace(/([-_][a-z])/g, (_group) =>
      _group.toUpperCase().replace('-', '').replace('_', ''),
    );

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        $variant={currentVariant as GameVariant}
        style={{ maxWidth: 900 }}
        data-testid="rules-modal"
      >
        <ModalHeader>
          <ModalTitle>
            {t('games.critical_v1.rules.title' as TranslationKey)}
          </ModalTitle>
          <CloseButton
            onClick={onClose}
            $variant={currentVariant as GameVariant}
            data-testid="modal-close-button"
          >
            <CloseIcon size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalSection>
          <SectionLabel $variant={currentVariant as GameVariant}>
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
            <SectionLabel $variant={currentVariant as GameVariant}>
              {t('games.critical_v1.rules.headers.fastGame' as TranslationKey)}
            </SectionLabel>
            <RulesText>
              {t('games.critical_v1.rules.fastGame' as TranslationKey)}
            </RulesText>
          </ModalSection>
        )}

        {isPrivate && (
          <ModalSection>
            <SectionLabel $variant={currentVariant as GameVariant}>
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
          <SectionLabel $variant={currentVariant as GameVariant}>
            {t('games.critical_v1.rules.headers.gameplay' as TranslationKey)}
          </SectionLabel>
          <RulesText>
            {t('games.critical_v1.rules.gameplay' as TranslationKey)}
          </RulesText>
        </ModalSection>

        <ModalSection>
          <SectionLabel $variant={currentVariant as GameVariant}>
            {t('games.critical_v1.rules.headers.combos' as TranslationKey)}
          </SectionLabel>
          <RulesTextPre>
            {t('games.critical_v1.rules.combos' as TranslationKey)}
          </RulesTextPre>
        </ModalSection>

        <ModalSection>
          <SectionLabel $variant={currentVariant as GameVariant}>
            {t('games.critical_v1.rules.headers.chat' as TranslationKey)}
          </SectionLabel>
          <RulesTextPre>
            {t('games.critical_v1.rules.chat' as TranslationKey)}
          </RulesTextPre>
        </ModalSection>

        {CARD_GROUPS.map((group) => (
          <ModalSection key={group.id}>
            <SectionLabel $variant={currentVariant as GameVariant}>
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
                      $variant={currentVariant as string}
                      cursor="default"
                    >
                      <CardCorner $position="tl" $variant={currentVariant} />
                      <CardCorner $position="tr" $variant={currentVariant} />
                      <CardCorner $position="bl" $variant={currentVariant} />
                      <CardCorner $position="br" $variant={currentVariant} />
                      <CardFrame $variant={currentVariant} />
                      <CardImage
                        variant={currentVariant ?? ''}
                        cardType={cardKey}
                      />
                      <GradientScrim />
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
    </Modal>
  );
}
