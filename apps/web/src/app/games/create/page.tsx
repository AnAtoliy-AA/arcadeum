import type { Metadata } from 'next';

import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import CreateGameRoomClient from './CreateGameRoomClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Create Game Room',
    description: 'Create a new game room and invite your friends.',
    path: routes.gameCreate,
    index: false,
    locale,
  });
}

export default function CreateGameRoomRoute() {
  return <CreateGameRoomClient />;
}
