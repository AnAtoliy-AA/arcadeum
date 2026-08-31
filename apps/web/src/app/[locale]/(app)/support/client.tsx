import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { SupportPageProps } from './SupportPage';

const SupportPageDynamic = dynamic<SupportPageProps>(
  () => import('./SupportPage').then((mod) => mod.default),
  {
    // Server-rendered so crawlers and AI engines see the page H1/content.
    loading: () => <PageLoading layout="grid" />,
  },
);

export default function SupportClient({
  appName,
  supportT,
  teamMembers,
  actions,
}: SupportPageProps) {
  return (
    <SupportPageDynamic
      appName={appName}
      supportT={supportT}
      teamMembers={teamMembers}
      actions={actions}
    />
  );
}
