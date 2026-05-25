import CreateGameRoomClient from './CreateGameRoomClient';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'gameCreate' })
    : {};
}

export default function CreateGameRoomRoute() {
  return <CreateGameRoomClient />;
}
