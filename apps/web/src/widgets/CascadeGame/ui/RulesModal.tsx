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
      header: t('games.cascade_v1.rules.headers.objective'),
      body: t('games.cascade_v1.rules.objective'),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.cascade_v1.rules.headers.howToPlay'),
      body: t('games.cascade_v1.rules.steps'),
    },
    {
      icon: '⚡',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      header: t('games.cascade_v1.rules.headers.actionCards'),
      body: t('games.cascade_v1.rules.actionCards'),
    },
    {
      icon: '🔁',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      header: t('games.cascade_v1.rules.headers.stacking'),
      body: t('games.cascade_v1.rules.stacking'),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={640}>
        <ModalHeader>
          <ModalTitle>{t('games.cascade_v1.rules.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <YStack gap="$3">
            {sections.map((s) => (
              <YStack
                key={s.header}
                padding="$3"
                borderRadius="$3"
                style={{ background: s.gradient }}
              >
                <XStack gap="$3" alignItems="center" paddingBottom="$2">
                  <Text fontSize={22} aria-hidden>
                    {s.icon}
                  </Text>
                  <Text color="#fff" fontWeight="700" fontSize={16}>
                    {s.header}
                  </Text>
                </XStack>
                <Text color="#fff">{s.body}</Text>
              </YStack>
            ))}
          </YStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
