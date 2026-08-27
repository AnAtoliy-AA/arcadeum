'use client';
import dynamic from 'next/dynamic';
import { PageLoading } from '@arcadeum/ui/components/LoadingState/PageLoading';
import type { TournamentBracketResponse } from '@/features/tournaments/api';

const TournamentDetailDynamic = dynamic(
  () => import('./TournamentDetailContent'),
  {
    ssr: false,
    loading: () => <PageLoading layout="standard" />,
  },
);

interface TournamentDetailClientProps {
  id: string;
  initialBracket: TournamentBracketResponse | null;
}

const TournamentDetailClient = ({
  id,
  initialBracket,
}: TournamentDetailClientProps) => {
  return <TournamentDetailDynamic id={id} initialBracket={initialBracket} />;
};

export default TournamentDetailClient;
