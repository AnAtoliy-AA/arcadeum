#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const GAMES = [
  {
    id: 'backgammon',
    name: 'Backgammon',
    msg: 'backgammon',
    page: 'backgammon',
  },
  { id: 'cascade', name: 'Cascade', msg: 'cascade', page: 'cascade' },
  { id: 'cat-dash', name: 'Cat Dash', msg: 'cat-dash', page: 'cat-dash' },
  { id: 'checkers', name: 'Checkers', msg: 'checkers', page: 'checkers' },
  { id: 'chess', name: 'Chess', msg: 'chess', page: 'chess' },
  { id: 'critical', name: 'Critical', msg: 'critical', page: 'critical' },
  { id: 'game-2048', name: '2048', msg: 'game-2048', page: '2048' },
  { id: 'glimworm', name: 'Glimworm', msg: 'glimworm', page: 'glimworm' },
  { id: 'go', name: 'Go', msg: 'go', page: 'go' },
  { id: 'hearts', name: 'Hearts', msg: 'hearts', page: 'hearts' },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    msg: 'minesweeper',
    page: 'minesweeper',
  },
  { id: 'pachisi', name: 'Pachisi', msg: 'pachisi', page: 'pachisi' },
  {
    id: 'sea-battle',
    name: 'Sea Battle',
    msg: 'sea-battle',
    page: 'sea-battle',
  },
  {
    id: 'battleship',
    name: 'Battleship',
    msg: 'sea-battle',
    page: 'battleship',
  },
  { id: 'solitaire', name: 'Solitaire', msg: 'solitaire', page: 'solitaire' },
  { id: 'spades', name: 'Spades', msg: 'spades', page: 'spades' },
  { id: 'sudoku', name: 'Sudoku', msg: 'sudoku', page: 'sudoku' },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    msg: 'tic-tac-toe',
    page: 'tic-tac-toe',
  },
];

function extractSectionBlock(content, sectionName) {
  const marker = `${sectionName}:`;
  const idx = content.indexOf(marker);
  if (idx === -1) return '';
  const openIdx = content.indexOf('{', idx);
  if (openIdx === -1) return '';
  let depth = 0;
  let inString = false;
  let quoteChar = '';
  for (let i = openIdx; i < content.length; i++) {
    const ch = content[i];
    if (inString) {
      if (ch === quoteChar && content[i - 1] !== '\\') {
        inString = false;
      }
    } else {
      if (ch === "'" || ch === '"' || ch === '`') {
        inString = true;
        quoteChar = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          return content.substring(openIdx, i + 1);
        }
      }
    }
  }
  return '';
}

