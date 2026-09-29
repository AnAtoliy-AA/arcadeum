import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROADMAP_PATH = path.resolve(__dirname, '../../../docs/ROADMAP.md');
const OUT_PATH = path.resolve(
  __dirname,
  '../src/app/[locale]/(app)/roadmap/generated-roadmap.json',
);

const TIER_META = {
  1: {
    label: 'Quick Wins',
    effort: '1-3 days each',
    color: '#22c55e',
    gradient:
      'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    icon: '⚡',
  },
  2: {
    label: 'Core Additions',
    effort: '2-7 days each',
    color: '#3b82f6',
    gradient:
      'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
    icon: '🎮',
  },
  3: {
    label: 'Card & Board Games',
    effort: '4-7 days each',
    color: '#a855f7',
    gradient:
      'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
    icon: '♠️',
  },
  4: {
    label: 'Community & Social',
    effort: '3-10 days each',
    color: '#f59e0b',
    gradient:
      'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    icon: '👥',
  },
  5: {
    label: 'Platform Polish',
    effort: '1-10 days each',
    color: '#ec4899',
    gradient:
      'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
    icon: '✨',
  },
  6: {
    label: 'Growth & SEO',
    effort: '2-5 days each',
    color: '#14b8a6',
    gradient:
      'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))',
    icon: '📈',
  },
  7: {
    label: 'Growth Acceleration',
    effort: '1-5 days each',
    color: '#06b6d4',
    gradient:
      'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))',
    icon: '🚀',
  },
  8: {
    label: 'Retention & Habit Loops',
    effort: '2-7 days each',
    color: '#8b5cf6',
    gradient:
      'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
    icon: '🔁',
  },
  9: {
    label: 'Performance & Latency',
    effort: '2-5 days each',
    color: '#f43f5e',
    gradient:
      'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(244,63,94,0.05))',
    icon: '⚡',
  },
};

const PHASE_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#f59e0b',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#06b6d4',
  '#8b5cf6',
  '#0ea5e9',
  '#d946ef',
  '#f43f5e',
];

function normalizeStatus(raw) {
  const clean = raw.toLowerCase().replace(/[*_]/g, '').trim();
  if (clean.includes('implemented') || clean.includes('completed')) {
    return 'implemented';
  }
  if (clean.includes('partial') || clean.includes('in progress')) {
    return 'partial';
  }
  return 'not_started';
}

