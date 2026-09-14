import { redirect } from 'next/navigation';
import { replayApi } from '@/features/replay/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function ReplayByRoomPage({ params }: PageProps) {
  const { roomId } = await params;
  const replay = await replayApi.getReplayByRoom(roomId, {
    timeout: SSR_TIMEOUT,
  });

  if (!replay) {
    redirect('/');
  }

  redirect(`/replay/${replay.replayId}`);
}
