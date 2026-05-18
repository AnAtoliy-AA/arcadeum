import CreateGameRoomClient from './CreateGameRoomClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Game Room',
  description: 'Create a new game room and invite your friends.',
};

export default function CreateGameRoomRoute() {
  return <CreateGameRoomClient />;
}
