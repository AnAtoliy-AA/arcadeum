'use client';

import { YStack, XStack, Text } from 'tamagui';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  const { t } = useTranslation();

  const sections = [
    {
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      header: t('games.checkers_v1.rules.headers.objective'),
      body: t('games.checkers_v1.rules.objective'),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.checkers_v1.rules.headers.howToPlay'),
      body: t('games.checkers_v1.rules.steps'),
    },
    {
      icon: '👑',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      header: t('games.checkers_v1.rules.headers.kingPromotion'),
      body: t('games.checkers_v1.rules.kingPromotion'),
    },
    {
      icon: '🔄',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      header: t('games.checkers_v1.rules.headers.backwardCaptures'),
      body: t('games.checkers_v1.rules.backwardCaptures'),
    },
    {
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      header: t('games.checkers_v1.rules.headers.forcedCaptures'),
      body: t('games.checkers_v1.rules.forcedCaptures'),
    },
    {
      icon: '🏆',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      header: t('games.checkers_v1.rules.headers.winConditions'),
      body: t('games.checkers_v1.rules.winConditions'),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={720} data-testid="checkers-rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.checkers_v1.rules.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <YStack gap="$6">
            {sections.map((section) => (
              <YStack key={section.header} gap="$3">
                <XStack alignItems="center" gap="$3">
                  <YStack
                    width={42}
                    height={42}
                    borderRadius={12}
                    alignItems="center"
                    justifyContent="center"
                    style={{ background: section.gradient }}
                  >
                    <Text fontSize={20}>{section.icon}</Text>
                  </YStack>
                  <Text fontWeight="700" fontSize={18} color="#f1f5f9">
                    {section.header}
                  </Text>
                </XStack>
                <Text
                  fontSize={16}
                  lineHeight={26}
                  color="#cbd5e1"
                  paddingLeft={54}
                  whiteSpace="pre-line"
                >
                  {section.body}
                </Text>
              </YStack>
            ))}
          </YStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
