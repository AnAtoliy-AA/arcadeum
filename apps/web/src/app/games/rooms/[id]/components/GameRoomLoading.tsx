import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ServerLoadingNotice } from '@/shared/ui/ServerLoadingNotice';
import { LoadingContainer } from './styles';

interface GameRoomLoadingProps {
  isLongPending?: boolean;
  progress?: number;
  elapsedSeconds?: number;
  message?: string;
}

export function GameRoomLoading({
  isLongPending = false,
  progress = 0,
  elapsedSeconds = 0,
  message,
}: GameRoomLoadingProps) {
  const { t } = useTranslation();

  return (
    <LoadingContainer>
      {isLongPending ? (
        <ServerLoadingNotice
          pendingProgress={progress}
          pendingElapsedSeconds={elapsedSeconds}
        />
      ) : (
        message || t('games.roomPage.loading')
      )}
    </LoadingContainer>
  );
}
