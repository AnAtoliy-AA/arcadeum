import { getTranslations } from '@/shared/i18n/server';
import type { Metadata } from 'next';
import PlayerProfileClient from './PlayerProfileClient';

export const metadata: Metadata = {
  title: 'Player profile',
  description: 'Player rank, stats, and recent matches.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const messages = await getTranslations();
  const t = messages.pages?.leaderboards;
  return <PlayerProfileClient id={id} t={t} />;
}
