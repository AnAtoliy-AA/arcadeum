'use client';

import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export function RoadmapLegalBanner() {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--success)]/20 bg-gradient-to-br from-[var(--success)]/10 via-[var(--success)]/5 to-transparent backdrop-blur-md">
      <div className="w-10 h-10 rounded-xl bg-[var(--success)]/15 border border-[var(--success)]/30 flex items-center justify-center text-xl shrink-0">
        ⚖️
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <Typography
          className="font-extrabold text-[var(--foreground)]"
          variant="heading"
          uiSize="md"
        >
          {t('pages.roadmap.legal.title')}
        </Typography>
        <Typography
          variant="body"
          uiSize="sm"
          alpha="medium"
          className="leading-relaxed"
        >
          {t('pages.roadmap.legal.description')}
        </Typography>
      </div>
    </div>
  );
}
