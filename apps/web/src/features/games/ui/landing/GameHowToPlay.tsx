'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameSectionHeading } from './GameSectionHeading';
import type { GameHowToPlayProps } from './types';

export function GameHowToPlay({
  id = 'how-to-play',
  title,
  kicker,
  intro,
  steps,
}: GameHowToPlayProps) {
  const { t } = useTranslation();
  if (!steps || steps.length === 0) return null;

  return (
    <section
      id={id}
      className="box-border scroll-mt-32 flex flex-col gap-8 py-10 sm:py-12"
    >
      <GameSectionHeading kicker={kicker} title={title} subtitle={intro} />

      <ol className="box-border m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => (
          <li
            key={step.key}
            className="box-border relative flex flex-col gap-3 p-5 sm:p-6 rounded-3xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md motion-safe:transition-all motion-safe:duration-200 hover:border-[var(--primary)]/60 hover:shadow-md"
          >
            <div className="box-border flex items-center justify-between">
              <span
                aria-hidden="true"
                className="box-border flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--primary)] text-[var(--primaryText)] text-lg font-extrabold shadow-md"
              >
                {step.stepNumber}
              </span>
              {step.icon ? (
                <span className="box-border text-2xl opacity-85">
                  {step.icon}
                </span>
              ) : null}
            </div>

            <h3 className="box-border m-0 text-lg font-bold text-[var(--foreground)]">
              <span className="sr-only">
                {t('games.landing.stepLabel', { n: step.stepNumber })}
                {': '}
              </span>
              {step.title}
            </h3>

            <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-80 leading-relaxed flex-grow">
              {step.body}
            </p>

            {step.tip ? (
              <div className="box-border mt-1 p-3 rounded-xl bg-[var(--primary)]/8 border border-[var(--primary)]/20 text-xs sm:text-sm text-[var(--foreground)]">
                <span className="font-semibold text-[var(--primary)]">
                  {t('games.landing.proTip')}:{' '}
                </span>
                {step.tip}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
