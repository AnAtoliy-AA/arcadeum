import { useTranslation } from '@/shared/i18n/useTranslation';
import { ServerLoadingNotice, Skeleton } from '@arcadeum/ui';
import { ServerWakeUpContainer } from '../styles';

interface GamesLoadingProps {
  isLoadingLongPending: boolean;
}

const SKELETON_COUNT = 6;

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
    <>
      <span className="sr-only" role="status" data-testid="games-loading">
        {t('games.lounge.loadingRooms')}
      </span>
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <Skeleton
          key={i}
          className="h-[220px] w-full rounded-[20px]"
          data-testid="room-card-skeleton"
        />
      ))}
    </>
  );
}
