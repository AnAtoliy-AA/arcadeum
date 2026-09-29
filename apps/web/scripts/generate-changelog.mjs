import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANGELOG_PATH = path.resolve(__dirname, '../../../CHANGELOG.md');
const OUT_PATH = path.resolve(
  __dirname,
  '../src/app/[locale]/(app)/changelog/generated-changelog.json',
);

function parseChangelog(content) {
  const entries = [];
  const lines = content.split('\n');
  let current = null;
  let currentSection = null;

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

async function main() {
  if (!existsSync(CHANGELOG_PATH)) {
    if (existsSync(OUT_PATH)) {
      console.log(
        `[generate-changelog] CHANGELOG_PATH not found, using existing ${OUT_PATH}`,
      );
      return;
    }
    console.error(`[generate-changelog] File not found: ${CHANGELOG_PATH}`);
    process.exit(1);
  }

  const content = await readFile(CHANGELOG_PATH, 'utf8');
  const entries = parseChangelog(content);
  await writeFile(OUT_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  console.log(
    `[generate-changelog] Successfully generated ${OUT_PATH} (${entries.length} versions)`,
  );
}

void main();
