'use client';

import { Dialog, YStack, Text, Button, XStack } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface GameOverModalProps {
  open: boolean;
  onClose: () => void;
  result: 'won' | 'lost' | 'draw' | null;
  onRematch?: () => void;
  rematchLoading?: boolean;
}

export function TicTacToeGameOverModal({
  open,
  onClose,
  result,
  onRematch,
  rematchLoading = false,
}: GameOverModalProps) {
  const { t } = useTranslation();
  if (!result) return null;
  const headline =
    result === 'won'
      ? t('games.tic_tac_toe_v1.gameOver.won')
      : result === 'lost'
        ? t('games.tic_tac_toe_v1.gameOver.lost')
        : t('games.tic_tac_toe_v1.gameOver.draw');
  return (
    <Dialog modal open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" backgroundColor="rgba(0,0,0,0.55)" />
        <Dialog.Content
          key="content"
          bordered
          elevate
          padding="$5"
          maxWidth={420}
          gap="$3"
          backgroundColor="$background"
          borderRadius="$4"
        >
          <Dialog.Title>
            <Text fontSize="$7" fontWeight="800">
              {headline}
            </Text>
          </Dialog.Title>
          <YStack gap="$3">
            <XStack gap="$3" justifyContent="flex-end">
              <Button onPress={onClose}>
                {t('games.tic_tac_toe_v1.actions.leave')}
              </Button>
              {onRematch ? (
                <Button
                  onPress={onRematch}
                  disabled={rematchLoading}
                  opacity={rematchLoading ? 0.6 : 1}
                >
                  {t('games.tic_tac_toe_v1.actions.rematch')}
                </Button>
              ) : null}
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
