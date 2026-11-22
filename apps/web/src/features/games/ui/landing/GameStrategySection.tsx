'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameSectionHeading } from './GameSectionHeading';
import type { GameStrategySectionProps } from './types';

export function GameStrategySection({
  id = 'strategy',
  title,
  kicker,
  intro,
  tips,
}: GameStrategySectionProps) {
  const { t } = useTranslation();
  if (!tips || tips.length === 0) return null;

  return (
    <section
      id={id}
      className="box-border scroll-mt-32 flex flex-col gap-8 py-10 sm:py-12 [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
    >
      <GameSectionHeading
        kicker={kicker ?? t('games.landing.strategyKicker')}
        title={title ?? t('games.landing.strategyTitle')}
        subtitle={intro}
      />

      <div className="box-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.map((tip, index) => (
          <article
            key={tip.key}
            className="box-border flex flex-col gap-3 p-5 sm:p-6 rounded-3xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md motion-safe:transition-all motion-safe:duration-200 hover:border-[var(--primary)]/50 hover:shadow-md"
          >
            <span className="box-border self-start text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--primary)]/12 text-[var(--primary)]">
              {t('games.landing.tipLabel', { n: index + 1 })}
            </span>
            <h3 className="box-border m-0 text-lg font-bold text-[var(--foreground)]">
              {tip.title}
            </h3>
            <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-80 leading-relaxed">
              {tip.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
