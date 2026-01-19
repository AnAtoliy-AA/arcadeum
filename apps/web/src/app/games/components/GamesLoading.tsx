import { useTranslation } from '@/shared/lib/useTranslation';
import { ServerLoadingNotice } from '@/shared/ui/ServerLoadingNotice';
import { Loading, ServerWakeUpContainer, Spinner } from '../styles';

interface GamesLoadingProps {
  isLoadingLongPending: boolean;
  loadingProgress: number;
  loadingElapsedSeconds: number;
}

export function GamesLoading({
  isLoadingLongPending,
  loadingProgress,
  loadingElapsedSeconds,
}: GamesLoadingProps) {
  const { t } = useTranslation();

  if (isLoadingLongPending) {
    return (
      <ServerWakeUpContainer>
        <ServerLoadingNotice
          pendingProgress={loadingProgress}
          pendingElapsedSeconds={loadingElapsedSeconds}
        />
      </ServerWakeUpContainer>
    );
  }

  return (
    <ServerWakeUpContainer>
      <Loading>
        <Spinner aria-label="Loading" />
        <div>{t('games.lounge.loadingRooms')}</div>
      </Loading>
    </ServerWakeUpContainer>
  );
}