function parseRoadmapMarkdown(content) {
  const lines = content.split('\n');

  const ticketStatuses = new Map();
  const tableRowRegex =
    /^\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/;

  for (const line of lines) {
    const match = line.match(tableRowRegex);
    if (!match) continue;
    const [, featureRaw, arcRaw, , statusRaw] = match;
    const featureName = featureRaw.trim();
    if (
      featureName === 'Feature' ||
      featureName.startsWith('---') ||
      featureName.startsWith(':-')
    ) {
      continue;
    }
    const arc = arcRaw.trim() === '—' ? undefined : arcRaw.trim();
    const status = normalizeStatus(statusRaw);

    const normalizedKey = featureName
      .replace(/^[0-9]+[A-Z]?\.\s*/, '')
      .toLowerCase();
    ticketStatuses.set(normalizedKey, { status, arc });
    if (arc) {
      ticketStatuses.set(arc.toLowerCase(), { status, arc });
    }
  }

  const tiers = [];
  let currentTierIndex = 0;
  let currentTier = null;
  let currentFeature = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const tierMatch = line.match(/^#{2,3}\s+TIER\s+(\d+)/i);
    if (tierMatch) {
      if (currentFeature && currentTier) {
        currentTier.features.push(currentFeature);
        currentFeature = null;
      }
      if (currentTier) {
        tiers.push(currentTier);
      }
      currentTierIndex = parseInt(tierMatch[1], 10);
      const meta = TIER_META[currentTierIndex] || {
        label: `Tier ${currentTierIndex}`,
        effort: 'Varies',
        color: '#6366f1',
        gradient:
          'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
        icon: '📋',
      };
      currentTier = {
        id: `tier${currentTierIndex}`,
        label: meta.label,
        effort: meta.effort,
        color: meta.color,
        gradient: meta.gradient,
        icon: meta.icon,
        features: [],
      };
      continue;
    }

    const featureMatch = line.match(
      /^#{3,4}\s+([0-9]+[A-Za-z]?\.)?\s*([^(^`]+)(?:`([^`]+)`)?/,
    );
    if (featureMatch && currentTier) {
      if (currentFeature) {
        currentTier.features.push(currentFeature);
      }
      const rawTitle = featureMatch[2].trim();
      const rawArc = featureMatch[3]?.trim();
      const lookupKey = rawTitle.toLowerCase();
      const statusInfo =
        ticketStatuses.get(lookupKey) ||
        (rawArc ? ticketStatuses.get(rawArc.toLowerCase()) : undefined);

      currentFeature = {
        title: rawTitle,
        desc: '',
        effort: '1-3 days',
        status: statusInfo?.status ?? 'not_started',
        arc: rawArc || statusInfo?.arc,
      };
      continue;
    }

    if (currentFeature && line.startsWith('**Effort:')) {
      const effortMatch = line.match(/\(([^)]+)\)/);
      if (effortMatch) {
        currentFeature.effort = effortMatch[1];
      }
      continue;
    }

    if (
      currentFeature &&
      line.length > 0 &&
      !line.startsWith('#') &&
      !line.startsWith('---') &&
      !line.startsWith('**Files')
    ) {
      if (!currentFeature.desc && !line.startsWith('**Effort')) {
        currentFeature.desc = line.replace(/^-\s*/, '').trim();
      }
    }
  }

  if (currentFeature && currentTier) {
    currentTier.features.push(currentFeature);
  }
  if (currentTier) {
    tiers.push(currentTier);
  }

  const phases = [];
  let phaseNum = 1;
  const phaseRowRegex =
    /^\|\s*\*\*Phase\s*(\d+)(?::\s*([^|*]+))?\*\*\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/i;

  for (const line of lines) {
    const match = line.match(phaseRowRegex);
    if (match) {
      const [, pNum, pTitle, featuresRaw, daysRaw, statusRaw] = match;
      const cleanStatus = statusRaw.replace(/\*\*/g, '').trim();
      phases.push({
        phase: parseInt(pNum, 10),
        title: (pTitle || '').trim(),
        features: featuresRaw.trim(),
        days: daysRaw.trim(),
        status: cleanStatus,
        color: PHASE_COLORS[(phaseNum - 1) % PHASE_COLORS.length],
      });
      phaseNum++;
    }
  }

  const allFeatures = tiers.flatMap((t) => t.features);
  const totalFeatures = allFeatures.length;
  const implementedCount = allFeatures.filter(
    (f) => f.status === 'implemented',
  ).length;
  const partialCount = allFeatures.filter((f) => f.status === 'partial').length;
  const plannedCount = allFeatures.filter(
    (f) => f.status === 'not_started',
  ).length;

  const stats = [
    { label: 'Features', value: totalFeatures.toString(), icon: '📋' },
    { label: 'Implemented', value: implementedCount.toString(), icon: '✅' },
    { label: 'In Progress', value: partialCount.toString(), icon: '⏳' },
    { label: 'Planned', value: plannedCount.toString(), icon: '🗺️' },
  ];

  return {
    tiers,
    phases,
    stats,
  };
}

async function main() {
  if (!existsSync(ROADMAP_PATH)) {
    console.error(`[generate-roadmap] File not found: ${ROADMAP_PATH}`);
    process.exit(1);
  }

  const content = await readFile(ROADMAP_PATH, 'utf8');
  const data = parseRoadmapMarkdown(content);
  await writeFile(OUT_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(
    `[generate-roadmap] Successfully generated ${OUT_PATH} (${data.tiers.length} tiers, ${data.phases.length} phases, ${data.stats.length} stats)`,
  );
}

void main();
