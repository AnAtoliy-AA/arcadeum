import { styled, YStack } from 'tamagui';

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
        <span className="box-border text-[64px]">💀</span>
        <div className="box-border flex flex-col items-center">
          <span className="box-border text-[20px] font-bold">
            {t('games.table.eliminated.title')}
          </span>
        </div>
        <span className="box-border text-[16px]">
          {t('games.table.eliminated.message')}
        </span>
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