function auditGame(game) {
  const root = process.cwd();
  let msgPath = path.join(
    root,
    'apps/web/src/shared/i18n/messages/games',
    game.msg,
    'en.ts',
  );
  let msgContent = '';
  if (fs.existsSync(msgPath)) {
    msgContent = fs.readFileSync(msgPath, 'utf8');
    if (msgContent.includes('./landing-en')) {
      const splitPath = path.join(
        root,
        'apps/web/src/shared/i18n/messages/games',
        game.msg,
        'landing-en.ts',
      );
      if (fs.existsSync(splitPath)) {
        msgContent = fs.readFileSync(splitPath, 'utf8');
      }
    }
  }

  const faqBlock = extractSectionBlock(msgContent, 'faq');
  const faqCount = (faqBlock.match(/question:\s*['"`]/g) || []).length;

  const highlightsBlock =
    extractSectionBlock(msgContent, 'highlights') ||
    extractSectionBlock(msgContent, 'features');
  let highlightCount = (highlightsBlock.match(/title:\s*['"`]/g) || []).length;
  if (highlightCount === 0) {
    const pageDir = path.join(
      root,
      'apps/web/src/app/[locale]/(app)/games',
      game.page,
    );
    if (fs.existsSync(pageDir)) {
      const dirFiles = fs.readdirSync(pageDir);
      for (const f of dirFiles) {
        if (f.endsWith('LandingView.tsx') || f.endsWith('Landing.tsx')) {
          const vContent = fs.readFileSync(path.join(pageDir, f), 'utf8');
          const hMatch = vContent.match(/highlights\s*=\s*\[([\s\S]*?)\];/);
          if (hMatch) {
            highlightCount = (hMatch[1].match(/title:\s*['"`]/g) || []).length;
            break;
          }
        }
      }
    }
  }

  const stepsBlock = extractSectionBlock(msgContent, 'steps');
  const stepsCount = (stepsBlock.match(/title:\s*['"`]/g) || []).length;

  const pagePath = path.join(
    root,
    'apps/web/src/app/[locale]/(app)/games',
    game.page,
    'page.tsx',
  );
  let pageContent = '';
  if (fs.existsSync(pagePath)) {
    pageContent = fs.readFileSync(pagePath, 'utf8');
  }

  const hasSchema =
    pageContent.includes('buildGameLandingJsonLd') ||
    pageContent.includes('JsonLd');
  const hasFaqSchema =
    pageContent.includes('faqs:') || pageContent.includes('faq:');
  const hasHowToSchema =
    pageContent.includes('howTo:') || pageContent.includes('HowTo');

  let score = 0;
  score += Math.min(faqCount * 5, 50);
  score += hasSchema ? 20 : 0;
  score += hasFaqSchema ? 10 : 0;
  score += hasHowToSchema ? 10 : 0;
  score += Math.min(highlightCount * 2.5, 10);

  const missing = [];
  if (faqCount < 10) missing.push(`FAQ items (${faqCount}/10)`);
  if (!hasSchema) missing.push('JSON-LD Schema');
  if (!hasFaqSchema) missing.push('FAQ Schema');
  if (!hasHowToSchema) missing.push('HowTo Schema');
  if (highlightCount < 3) missing.push(`Highlights (${highlightCount}/3)`);

  return {
    id: game.id,
    name: game.name,
    faqCount,
    highlightCount,
    stepsCount,
    hasSchema,
    hasFaqSchema,
    hasHowToSchema,
    score: Math.round(score),
    passed: faqCount >= 10 && hasSchema,
    missing,
  };
}

function run() {
  const isJson = process.argv.includes('--json');
  const results = GAMES.map(auditGame);

  if (isJson) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
    const allPassed = results.every((r) => r.passed);
    process.exit(allPassed ? 0 : 1);
  }

  process.stdout.write('\n📋 Arcadeum Games Content Gap Audit (Agent 9)\n');
  process.stdout.write(
    '========================================================================================\n',
  );
  process.stdout.write(
    'Game'.padEnd(16) +
      'Score'.padEnd(8) +
      'FAQ'.padEnd(8) +
      'Features'.padEnd(12) +
      'Schema'.padEnd(10) +
      'Status'.padEnd(10) +
      'Gaps\n',
  );
  process.stdout.write(
    '----------------------------------------------------------------------------------------\n',
  );

  let failCount = 0;
  for (const r of results) {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    if (!r.passed) failCount++;
    const gaps = r.missing.length > 0 ? r.missing.join(', ') : 'None';
    process.stdout.write(
      r.name.padEnd(16) +
        `${r.score}/100`.padEnd(8) +
        `${r.faqCount}`.padEnd(8) +
        `${r.highlightCount}`.padEnd(12) +
        (r.hasSchema ? 'Yes' : 'No').padEnd(10) +
        status.padEnd(10) +
        gaps +
        '\n',
    );
  }

  process.stdout.write(
    '========================================================================================\n',
  );
  if (failCount > 0) {
    process.stdout.write(
      `❌ Audit failed: ${failCount} game landing(s) below required content thresholds.\n\n`,
    );
    process.exit(1);
  } else {
    process.stdout.write(
      '✅ All 18 game landing pages meet or exceed all content depth thresholds!\n\n',
    );
    process.exit(0);
  }
}

run();
