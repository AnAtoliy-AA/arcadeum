import { styled, YStack, Text } from 'tamagui';

interface GameStatusMessageProps {
  currentPlayerAlive: boolean;
  isGameOver: boolean;
  t: (key: string) => string;
}

export function GameStatusMessage({
  currentPlayerAlive,
  isGameOver,
  t,
}: GameStatusMessageProps) {
  // Game over state is now handled by GameResultModal
  if (isGameOver) {
    return null;
  }

  // Player eliminated but game continues
  if (!currentPlayerAlive) {
    return (
      <EmptyState>
        <Text fontSize={64}>💀</Text>
        <YStack alignItems="center">
          <Text fontSize={20} fontWeight="bold">
            {t('games.table.eliminated.title')}
          </Text>
        </YStack>
        <Text fontSize={16}>{t('games.table.eliminated.message')}</Text>
      </EmptyState>
    );
  }

  return null;
}

const EmptyState = styled(YStack, {
  name: 'EmptyState',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  padding: '$8',
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(8px)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.14)',
  marginTop: '$4',
});
