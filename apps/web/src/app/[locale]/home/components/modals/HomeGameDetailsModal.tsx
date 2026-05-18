'use client';

import React, { useState, useMemo } from 'react';
import { YStack, XStack, Text, styled, H4, SizableText } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
import { LinkButton } from '@/shared/ui';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLanguage } from '@/shared/i18n/context';

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
});

const HeaderBackgroundEmoji = styled(YStack, {
  position: 'absolute',
  top: -20,
  right: -20,
  opacity: 0.1,
  pointerEvents: 'none',
  zIndex: 0,
});

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
  const routes = useRoutes();
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
    <YStack gap="$4" position="relative" zIndex={1}>
      {rulesData.map((rule) => (
        <XStack
          key={rule.id}
          backgroundColor="rgba(21,23,24,0.5)"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={20}
          padding="$5"
          gap="$5"
          alignItems="flex-start"
        >
          <YStack
            width={44}
            height={44}
            borderRadius={12}
            background={
              game?.gradient ?? 'linear-gradient(135deg,#ff4d4d,#f9cb28)'
            }
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            boxShadow="0 4px 12px rgba(0,0,0,0.2)"
          >
            <SizableText fontWeight="900" size="$4" color="white">
              {rule.index}
            </SizableText>
          </YStack>
          <YStack gap="$2" flex={1}>
            <H4
              role="heading"
              aria-level={4}
              fontWeight="700"
              size="$5"
              color="$color"
              lineHeight={24}
            >
              {rule.name}
            </H4>
            <SizableText color="$color" opacity={0.7} size="$3" lineHeight={20}>
              {rule.description}
            </SizableText>
          </YStack>
        </XStack>
      ))}
    </YStack>
  );

  const renderGameInfo = () => {
    if (!game) return null;

    return (
      <YStack gap="$5" position="relative" zIndex={1}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {game.variants.map((v) => {
            const active = !v.disabled;
            return (
              <YStack
                key={v.id}
                borderRadius={16}
                padding="$4"
                gap="$3"
                opacity={v.disabled ? 0.6 : 1}
                borderWidth={1}
                borderColor={active ? '$borderColor' : 'transparent'}
                hoverStyle={
                  active
                    ? { backgroundColor: '$backgroundHover', scale: 1.05 }
                    : undefined
                }
              >
                <Text color="$color" fontWeight="700" fontSize="$4">
                  {t(v.nameKey) || v.id}
                </Text>
                <SizableText
                  fontSize={11}
                  fontWeight="800"
                  textTransform="uppercase"
                  letterSpacing={1}
                  paddingHorizontal="$3"
                  paddingVertical="$1"
                  borderRadius={6}
                  backgroundColor={
                    active ? 'rgba(122,215,255,0.12)' : 'rgba(236,239,238,0.12)'
                  }
                  color={active ? '#7ad7ff' : 'rgba(236,239,238,0.45)'}
                  width="fit-content"
                >
                  {active
                    ? (homeCopy.gameAvailableNow ?? 'Playable')
                    : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                </SizableText>
              </YStack>
            );
          })}
        </div>
      </YStack>
    );
  };

  if (!isOpen || !game) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalGlassContent maxWidth="800px">
        <style>{tabStyles}</style>
        <HeaderBackgroundEmoji>
          <span style={{ fontSize: '10rem', filter: 'blur(4px)' }}>
            {game.emoji}
          </span>
        </HeaderBackgroundEmoji>
        <ModalHeader onClose={onClose}>
          <ModalTitle>
            <span
              className="text-gradient"
              style={{
                background:
                  game.gradient ??
                  'linear-gradient(135deg, #ff4d4d 0%, #f9cb28 100%)',
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
            <SizableText color="rgba(236, 239, 238, 0.7)" fontSize="$3">
              {locale.toUpperCase()} •{' '}
              {t(`games.shared.category.${game.type}Game` as TranslationKey)}
            </SizableText>
            <LinkButton
              href={`${routes.gameCreate}?gameId=${game.id}`}
              aria-label={`${homeCopy.gamePlayButton ?? 'Play Now!'} ${t(game.nameKey)}`}
            >
              {homeCopy.gamePlayButton ?? 'Play Now!'}
            </LinkButton>
          </XStack>
        </ModalBody>
      </ModalGlassContent>
    </Modal>
  );
}
