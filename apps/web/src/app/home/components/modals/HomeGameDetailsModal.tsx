'use client';

import React, { useState, useMemo } from 'react';
import { YStack, XStack, Text, styled } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
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

const ModalGlassContent = styled(ModalContent, {
  backgroundColor: 'rgba(21,23,24,0.8)',
  backdropFilter: 'blur(20px)',
  borderWidth: 1,
  borderColor: '$borderColor',
  position: 'relative',
  overflow: 'hidden',
} as any);

const HeaderBackgroundEmoji = styled(YStack, {
  position: 'absolute',
  top: -20,
  right: -20,
  opacity: 0.1,
  pointerEvents: 'none',
  zIndex: 0,
} as any);

const tabStyles = `
  .tab-pill { background: transparent; border: none; border-radius: 999px; padding: 0.6rem 2rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); text-transform: uppercase; letter-spacing: 0.05em; color: rgba(236,239,238,0.7); }
  .tab-pill.active { background: #151718; color: #ecefee; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
  .tab-pill:hover { color: #ecefee; }
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
    <div style={{ display: 'grid', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {rulesData.map((rule) => (
          <div
            key={rule.id}
            style={{
              background: 'rgba(21,23,24,0.5)',
              border: '1px solid #32353d',
              borderRadius: 20,
              padding: '1.5rem',
              display: 'flex',
              gap: '1.25rem',
              transition: 'transform 0.2s ease',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: game?.gradient ?? 'linear-gradient(135deg,#ff4d4d,#f9cb28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {rule.index}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
              <h5 style={{ margin: 0, color: '#ecefee', fontSize: '1.1rem', fontWeight: 700 }}>{rule.name}</h5>
              <p style={{ margin: 0, color: 'rgba(236,239,238,0.7)', fontSize: '0.95rem', lineHeight: 1.5 }}>{rule.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGameInfo = () => {
    if (!game) return null;

    return (
      <div style={{ display: 'grid', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {game.variants.map((v) => {
            const active = !v.disabled;
            return (
              <YStack
                key={v.id}
                borderRadius={16}
                padding="$4"
                gap="$3"
                style={{ opacity: v.disabled ? 0.6 : 1, border: active ? '1px solid #32353d' : '1px solid transparent', transition: 'all 0.2s ease' }}
              >
                <Text color="$color" fontWeight="700" fontSize="$4">
                  {t(v.nameKey) || v.id}
                </Text>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    padding: '0.25rem 0.6rem',
                    borderRadius: 6,
                    background: active ? 'rgba(122,215,255,0.12)' : 'rgba(236,239,238,0.12)',
                    color: active ? '#7ad7ff' : 'rgba(236,239,238,0.45)',
                    width: 'fit-content',
                    display: 'inline-block',
                  }}
                >
                  {!v.disabled
                    ? (homeCopy.gameAvailableNow ?? 'Playable')
                    : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                </span>
              </YStack>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen || !game) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalGlassContent maxWidth="800px">
        <style>{tabStyles}</style>
        <HeaderBackgroundEmoji>
          <span style={{ fontSize: '10rem', filter: 'blur(4px)' }}>{game.emoji}</span>
        </HeaderBackgroundEmoji>
        <ModalHeader onClose={onClose}>
          <ModalTitle>
            <span
              style={{
                background: game.gradient ?? 'linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2.25rem',
                fontWeight: '900',
                letterSpacing: '-0.02em',
              }}
            >
              {t(game.nameKey)}
            </span>
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div
            style={{
              background: 'rgba(50,53,61,0.25)',
              padding: '0.35rem',
              borderRadius: 999,
              width: 'fit-content',
              marginBottom: '2.5rem',
              border: '1px solid rgba(50,53,61,0.31)',
              display: 'flex',
            }}
          >
            <button
              className={`tab-pill${activeTab === 'rules' ? ' active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              {homeCopy.rulesTab ?? 'Rules'}
            </button>
            <button
              className={`tab-pill${activeTab === 'info' ? ' active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              {homeCopy.infoTab ?? 'Game Themes'}
            </button>
          </div>

          {activeTab === 'rules' ? renderRules() : renderGameInfo()}

          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginTop="$7"
            paddingTop="$6"
            borderTopWidth={1}
            borderTopColor="$borderColor"
          >
            <div style={{ color: 'rgba(236, 239, 238, 0.7)', fontSize: '0.9rem' }}>
              {locale.toUpperCase()} •{' '}
              {t(`games.shared.category.${game.type}Game` as TranslationKey)}
            </div>
            <LinkButton href={`${routes.gameCreate}?gameId=${game.id}`}>
              {homeCopy.gamePlayButton ?? 'Play Now!'}
            </LinkButton>
          </XStack>
        </ModalBody>
      </ModalGlassContent>
    </Modal>
  );
}
