import React from 'react';
import { Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ServerLoadingNotice } from '@/shared/ui';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';
import { routes } from '@/shared/config/routes';
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
  const { progress, elapsedSeconds } = useServerWakeUpProgress(
    Boolean(actionBusy),
  );

  return (
    <LoadingContainer>
      {isLongPending ? (
        <ServerLoadingNotice
          title={t('games.room.pendingNotice.title')}
          message={t('games.room.pendingNotice.message')}
          progress={progress}
          elapsedSeconds={elapsedSeconds}
          supportLabel={t('common.actions.supportTeam')}
          onSupportClick={() => {
            window.location.href = routes.support;
          }}
        />
      ) : (
        <Text>{message || t('games.roomPage.loading')}</Text>
      )}
    </LoadingContainer>
  );
}
