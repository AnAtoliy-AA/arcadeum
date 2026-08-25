'use client';

import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

const LIVE_HIGHLIGHTS = [
  { icon: '🎮', key: 'gamesLive' as const, label: '8 games live' },
  { icon: '⚙️', key: 'engine' as const, label: 'Engine for 200+ games' },
  { icon: '🤖', key: 'bots' as const, label: 'Bots + matchmaking' },
  { icon: '💬', key: 'chat' as const, label: 'Full chat system' },
  { icon: '🎨', key: 'ui' as const, label: '62+ UI components' },
  { icon: '👥', key: 'friends' as const, label: 'Friends + auth' },
];

export function RoadmapCurrentState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <Typography
          className="font-extrabold text-[var(--foreground)]"
          variant="heading"
          uiSize="lg"
        >
          {t('pages.roadmap.currentState.title')}
        </Typography>
        <div className="px-2 py-0.5 rounded-full bg-[var(--success)]/15 border border-[var(--success)]/30">
          <Typography
            className="text-[var(--success)] font-bold text-[10px] tracking-wider uppercase"
            variant="label"
            uiSize="xs"
          >
            {t('pages.roadmap.stats.liveBadge')}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {LIVE_HIGHLIGHTS.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--bgCard)]/70 border border-[var(--glassBorder)] transition-transform hover:-translate-y-0.5"
          >
            <span className="text-base shrink-0">{item.icon}</span>
            <Typography
              variant="body"
              uiSize="sm"
              alpha="high"
              className="text-xs font-medium truncate"
            >
              {t(`pages.roadmap.currentState.items.${item.key}`) || item.label}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
}
