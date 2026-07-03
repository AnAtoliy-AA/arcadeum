import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import RoadmapClient from './RoadmapClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${appConfig.siteUrl}/${locale}/roadmap`;
  return {
    title: 'Roadmap — Arcadeum',
    description:
      'Explore the Arcadeum platform expansion roadmap — new games, ranked play, matchmaking, and more coming soon.',
    openGraph: { title: 'Roadmap — Arcadeum', url },
    alternates: { canonical: url },
  };
}

export default async function RoadmapPage() {
  return <RoadmapClient />;
}
