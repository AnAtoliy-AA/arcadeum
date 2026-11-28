'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameSectionHeading } from './GameSectionHeading';
import { ChevronDownIcon } from './landingIcons';
import type { GameFaqSectionProps } from './types';

export function GameFaqSection({
  id = 'faq',
  title,
  kicker,
  items,
}: GameFaqSectionProps) {
  const { t } = useTranslation();
  if (!items || items.length === 0) return null;

  return (
    <section
      id={id}
      className="box-border scroll-mt-32 flex flex-col gap-8 py-10 sm:py-12 [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
    >
      <GameSectionHeading
        kicker={kicker ?? t('games.landing.faqKicker')}
        title={title ?? t('games.landing.faqTitle')}
      />

      <div className="box-border flex flex-col gap-3 max-w-3xl">
        {items.map((item, idx) => (
          <details
            key={item.key}
            open={idx === 0}
            className="box-border group rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md motion-safe:transition-colors open:border-[var(--primary)]/60 hover:border-[var(--primary)]/40"
          >
            <summary className="box-border flex items-center justify-between gap-4 min-h-14 px-4 sm:px-5 py-3 font-bold text-base sm:text-lg text-[var(--foreground)] cursor-pointer list-none select-none rounded-2xl focus-visible:outline-2 focus-visible:outline-[var(--primary)] [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="box-border shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-180"
              >
                <ChevronDownIcon />
              </span>
            </summary>
            <div className="box-border px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-[var(--foreground)] opacity-85 leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
