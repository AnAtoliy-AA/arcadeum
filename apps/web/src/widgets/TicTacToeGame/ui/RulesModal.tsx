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
  boardSize: number;
  winLength: number;
}

const BOARD_VARIANTS: Array<{ size: number; win: number }> = [
  { size: 3, win: 3 },
  { size: 5, win: 4 },
  { size: 7, win: 5 },
  { size: 9, win: 5 },
];

export function RulesModal({
  open,
  onClose,
  boardSize,
  winLength,
}: RulesModalProps) {
  const { t } = useTranslation();

  const sections = [
    {
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      header: t('games.tic_tac_toe_v1.rules.headers.objective'),
      body: t('games.tic_tac_toe_v1.rules.objective', {
        winLength: String(winLength),
      }),
    },
    {
      icon: '🎮',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      header: t('games.tic_tac_toe_v1.rules.headers.howToPlay'),
      body: t('games.tic_tac_toe_v1.rules.steps'),
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={720} data-testid="ttt-rules-modal">
        <ModalHeader onClose={onClose}>
          <ModalTitle>{t('games.tic_tac_toe_v1.rules.title')}</ModalTitle>
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

            <YStack gap="$3">
              <XStack alignItems="center" gap="$3">
                <YStack
                  width={42}
                  height={42}
                  borderRadius={12}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    background:
                      'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  }}
                >
                  <Text fontSize={20}>📏</Text>
                </YStack>
                <Text fontWeight="700" fontSize={18} color="#f1f5f9">
                  {t('games.tic_tac_toe_v1.rules.headers.boardSizes')}
                </Text>
              </XStack>
              <XStack flexWrap="wrap" gap="$3" paddingLeft={54}>
                {BOARD_VARIANTS.map((bv) => {
                  const active = bv.size === boardSize;
                  return (
                    <YStack
                      key={bv.size}
                      backgroundColor={
                        active
                          ? 'rgba(99,102,241,0.18)'
                          : 'rgba(255,255,255,0.03)'
                      }
                      borderWidth={1}
                      borderColor={
                        active
                          ? 'rgba(99,102,241,0.55)'
                          : 'rgba(255,255,255,0.08)'
                      }
                      borderRadius={14}
                      padding="$3"
                      gap="$2"
                      flexBasis="22%"
                      flexGrow={1}
                      minWidth={120}
                    >
                      <Text
                        fontWeight="800"
                        fontSize={20}
                        color={active ? '#c7d2fe' : '#f8fafc'}
                      >
                        {bv.size}×{bv.size}
                      </Text>
                      <Text fontSize={12} color="#94a3b8">
                        {t('games.tic_tac_toe_v1.rules.inARow', {
                          n: String(bv.win),
                        })}
                      </Text>
                    </YStack>
                  );
                })}
              </XStack>
              <Text
                fontSize={13}
                color="#94a3b8"
                paddingLeft={54}
                opacity={0.85}
              >
                {t('games.tic_tac_toe_v1.rules.winLengths')}
              </Text>
            </YStack>
          </YStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
