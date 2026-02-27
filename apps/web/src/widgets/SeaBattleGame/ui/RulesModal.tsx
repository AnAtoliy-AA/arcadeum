import React from 'react';
import { createPortal } from 'react-dom';
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ScrollArea,
  Section,
  SectionHeader,
  IconWrapper,
  SectionTitle,
  RulesText,
  FleetGrid,
  ShipCard,
  ShipHeader,
  ShipName,
  ShipSize,
  ShipDescription,
} from './RulesModal.styles';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function RulesModal({ isOpen, onClose, t }: RulesModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  // Parse ship rules into structured data
  const shipsRaw = t('games.sea_battle_v1.rules.ships');
  const ships = shipsRaw
    .split('\n')
    .map((line) => {
      const match = line.match(/•\s+(.+)\s+\((\d+)\s+.*\)\s+-\s+(.+)/);
      if (match) {
        return {
          name: match[1],
          size: match[2],
          description: match[3],
        };
      }
      return null;
    })
    .filter(Boolean);

  return createPortal(
    <ModalOverlay onClick={onClose} data-testid="rules-modal">
      <ModalContainer
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px' }}
      >
        <ModalHeader>
          <ModalTitle>{t('games.sea_battle_v1.rules.title')}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ScrollArea>
          <Section style={{ animationDelay: '0.1s' }}>
            <SectionHeader>
              <IconWrapper $gradient="linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)">
                🎯
              </IconWrapper>
              <SectionTitle>
                {t('games.sea_battle_v1.rules.headers.objective')}
              </SectionTitle>
            </SectionHeader>
            <RulesText>{t('games.sea_battle_v1.rules.objective')}</RulesText>
          </Section>

          <Section style={{ animationDelay: '0.2s' }}>
            <SectionHeader>
              <IconWrapper $gradient="linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)">
                🎮
              </IconWrapper>
              <SectionTitle>
                {t('games.sea_battle_v1.rules.headers.gameplay')}
              </SectionTitle>
            </SectionHeader>
            <RulesText>{t('games.sea_battle_v1.rules.gameplay')}</RulesText>
          </Section>

          <Section style={{ animationDelay: '0.3s' }}>
            <SectionHeader>
              <IconWrapper $gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                ⚓
              </IconWrapper>
              <SectionTitle>
                {t('games.sea_battle_v1.rules.headers.placement')}
              </SectionTitle>
            </SectionHeader>
            <RulesText>{t('games.sea_battle_v1.rules.placement')}</RulesText>
          </Section>

          <Section style={{ animationDelay: '0.4s' }}>
            <SectionHeader>
              <IconWrapper $gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)">
                💥
              </IconWrapper>
              <SectionTitle>
                {t('games.sea_battle_v1.rules.headers.battle')}
              </SectionTitle>
            </SectionHeader>
            <RulesText>{t('games.sea_battle_v1.rules.battle')}</RulesText>
          </Section>

          <Section style={{ animationDelay: '0.5s' }}>
            <SectionHeader>
              <IconWrapper $gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)">
                🚢
              </IconWrapper>
              <SectionTitle>
                {t('games.sea_battle_v1.rules.headers.ships')}
              </SectionTitle>
            </SectionHeader>
            <FleetGrid>
              {ships.map((ship, idx) => (
                <ShipCard key={idx}>
                  <ShipHeader>
                    <ShipName>{ship?.name}</ShipName>
                    <ShipSize>
                      {ship?.size}{' '}
                      {t(
                        'games.sea_battle_v1.table.state.cells' as TranslationKey,
                      )}
                    </ShipSize>
                  </ShipHeader>
                  <ShipDescription>{ship?.description}</ShipDescription>
                </ShipCard>
              ))}
            </FleetGrid>
          </Section>
        </ScrollArea>
      </ModalContainer>
    </ModalOverlay>,
    document.body,
  );
}
