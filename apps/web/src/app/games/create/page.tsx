import CreateGameRoomClient from './CreateGameRoomClient';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Create Game Room',
  description: 'Create a new game room and invite your friends.',
  alternates: {
    canonical: routes.gameCreate,
  },
};

export default function CreateGameRoomRoute() {
  return <CreateGameRoomClient />;
}
