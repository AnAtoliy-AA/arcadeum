import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import ChangelogClient from './ChangelogClient';
import generatedChangelog from './generated-changelog.json';

export type ChangelogEntry = {
  version: string;
  date: string;
  sections: { type: string; items: string[] }[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${appConfig.siteUrl}/${locale}/changelog`;
  return {
    title: `Changelog - ${appConfig.appName}`,
    description: 'View all changes, improvements, and fixes in Arcadeum.',
    openGraph: { title: `Changelog - ${appConfig.appName}`, url },
    alternates: { canonical: url },
  };
}

export default async function ChangelogPage() {
  const entries = (generatedChangelog as ChangelogEntry[]) ?? [];
  return <ChangelogClient entries={entries} />;
}
