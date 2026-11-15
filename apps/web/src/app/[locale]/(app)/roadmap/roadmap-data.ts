import generatedRoadmap from './generated-roadmap.json';
import type { Tier, Phase, StatItem } from './roadmap-types';

export type {
  FeatureStatus,
  TierFeature,
  Tier,
  Phase,
  StatItem,
} from './roadmap-types';

export const TIERS: Tier[] = generatedRoadmap.tiers as Tier[];
export const PHASES: Phase[] = generatedRoadmap.phases as Phase[];
export const STATS: StatItem[] = generatedRoadmap.stats as StatItem[];
