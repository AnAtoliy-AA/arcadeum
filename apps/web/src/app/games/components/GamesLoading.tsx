import { useTranslation } from '@/shared/lib/useTranslation';
import { ServerLoadingNotice } from '@/shared/ui/ServerLoadingNotice';
import { Loading, ServerWakeUpContainer, Spinner } from '../styles';

interface GamesLoadingProps {
  isLoadingLongPending: boolean;
}

export function GamesLoading({ isLoadingLongPending }: GamesLoadingProps) {
  const { t } = useTranslation();

  if (isLoadingLongPending) {
    return (
      <ServerWakeUpContainer data-testid="games-loading-wakeup">
        <ServerLoadingNotice actionBusy="loading_games" />
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
