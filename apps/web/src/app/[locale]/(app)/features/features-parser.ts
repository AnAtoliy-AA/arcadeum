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

export type FeatureSection = {
  number: number;
  title: string;
  subsections: FeatureSubsection[];
};

const FEATURES_PATH = join(process.cwd(), 'docs', 'FEATURES.md');

export async function getFeaturesData(): Promise<FeatureSection[]> {
  try {
    const content = await readFile(FEATURES_PATH, 'utf-8');
    return parseFeatures(content);
  } catch {
    return [];
  }
}

function parseFeatures(content: string): FeatureSection[] {
  const sections: FeatureSection[] = [];
  const blocks = content.split(/\n---\n/);

  for (const block of blocks) {
    const lines = block.split('\n');
    const headerMatch = lines[0]?.match(/^## (\d+)\.\s+(.+)/);
    if (!headerMatch) continue;

    const number = parseInt(headerMatch[1], 10);
    const title = headerMatch[2].trim();
    const subsections = parseSubsections(lines.slice(1));

    if (subsections.length > 0) {
      sections.push({ number, title, subsections });
    }
  }

  return sections;
}

function parseSubsections(lines: string[]): FeatureSubsection[] {
  const subsections: FeatureSubsection[] = [];
  let currentSubsection: FeatureSubsection | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const subMatch = line.match(/^###\s+(.+)/);

    if (subMatch) {
      if (currentSubsection) subsections.push(currentSubsection);
      currentSubsection = { title: subMatch[1].trim(), items: [] };
      i++;
      continue;
    }

    if (line.startsWith('| ') && currentSubsection) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('| ')) {
        tableLines.push(lines[i]);
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
    lines.some((l) => l.startsWith('- ') || l.startsWith('| '))
  ) {
    const items: FeatureItem[] = [];
    let j = 0;
    while (j < lines.length) {
      if (lines[j].startsWith('| ')) {
        const tableLines: string[] = [];
        while (j < lines.length && lines[j].startsWith('| ')) {
          tableLines.push(lines[j]);
          j++;
        }
        const table = parseTable(tableLines);
        if (table) items.push(table);
        continue;
      }
      const bulletMatch = lines[j].match(/^[-*]\s+(.+)/);
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
