'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const CreateGameRoomPage = dynamic(
  () => import('@/features/games/ui/create/CreateGameRoomPage'),
  {
    ssr: false,
    loading: () => <PageLoading />,
  },
);

export default function CreateGameRoomRoute() {
  return <CreateGameRoomPage />;
}
