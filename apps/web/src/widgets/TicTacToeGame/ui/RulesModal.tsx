'use client';

import { Dialog, YStack, Text, Button, XStack } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  boardSize: number;
  winLength: number;
}

export function RulesModal({
  open,
  onClose,
  boardSize,
  winLength,
}: RulesModalProps) {
  const { t } = useTranslation();
  return (
    <Dialog modal open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.5)" />
        <Dialog.Content
          key="content"
          bordered
          elevate
          maxWidth={520}
          padding="$5"
          gap="$3"
          backgroundColor="$background"
          borderRadius="$4"
        >
          <Dialog.Title>
            <Text fontSize="$6" fontWeight="800">
              {t('games.tic_tac_toe_v1.rules.title')}
            </Text>
          </Dialog.Title>
          <Dialog.Description>
            <YStack gap="$3">
              <Text>
                {t('games.tic_tac_toe_v1.rules.objective', {
                  winLength: String(winLength),
                })}
              </Text>
              <Text whiteSpace="pre-line" opacity={0.9}>
                {t('games.tic_tac_toe_v1.rules.steps')}
              </Text>
              <Text fontSize="$2" opacity={0.7}>
                {t('games.tic_tac_toe_v1.rules.winLengths')} ({boardSize}×
                {boardSize})
              </Text>
            </YStack>
          </Dialog.Description>
          <XStack justifyContent="flex-end">
            <Button onPress={onClose}>OK</Button>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
