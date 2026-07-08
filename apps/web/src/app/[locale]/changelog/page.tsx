import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { appConfig } from '@/shared/config/app-config';
import ChangelogClient from './ChangelogClient';

export type ChangelogEntry = {
  version: string;
  date: string;
  sections: { type: string; items: string[] }[];
};

function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = content.split('\n');
  let current: ChangelogEntry | null = null;
  let currentSection: { type: string; items: string[] } | null = null;

  for (const line of lines) {
    const versionMatch = line.match(/^## \[(.+?)\]\s*-?\s*(.*)/);
    if (versionMatch) {
      if (currentSection && current) current.sections.push(currentSection);
      if (current) entries.push(current);
      current = {
        version: versionMatch[1],
        date: versionMatch[2].trim(),
        sections: [],
      };
      currentSection = null;
      continue;
    }

    if (line.startsWith('### ') && current) {
      if (currentSection) current.sections.push(currentSection);
      currentSection = { type: line.slice(4).trim(), items: [] };
      continue;
    }

    if (line.startsWith('- ') && currentSection) {
      currentSection.items.push(line.slice(2).trim());
    }
  }

  if (currentSection && current) current.sections.push(currentSection);
  if (current) entries.push(current);

  return entries.filter((e) => e.version !== 'Unreleased');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${appConfig.siteUrl}/${locale}/changelog`;
  return {
    title: `Changelog — ${appConfig.appName}`,
    description: 'View all changes, improvements, and fixes in Arcadeum.',
    openGraph: { title: `Changelog — ${appConfig.appName}`, url },
    alternates: { canonical: url },
  };
}

export default async function ChangelogPage() {
  const file = join(process.cwd(), '..', '..', 'CHANGELOG.md');
  const raw = await readFile(file, 'utf-8');
  const entries = parseChangelog(raw);

  return <ChangelogClient entries={entries} />;
}
