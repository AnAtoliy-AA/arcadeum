'use client';

import { LinkButton } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { routes } from '@/shared/config/routes';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';
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
  ServerLoadingActions,
} from './styles';

interface ServerLoadingNoticeProps {
  actionBusy?: string | null;
  pendingProgress?: number;
  pendingElapsedSeconds?: number;
}

export function ServerLoadingNotice({
  actionBusy,
  pendingProgress: propProgress,
  pendingElapsedSeconds: propElapsedSeconds,
}: ServerLoadingNoticeProps) {
  const { t } = useTranslation();
  const { progress: hookProgress, elapsedSeconds: hookElapsedSeconds } =
    useServerWakeUpProgress(Boolean(actionBusy));

  const pendingProgress = propProgress ?? hookProgress;
  const pendingElapsedSeconds = propElapsedSeconds ?? hookElapsedSeconds;

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
      <ServerLoadingActions>
        <LinkButton href={routes.support} variant="secondary" size="sm">
          {t('common.actions.supportTeam')}
        </LinkButton>
      </ServerLoadingActions>
    </ServerLoadingMessage>
  );
}
