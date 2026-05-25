import { useTranslation } from '@/shared/lib/useTranslation';
import { ServerLoadingNotice } from '@/shared/ui';
import { Loading, ServerWakeUpContainer, Spinner } from '../styles';

interface GamesLoadingProps {
  isLoadingLongPending: boolean;
}

export function GamesLoading({ isLoadingLongPending }: GamesLoadingProps) {
  const { t } = useTranslation();

  if (isLoadingLongPending) {
    return (
      <ServerWakeUpContainer data-testid="games-loading-wakeup">
        <ServerLoadingNotice
          title={t('games.lounge.loadingRooms')}
          message={t('games.room.pendingNotice.message')}
          progress={50}
          elapsedSeconds={0}
          supportLabel={t('common.actions.support')}
          onSupportClick={() => {}}
        />
      </ServerWakeUpContainer>
    );
  }

  return (
    <ServerWakeUpContainer data-testid="games-loading">
      <Loading>
        <Spinner aria-label="Loading" />
        <div>{t('games.lounge.loadingRooms')}</div>
      </Loading>
    </ServerWakeUpContainer>
  );
}
