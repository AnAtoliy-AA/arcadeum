import RewardsPageContent, {
  type RewardsPageContentProps,
} from './RewardsPageContent';

export default function RewardsClient({
  t,
  socialRewardsStatus,
  dailyRewardStatus,
}: RewardsPageContentProps) {
  return (
    <RewardsPageContent
      t={t}
      socialRewardsStatus={socialRewardsStatus}
      dailyRewardStatus={dailyRewardStatus}
    />
  );
}
