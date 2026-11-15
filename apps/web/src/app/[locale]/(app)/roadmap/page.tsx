import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { getRoadmapData, type RoadmapData } from './roadmap-parser';
import RoadmapClient from './RoadmapClient';
import { TIERS, PHASES, STATS } from './roadmap-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${appConfig.siteUrl}/${locale}/roadmap`;
  return {
    title: `Roadmap - ${appConfig.appName}`,
    description: `Explore the ${appConfig.appName} platform expansion roadmap: new games, ranked play, matchmaking, and more coming soon.`,
    openGraph: { title: `Roadmap - ${appConfig.appName}`, url },
    alternates: { canonical: url },
  };
}

export default async function RoadmapPage() {
  let roadmapData: RoadmapData;
  try {
    roadmapData = await getRoadmapData();
  } catch {
    roadmapData = {
      tiers: TIERS,
      phases: PHASES,
      stats: STATS,
    };
  }
  return <RoadmapClient initialData={roadmapData} />;
}
