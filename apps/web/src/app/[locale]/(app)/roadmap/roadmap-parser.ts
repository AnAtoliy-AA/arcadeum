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
  title: string;
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
  6: {
    label: 'Growth & SEO',
    effort: '2–5 days each',
    color: '#14b8a6',
    gradient:
      'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))',
    icon: '📈',
  },
  7: {
    label: 'Growth Acceleration',
    effort: '1–5 days each',
    color: '#06b6d4',
    gradient:
      'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))',
    icon: '🚀',
  },
  8: {
    label: 'Retention & Habit Loops',
    effort: '2–7 days each',
    color: '#8b5cf6',
    gradient:
      'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
    icon: '🔁',
  },
  9: {
    label: 'Performance & Latency',
    effort: '2–5 days each',
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

    // Check for Tier header: ### TIER 1 — ... OR ## Tier 6 — ...
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

    // Check for Feature header: #### 1A. Title `ARC-871` OR ### 6A. Title
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

  // Fallback phases if table wasn't matched
  const finalPhases =
    phases.length > 0
      ? phases
      : [
          {
            phase: 1,
            title: 'Core UX',
            features:
              'Stats tracking + Emotes + House rules + Dark mode + Undo + Password rooms',
            days: '10',
            status: '100% Completed',
            color: '#22c55e',
          },
          {
            phase: 2,
            title: 'Growth & SEO',
            features:
              'Viral invite loops, QR codes, game SEO landing pages, schema markup, funnel analytics',
            days: '12',
            status: '100% Completed',
            color: '#3b82f6',
          },
          {
            phase: 3,
            title: 'Classic Games',
            features:
              'Chess Engine + Checkers Engine + Audio Cues + Chess Clock',
            days: '15',
            status: '100% Completed',
            color: '#6366f1',
          },
          {
            phase: 4,
            title: 'Competitive',
            features:
              'Achievements + Daily Challenges + Tournaments + Leaderboards + Monetization',
            days: '20',
            status: '100% Completed',
            color: '#a855f7',
          },
          {
            phase: 5,
            title: 'Retention',
            features:
              'Matchmaking Queue + AI Difficulty Tiers + Ranked/ELO Skill Ratings',
            days: '15',
            status: '100% Completed',
            color: '#f59e0b',
          },
          {
            phase: 6,
            title: 'Card & Board',
            features:
              'Hearts + Spades + Backgammon + Pachisi + Post-Game Analysis + Hints/Coach',
            days: '25',
            status: '100% Completed (code-audited)',
            color: '#f97316',
          },
          {
            phase: 7,
            title: 'Advanced Social',
            features:
              'Go Engine + Clans/Groups + Game Nights + Replays + Spectator Mode',
            days: '25',
            status: '100% Completed (spectator UI reactions shipped)',
            color: '#ec4899',
          },
          {
            phase: 8,
            title: 'Platform Growth',
            features:
              'PWA Support + Push Notifications + Offline Mode + Share + Mobile App Port',
            days: '30',
            status: 'PWA, Push, Share + Offline Completed (Mobile Partial)',
            color: '#14b8a6',
          },
          {
            phase: 9,
            title: 'Creator Tools',
            features: 'Visual Board Game Creator',
            days: '20',
            status: 'Deferred (revisit with larger community)',
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
