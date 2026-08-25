'use client';

import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

type ChangelogStatsProps = {
  totalVersions: number;
  minorReleasesCount: number;
  totalChanges: number;
  latestVersion: string;
  lastUpdated: string;
};

export function ChangelogStats({
  totalVersions,
  minorReleasesCount,
  totalChanges,
  latestVersion,
  lastUpdated,
}: ChangelogStatsProps) {
  const { t } = useTranslation();

  const statItems = [
    {
      label: t('pages.changelog.stats.latestVersion'),
      value: `v${latestVersion}`,
      icon: '🚀',
      accent: 'text-[var(--primary)]',
      bg: 'bg-[var(--primary)]/10 border-[var(--primary)]/20',
    },
    {
      label: t('pages.changelog.stats.totalReleases'),
      value: `${minorReleasesCount} releases`,
      icon: '🏷️',
      accent: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: t('pages.changelog.stats.totalVersions'),
      value: totalVersions.toString(),
      icon: '📦',
      accent: 'text-[var(--success)]',
      bg: 'bg-[var(--success)]/10 border-[var(--success)]/20',
    },
    {
      label: t('pages.changelog.stats.totalChanges'),
      value: totalChanges.toString(),
      icon: '✨',
      accent: 'text-[var(--warning)]',
      bg: 'bg-[var(--warning)]/10 border-[var(--warning)]/20',
    },
    {
      label: t('pages.changelog.stats.lastUpdated'),
      value: lastUpdated || 'Recent',
      icon: '📅',
      accent: 'text-[var(--info)]',
      bg: 'bg-[var(--info)]/10 border-[var(--info)]/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-sm transition-transform hover:-translate-y-0.5"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${stat.bg}`}
          >
            {stat.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <Typography
              variant="heading"
              uiSize="sm"
              className={`font-extrabold truncate ${stat.accent}`}
            >
              {stat.value}
            </Typography>
            <Typography
              variant="caption"
              uiSize="xs"
              alpha="medium"
              className="truncate"
            >
              {stat.label}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
}
