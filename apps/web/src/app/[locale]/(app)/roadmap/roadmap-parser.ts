import { readFile } from 'fs/promises';
import { join } from 'path';

export type FeatureStatus = 'implemented' | 'partial' | 'not_started';

export type TierFeature = {
  title: string;
  desc: string;
  effort: string;
  status: FeatureStatus;
  arc?: string;
};

export type Tier = {
  id: string;
  label: string;
  effort: string;
  color: string;
  gradient: string;
  icon: string;
  features: TierFeature[];
};

export type Phase = {
  phase: number;
  features: string;
  days: string;
  color: string;
  status?: string;
};

export type RoadmapData = {
  tiers: Tier[];
  phases: Phase[];
  stats: { label: string; value: string; icon: string }[];
};

const TIER_META: Record<
  number,
  {
    label: string;
    effort: string;
    color: string;
    gradient: string;
    icon: string;
  }
> = {
  1: {
    label: 'Quick Wins',
    effort: '1–3 days each',
    color: '#22c55e',
    gradient:
      'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    icon: '⚡',
  },
  2: {
    label: 'Core Additions',
    effort: '2–7 days each',
    color: '#3b82f6',
    gradient:
      'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
    icon: '🎮',
  },
  3: {
    label: 'Card & Board Games',
    effort: '4–7 days each',
    color: '#a855f7',
    gradient:
      'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))',
    icon: '♠️',
  },
  4: {
    label: 'Community & Social',
    effort: '3–10 days each',
    color: '#f59e0b',
    gradient:
      'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    icon: '👥',
  },
  5: {
    label: 'Platform Polish',
    effort: '1–10 days each',
    color: '#ec4899',
    gradient:
      'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
    icon: '✨',
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
];

function normalizeStatus(raw: string): FeatureStatus {
  const clean = raw.toLowerCase().replace(/[*_]/g, '').trim();
  if (clean.includes('implemented') || clean.includes('completed')) {
    return 'implemented';
  }
  if (clean.includes('partial') || clean.includes('in progress')) {
    return 'partial';
  }
  return 'not_started';
}

export function parseRoadmapMarkdown(content: string): RoadmapData {
  const lines = content.split('\n');

  // 1. Parse Status Table (| Feature | ARC | Branch | Status |)
  const ticketStatuses = new Map<
    string,
    { status: FeatureStatus; arc?: string }
  >();
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

    // Key by simplified clean name and by title
    const normalizedKey = featureName
      .replace(/^[0-9]+[A-Z]?\.\s*/, '')
      .toLowerCase();
    ticketStatuses.set(normalizedKey, { status, arc });
    if (arc) {
      ticketStatuses.set(arc.toLowerCase(), { status, arc });
    }
  }

  // 2. Parse Tiers and Features (#### 1A. Title `ARC-XXX`)
  const tiers: Tier[] = [];
  let currentTierIndex = 0;
  let currentTier: Tier | null = null;
  let currentFeature: TierFeature | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for Tier header: ### TIER 1 — ...
    const tierMatch = line.match(/^###\s+TIER\s+(\d+)/i);
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

    // Check for Feature header: #### 1A. Persistent Account-less Stat Tracking `ARC-871`
    const featureMatch = line.match(
      /^####\s+([0-9]+[A-Za-z]?\.)?\s*([^(^`]+)(?:`([^`]+)`)?/,
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
        effort: '1–3 days',
        status: statusInfo?.status ?? 'not_started',
        arc: rawArc || statusInfo?.arc,
      };
      continue;
    }

    // Capture effort
    if (currentFeature && line.startsWith('**Effort:')) {
      const effortMatch = line.match(/\(([^)]+)\)/);
      if (effortMatch) {
        currentFeature.effort = effortMatch[1];
      }
      continue;
    }

    // Capture description bullet points or text
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

  // 3. Parse Phases Table (| Phase / Focus | Features & Ticket Scope | Est. Days | Status / Progress |)
  const phases: Phase[] = [];
  let phaseNum = 1;
  const phaseRowRegex =
    /^\|\s*\*\*Phase\s*(\d+):?\s*([^|]*)\*\*\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/i;

  for (const line of lines) {
    const match = line.match(phaseRowRegex);
    if (match) {
      const [, pNum, , featuresRaw, daysRaw, statusRaw] = match;
      phases.push({
        phase: parseInt(pNum, 10),
        features: featuresRaw.trim(),
        days: daysRaw.trim(),
        status: statusRaw.trim(),
        color: PHASE_COLORS[(phaseNum - 1) % PHASE_COLORS.length],
      });
      phaseNum++;
    }
  }

  // Fallback phases if table wasn't matched
  const finalPhases =
    phases.length > 0
      ? phases
      : [
          {
            phase: 1,
            features: 'Stats + Emotes + House Rules + Dark Mode + Undo',
            days: '10',
            color: '#22c55e',
          },
          {
            phase: 2,
            features: 'Viral invite loops + QR codes + SEO landing pages',
            days: '12',
            color: '#3b82f6',
          },
          {
            phase: 3,
            features: 'Chess Engine + Checkers Engine + Audio Cues',
            days: '15',
            color: '#6366f1',
          },
          {
            phase: 4,
            features:
              'Achievements + Daily Challenges + Tournaments + Leaderboards',
            days: '20',
            color: '#a855f7',
          },
          {
            phase: 5,
            features: 'Matchmaking Queue + AI Difficulty + Ranked/ELO',
            days: '15',
            color: '#f59e0b',
          },
          {
            phase: 6,
            features:
              'Hearts + Spades + Backgammon + Pachisi + Analysis + Coach',
            days: '25',
            color: '#f97316',
          },
          {
            phase: 7,
            features: 'Go + Clans + Game Nights + Replays + Spectator Mode',
            days: '25',
            color: '#ec4899',
          },
          {
            phase: 8,
            features:
              'PWA + Push Notifications + Offline Mode + Share + Mobile',
            days: '30',
            color: '#14b8a6',
          },
          {
            phase: 9,
            features: 'Visual Board Game Creator',
            days: '20',
            color: '#06b6d4',
          },
        ];

  // Calculate aggregate stats
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
    phases: finalPhases,
    stats,
  };
}

export async function getRoadmapData(): Promise<RoadmapData> {
  const filePath = join(process.cwd(), '..', '..', 'docs', 'ROADMAP.md');
  const content = await readFile(filePath, 'utf-8');
  return parseRoadmapMarkdown(content);
}
