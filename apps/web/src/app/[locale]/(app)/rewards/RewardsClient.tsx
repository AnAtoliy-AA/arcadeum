import RewardsPageContent, {
  type RewardsPageContentProps,
} from './RewardsPageContent';

export default function RewardsClient({
  t,
  socialRewardsStatus,
}: RewardsPageContentProps) {
  return <RewardsPageContent t={t} socialRewardsStatus={socialRewardsStatus} />;
}
