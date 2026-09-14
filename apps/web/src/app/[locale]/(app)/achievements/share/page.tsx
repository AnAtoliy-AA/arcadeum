import type { Metadata } from 'next';
import { AchievementShareView } from './AchievementShareView';

export const dynamic = 'force-dynamic';

interface AchievementSharePageProps {
  searchParams: Record<string, string | undefined>;
}

export async function generateMetadata({
  searchParams,
}: AchievementSharePageProps): Promise<Metadata> {
  const name = searchParams.name ?? 'Achievement';
  const rarity = searchParams.rarity ?? 'common';

  return {
    title: `${name} — Arcadeum Games`,
    description: `I unlocked the "${name}" achievement (${rarity}) on Arcadeum Games! Play free online board games with friends.`,
    openGraph: {
      title: `${name} — Arcadeum Games`,
      description: `Achievement unlocked: ${name} (${rarity})`,
      images: [
        {
          url: `/achievements/share?name=${encodeURIComponent(name)}&rarity=${rarity}${searchParams.game ? `&game=${encodeURIComponent(searchParams.game)}` : ''}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Arcadeum Games`,
      description: `Achievement unlocked: ${name} (${rarity})`,
    },
  };
}

export default function AchievementSharePage({
  searchParams,
}: AchievementSharePageProps) {
  return (
    <AchievementShareView
      name={searchParams.name ?? 'Achievement'}
      rarity={searchParams.rarity ?? 'common'}
      game={searchParams.game}
    />
  );
}
