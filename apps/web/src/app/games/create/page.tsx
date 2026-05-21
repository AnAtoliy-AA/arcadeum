import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import CreateGameRoomClient from './CreateGameRoomClient';

export const metadata: Metadata = buildMetadata({
  title: 'Create Game Room',
  description: 'Create a new game room and invite your friends.',
  path: routes.gameCreate,
  index: false,
});

export default function CreateGameRoomRoute() {
  return <CreateGameRoomClient />;
}
