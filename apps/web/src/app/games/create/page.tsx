'use client';

import dynamic from 'next/dynamic';

const CreateGameRoomPage = dynamic(
  () =>
    import('@/features/games/ui/create/CreateGameRoomPage').then(
      (mod) => mod.CreateGameRoomPage,
    ),
  { ssr: false },
);

export default function CreateGameRoomRoute() {
  return <CreateGameRoomPage />;
}
