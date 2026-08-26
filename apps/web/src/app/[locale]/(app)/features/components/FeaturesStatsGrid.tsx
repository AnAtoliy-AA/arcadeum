'use client';

import { Typography } from '@arcadeum/ui';

type FeaturesStatsGridProps = {
  totalSections: number;
  totalFeatures: number;
  labels: {
    modules: string;
    features: string;
    games: string;
    languages: string;
  };
};

export function FeaturesStatsGrid({
  totalSections,
  totalFeatures,
  labels,
}: FeaturesStatsGridProps) {
  const stats = [
    {
      value: `${totalSections}`,
      label: labels.modules,
      icon: '🏗️',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    },
    {
      value: `${totalFeatures}+`,
      label: labels.features,
      icon: '⚡',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    },
    {
      value: '20+',
      label: labels.games,
      icon: '🎮',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
    },
    {
      value: '5',
      label: labels.languages,
      icon: '🌐',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`flex flex-col p-4 rounded-2xl bg-gradient-to-br ${stat.color} border bg-[var(--bgCard)]/60 backdrop-blur-md transition-all hover:scale-[1.02] shadow-sm`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl">{stat.icon}</span>
            <Typography
              variant="heading"
              uiSize="2xl"
              className="font-black text-[var(--foreground)] tracking-tight"
            >
              {stat.value}
            </Typography>
          </div>
          <Typography
            variant="caption"
            uiSize="xs"
            alpha="medium"
            className="font-semibold uppercase tracking-wider text-[var(--foregroundSecondary)]"
          >
            {stat.label}
          </Typography>
        </div>
      ))}
    </div>
  );
}
