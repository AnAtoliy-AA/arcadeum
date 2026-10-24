import type { PageTranslations } from '@/shared/i18n/page-translations';
import LeaderboardsPageContent from './LeaderboardsPageContent';

const LeaderboardsClient = ({
  t,
  selfId,
  accessToken,
}: {
  t?: PageTranslations;
  selfId?: string;
  accessToken?: string;
}) => {
  return (
    <LeaderboardsPageContent t={t} selfId={selfId} accessToken={accessToken} />
  );
};

export default LeaderboardsClient;
