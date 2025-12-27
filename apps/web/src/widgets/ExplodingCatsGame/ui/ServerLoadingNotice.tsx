'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ServerLoadingMessage,
  ServerLoadingHeader,
  ServerLoadingSpinner,
  ServerLoadingTitle,
  ServerLoadingText,
  ServerLoadingProgressBar,
  ServerLoadingFooter,
  ServerLoadingPercentage,
  ServerLoadingTimer,
} from './styles';

interface ServerLoadingNoticeProps {
  pendingProgress: number;
  pendingElapsedSeconds: number;
}

export function ServerLoadingNotice({
  pendingProgress,
  pendingElapsedSeconds,
}: ServerLoadingNoticeProps) {
  const { t } = useTranslation();

  return (
    <ServerLoadingMessage>
      <ServerLoadingHeader>
        <ServerLoadingSpinner />
        <ServerLoadingTitle>
          {t('games.room.pendingNotice.title')}
        </ServerLoadingTitle>
      </ServerLoadingHeader>
      <ServerLoadingText>
        {t('games.room.pendingNotice.message')}
      </ServerLoadingText>
      <ServerLoadingProgressBar $progress={pendingProgress} />
      <ServerLoadingFooter>
        <ServerLoadingPercentage>{pendingProgress}%</ServerLoadingPercentage>
        <ServerLoadingTimer>{pendingElapsedSeconds}s</ServerLoadingTimer>
      </ServerLoadingFooter>
    </ServerLoadingMessage>
  );
}
