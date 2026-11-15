import type { PageTranslations } from '@/shared/i18n/page-translations';
import type { LeaderboardSnapshot } from '@/entities/leaderboard/model/types';
import LeaderboardsPageContent from './LeaderboardsPageContent';

const LeaderboardsClient = ({
  t,
  selfId,
  accessToken,
  initialData,
}: {
  t?: PageTranslations;
  selfId?: string;
  accessToken?: string;
  initialData?: LeaderboardSnapshot | null;
}) => {
  return (
    <LeaderboardsPageContent
      t={t}
      selfId={selfId}
      accessToken={accessToken}
      initialData={initialData}
    />
  );
};

export default LeaderboardsClient;
