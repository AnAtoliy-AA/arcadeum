'use client';

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@/shared/ui/Modal';
import { LinkButton } from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLanguage } from '@/app/i18n/LanguageProvider';
interface HomeGameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  initialTab?: 'rules' | 'info';
}

const ModalGlassContent = styled(ModalContent)`
  background: ${({ theme }) => theme.surfaces.card.background}cc;
  backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  position: relative;
  overflow: hidden;
`;

const HeaderBackgroundEmoji = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;
  font-size: 10rem;
  opacity: 0.1;
  pointer-events: none;
  filter: blur(4px);
  z-index: 0;
`;

const StyledModalTitle = styled(ModalTitle)<{ $gradient?: string }>`
  background: ${({ $gradient }) =>
    $gradient ?? 'linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
`;

const TabsWrapper = styled.div`
  display: flex;
  background: ${({ theme }) => theme.surfaces.card.border}40;
  padding: 0.35rem;
  border-radius: 999px;
  width: fit-content;
  margin-bottom: 2.5rem;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border}50;
`;

const TabPill = styled.button<{ $isActive: boolean }>`
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.surfaces.card.background : 'transparent'};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.text.primary : theme.text.secondary};
  border: none;
  border-radius: 999px;
  padding: 0.6rem 2rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ $isActive }) =>
    $isActive ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none'};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.text.primary};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const RulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
`;

const RuleCard = styled.div`
  background: ${({ theme }) => theme.surfaces.card.background}80;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  gap: 1.25rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart}40;
  }
`;

const RuleIcon = styled.div<{ $gradient?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $gradient }) =>
    $gradient ?? 'linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const RuleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  h5 {
    margin: 0;
    color: ${({ theme }) => theme.text.primary};
    font-size: 1.1rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.text.secondary};
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const ThemeCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;

const ThemeCard = styled.div<{ $isPlayable?: boolean }>`
  background: ${({ theme }) => theme.surfaces.card.background}80;
  border: 1px solid
    ${({ theme, $isPlayable }) =>
      $isPlayable ? theme.surfaces.card.border : 'transparent'};
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  opacity: ${({ $isPlayable }) => ($isPlayable === false ? 0.6 : 1)};
  transition: all 0.2s ease;

  ${({ $isPlayable, theme }) =>
    $isPlayable &&
    `
    &:hover {
      border-color: ${theme.buttons.primary.gradientStart}60;
      transform: scale(1.02);
      background: ${theme.surfaces.card.background};
    }
  `}
`;

const ThemeName = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: 700;
  font-size: 1rem;
`;

const StatusBadge = styled.span<{ $active?: boolean }>`
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  width: fit-content;
  background: ${({ $active, theme }) =>
    $active
      ? `${theme.buttons.primary.gradientStart}20`
      : `${theme.text.muted}20`};
  color: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.gradientStart : theme.text.muted};
`;

const ModalActionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.surfaces.card.border}50;
`;

const StyledPlayNowButton = styled(LinkButton)`
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border-radius: 14px;
`;

import { featuredGames } from '../../data/games';

export function HomeGameDetailsModal({
  isOpen,
  onClose,
  gameId,
  initialTab = 'rules',
}: HomeGameDetailsModalProps) {
  const { t } = useTranslation();
  const { messages, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'rules' | 'info'>(initialTab);

  const game = useMemo(
    () => featuredGames.find((g) => g.id === gameId),
    [gameId],
  );

  const homeCopy = messages.home ?? {};

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const rulesData = useMemo(() => {
    if (!game) return [];

    // Resolve variables from config
    const variables: Record<string, string | number> = {};
    if (game.variableKeys) {
      Object.entries(game.variableKeys).forEach(([key, translationKey]) => {
        variables[key] = t(translationKey);
      });
    }

    return game.rulesKeys.map((key, index) => {
      const translationKey = `${game.rulesPrefix}.${key}` as TranslationKey;
      const translationString = t(translationKey);

      // Only pass variables if the translation string actually has placeholders
      const hasPlaceholders = translationString.includes('{{');
      const filteredVariables = hasPlaceholders ? variables : {};

      return {
        id: key,
        index: index + 1,
        name:
          t(`games.shared.rules.${key}` as TranslationKey) ||
          key.charAt(0).toUpperCase() + key.slice(1),
        description: t(translationKey, filteredVariables),
      };
    });
  }, [game, t]);

  const renderRules = () => (
    <ContentGrid>
      <RulesGrid>
        {rulesData.map((rule) => (
          <RuleCard key={rule.id}>
            <RuleIcon $gradient={game?.gradient}>{rule.index}</RuleIcon>
            <RuleText>
              <h5>{rule.name}</h5>
              <p>{rule.description}</p>
            </RuleText>
          </RuleCard>
        ))}
      </RulesGrid>
    </ContentGrid>
  );

  const renderGameInfo = () => {
    if (!game) return null;

    return (
      <ContentGrid>
        <ThemeCardsGrid>
          {game.variants.map((v) => (
            <ThemeCard key={v.id} $isPlayable={!v.disabled}>
              <ThemeName>{t(v.nameKey) || v.id}</ThemeName>
              <StatusBadge $active={!v.disabled}>
                {!v.disabled
                  ? (homeCopy.gameAvailableNow ?? 'Playable')
                  : (homeCopy.gameComingSoon ?? 'Coming Soon')}
              </StatusBadge>
            </ThemeCard>
          ))}
        </ThemeCardsGrid>
      </ContentGrid>
    );
  };

  if (!isOpen || !game) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalGlassContent maxWidth="800px">
        <HeaderBackgroundEmoji>{game.emoji}</HeaderBackgroundEmoji>
        <ModalHeader onClose={onClose}>
          <StyledModalTitle $gradient={game.gradient}>
            {t(game.nameKey)}
          </StyledModalTitle>
        </ModalHeader>
        <ModalBody>
          <TabsWrapper>
            <TabPill
              $isActive={activeTab === 'rules'}
              onClick={() => setActiveTab('rules')}
            >
              {homeCopy.rulesTab ?? 'Rules'}
            </TabPill>
            <TabPill
              $isActive={activeTab === 'info'}
              onClick={() => setActiveTab('info')}
            >
              {homeCopy.infoTab ?? 'Game Themes'}
            </TabPill>
          </TabsWrapper>

          {activeTab === 'rules' ? renderRules() : renderGameInfo()}

          <ModalActionFooter>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {locale.toUpperCase()} •{' '}
              {t(`games.shared.category.${game.type}Game` as TranslationKey)}
            </div>
            <StyledPlayNowButton
              href={`${routes.gameCreate}?gameId=${game.id}`}
            >
              {homeCopy.gamePlayButton ?? 'Play Now!'}
            </StyledPlayNowButton>
          </ModalActionFooter>
        </ModalBody>
      </ModalGlassContent>
    </Modal>
  );
}
