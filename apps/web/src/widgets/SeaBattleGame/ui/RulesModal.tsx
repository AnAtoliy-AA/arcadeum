'use client';
import { YStack, XStack, Text } from 'tamagui';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from '@arcadeum/ui';
import { type TranslationKey } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function RulesModal({ isOpen, onClose, t }: RulesModalProps) {
  const shipsRaw = t('games.sea_battle_v1.rules.ships');
  const ships = shipsRaw
    .split('\n')
    .map((line) => {
      const match = line.match(/•\s+(.+)\s+\((\d+)\s+.*\)\s+-\s+(.+)/);
      if (match) return { name: match[1], size: match[2], description: match[3] };
      return null;
    })
    .filter(Boolean);

  const sections = [
    {
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
      header: t('games.sea_battle_v1.rules.headers.objective' as TranslationKey),
      text: t('games.sea_battle_v1.rules.objective' as TranslationKey),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.sea_battle_v1.rules.headers.gameplay' as TranslationKey),
      text: t('games.sea_battle_v1.rules.gameplay' as TranslationKey),
    },
    {
      icon: '⚓',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      header: t('games.sea_battle_v1.rules.headers.placement' as TranslationKey),
      text: t('games.sea_battle_v1.rules.placement' as TranslationKey),
    },
    {
      icon: '💥',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      header: t('games.sea_battle_v1.rules.headers.battle' as TranslationKey),
      text: t('games.sea_battle_v1.rules.battle' as TranslationKey),
    },
  ];

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalContent maxWidth={850} data-testid="rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.sea_battle_v1.rules.title' as TranslationKey)}</ModalTitle>
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
                <Text fontSize={18} lineHeight={27} color="#94a3b8" paddingLeft={54}>
                  {section.text}
                </Text>
              </YStack>
            ))}

            {/* Fleet section */}
            <YStack gap="$3">
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={42}
                  height={42}
                  borderRadius={12}
                  alignItems="center"
                  justifyContent="center"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  <Text fontSize={20}>🚢</Text>
                </YStack>
                <Text fontWeight="700" fontSize={18} color="#f1f5f9">
                  {t('games.sea_battle_v1.rules.headers.ships' as TranslationKey)}
                </Text>
              </XStack>
              <XStack flexWrap="wrap" gap="$3" paddingLeft={54}>
                {ships.map((ship, idx) => (
                  <YStack
                    key={idx}
                    backgroundColor="rgba(255,255,255,0.03)"
                    borderWidth={1}
                    borderColor="rgba(56,189,248,0.1)"
                    borderRadius={16}
                    padding="$3"
                    gap="$2"
                    flexBasis="45%"
                    flexGrow={1}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="700" color="#f8fafc">{ship?.name}</Text>
                      <XStack
                        backgroundColor="rgba(56,189,248,0.1)"
                        paddingHorizontal="$2"
                        paddingVertical={2}
                        borderRadius={8}
                      >
                        <Text color="#38bdf8" fontSize={11} fontWeight="700" textTransform="uppercase">
                          {ship?.size} {t('games.sea_battle_v1.table.state.cells' as TranslationKey)}
                        </Text>
                      </XStack>
                    </XStack>
                    <Text fontSize={14} color="#64748b" lineHeight={20}>
                      {ship?.description}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          </YStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
