import React from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ServerLoadingNotice } from '@/shared/ui/ServerLoadingNotice';
import { LoadingContainer } from './styles';

interface GameRoomLoadingProps {
  isLongPending?: boolean;
  message?: string;
  actionBusy?: string | null;
}

export function GameRoomLoading({
  isLongPending = false,
  message,
  actionBusy = 'loading_room',
}: GameRoomLoadingProps) {
  const { t } = useTranslation();

  return (
    <LoadingContainer>
      {isLongPending ? (
        <ServerLoadingNotice actionBusy={actionBusy} />
      ) : (
        message || t('games.roomPage.loading')
      )}
    </LoadingContainer>
  );
}
