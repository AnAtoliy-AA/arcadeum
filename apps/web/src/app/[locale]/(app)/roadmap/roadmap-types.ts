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

export type StatItem = {
  label: string;
  value: string;
  icon: string;
};
