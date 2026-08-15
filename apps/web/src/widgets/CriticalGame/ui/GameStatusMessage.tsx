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

function EmptyState({ children }: { children?: React.ReactNode }) {
  return (
    <div className="box-border flex flex-col items-center justify-center gap-3 rounded-[20px] border border-[rgba(255,255,255,0.14)] bg-[rgba(15,23,42,0.55)] p-8 backdrop-blur-[8px] mt-4">
      {children}
    </div>
  );
}
