import { readFile } from 'fs/promises';
import { join } from 'path';

export type FeatureItem = {
  text: string;
  isTable: boolean;
  tableHeaders?: string[];
  tableRows?: string[][];
};

export type FeatureSubsection = {
  title: string;
  items: FeatureItem[];
};

export type FeatureCategory =
  'games' | 'social' | 'economy' | 'security' | 'seo' | 'platform';

export type FeatureSection = {
  number: number;
  id: string;
  title: string;
  category: FeatureCategory;
  icon: string;
  badge: string;
  subsections: FeatureSubsection[];
  totalCount: number;
};

const SECTION_METADATA: Record<
  number,
  { category: FeatureCategory; icon: string; badge: string }
> = {
  1: { category: 'games', icon: '🎮', badge: '20+ Games' },
  2: { category: 'games', icon: '⚡', badge: 'Smart Matchmaking' },
  3: { category: 'social', icon: '👥', badge: 'Clans & Friends' },
  4: { category: 'social', icon: '🏆', badge: 'Ranked ELO' },
  5: { category: 'social', icon: '🎁', badge: 'Battle Pass & Quests' },
  6: { category: 'economy', icon: '💎', badge: 'Gems & Solana Pay' },
  7: { category: 'social', icon: '⚔️', badge: 'Tournaments' },
  8: { category: 'security', icon: '🔌', badge: 'WebSocket AES-GCM' },
  9: { category: 'security', icon: '🛡️', badge: 'OAuth & RBAC' },
  10: { category: 'security', icon: '♿', badge: 'WCAG AAA / A11y' },
  11: { category: 'seo', icon: '🌐', badge: '5 Locales i18n' },
  12: { category: 'platform', icon: '📱', badge: 'Workbox PWA' },
  13: { category: 'seo', icon: '🔍', badge: 'Google Search & JSON-LD' },
  14: { category: 'seo', icon: '🤖', badge: 'AI & llms.txt' },
  15: { category: 'platform', icon: '📊', badge: 'Core Web Vitals' },
  16: { category: 'games', icon: '🎨', badge: '13 Visual Themes' },
  17: { category: 'platform', icon: '⚙️', badge: 'Admin Suite' },
  18: { category: 'seo', icon: '📝', badge: 'Blog & Guides' },
  19: { category: 'platform', icon: '⚖️', badge: 'Public Domain' },
  20: { category: 'platform', icon: '📲', badge: 'React Native & Expo' },
  21: { category: 'platform', icon: '🧩', badge: '63+ UI Components' },
  22: { category: 'platform', icon: '🏗️', badge: 'NestJS + Redis' },
};

const CANDIDATE_PATHS = [
  join(process.cwd(), 'docs', 'FEATURES.md'),
  join(process.cwd(), '..', '..', 'docs', 'FEATURES.md'),
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export async function getFeaturesData(): Promise<FeatureSection[]> {
  for (const filePath of CANDIDATE_PATHS) {
    try {
      const content = await readFile(filePath, 'utf-8');
      if (content) {
        return parseFeatures(content);
      }
    } catch {
      continue;
    }
  }
  return [];
}

export function parseFeatures(content: string): FeatureSection[] {
  const sections: FeatureSection[] = [];
  const blocks = content.split(/\n---\n/);

  for (const block of blocks) {
    const lines = block.split('\n');
    const headerLineIdx = lines.findIndex((l) =>
      /^##\s+(\d+)\.\s+(.+)/.test(l.trim()),
    );
    if (headerLineIdx === -1) continue;

    const headerMatch = lines[headerLineIdx]
      .trim()
      .match(/^##\s+(\d+)\.\s+(.+)/);
    if (!headerMatch) continue;

    const number = parseInt(headerMatch[1], 10);
    const title = headerMatch[2].trim();
    const subsections = parseSubsections(lines.slice(headerLineIdx + 1));

    if (subsections.length > 0) {
      const meta = SECTION_METADATA[number] ?? {
        category: 'platform' as FeatureCategory,
        icon: '✨',
        badge: `Section ${number}`,
      };

      const totalCount = subsections.reduce(
        (sum, sub) => sum + sub.items.length,
        0,
      );

      sections.push({
        number,
        id: `section-${number}-${slugify(title)}`,
        title,
        category: meta.category,
        icon: meta.icon,
        badge: meta.badge,
        subsections,
        totalCount,
      });
    }
  }

  return sections;
}

function parseSubsections(lines: string[]): FeatureSubsection[] {
  const subsections: FeatureSubsection[] = [];
  let currentSubsection: FeatureSubsection | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const subMatch = line.match(/^###\s+(.+)/);

    if (subMatch) {
      if (currentSubsection) subsections.push(currentSubsection);
      currentSubsection = { title: subMatch[1].trim(), items: [] };
      i++;
      continue;
    }

    if (line.startsWith('|') && currentSubsection) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const table = parseTable(tableLines);
      if (table) currentSubsection.items.push(table);
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch && currentSubsection) {
      currentSubsection.items.push({
        text: bulletMatch[1].trim(),
        isTable: false,
      });
      i++;
      continue;
    }

    i++;
  }

  if (currentSubsection) subsections.push(currentSubsection);

  if (
    subsections.length === 0 &&
    lines.some((l) => l.trim().startsWith('-') || l.trim().startsWith('|'))
  ) {
    const items: FeatureItem[] = [];
    let j = 0;
    while (j < lines.length) {
      const line = lines[j].trim();
      if (line.startsWith('|')) {
        const tableLines: string[] = [];
        while (j < lines.length && lines[j].trim().startsWith('|')) {
          tableLines.push(lines[j].trim());
          j++;
        }
        const table = parseTable(tableLines);
        if (table) items.push(table);
        continue;
      }
      const bulletMatch = line.match(/^[-*]\s+(.+)/);
      if (bulletMatch) {
        items.push({ text: bulletMatch[1].trim(), isTable: false });
      }
      j++;
    }
    if (items.length > 0) {
      subsections.push({ title: '', items });
    }
  }

  return subsections;
}

function parseTable(lines: string[]): FeatureItem | null {
  if (lines.length < 2) return null;

  const parseRow = (line: string) =>
    line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const separatorIdx = lines.findIndex((l) => /^\|[\s-]+\|/.test(l));
  const dataLines =
    separatorIdx >= 0 ? lines.slice(separatorIdx + 1) : lines.slice(1);
  const rows = dataLines.map(parseRow);

  return {
    text: headers.join(' | '),
    isTable: true,
    tableHeaders: headers,
    tableRows: rows,
  };
}
