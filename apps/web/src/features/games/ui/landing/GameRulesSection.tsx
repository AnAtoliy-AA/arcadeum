'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameSectionHeading } from './GameSectionHeading';
import type { GameRulesSectionProps } from './types';

export function GameRulesSection({
  id = 'rules',
  title,
  kicker,
  rules,
  note,
}: GameRulesSectionProps) {
  const { t } = useTranslation();
  if (!rules || rules.length === 0) return null;

  return (
    <section
      id={id}
      className="box-border scroll-mt-32 flex flex-col gap-8 py-10 sm:py-12 [content-visibility:auto] [contain-intrinsic-size:auto_400px]"
    >
      <GameSectionHeading
        kicker={kicker ?? t('games.landing.rulesKicker')}
        title={title ?? t('games.landing.rulesTitle')}
      />

      <ol className="box-border m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 gap-3">
        {rules.map((rule, index) => (
          <li
            key={rule.key}
            className="box-border flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md motion-safe:transition-colors hover:border-[var(--primary)]/50"
          >
            <span
              aria-hidden="true"
              className="box-border shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--primary)]/12 text-[var(--primary)] text-sm font-extrabold"
            >
              {index + 1}
            </span>
            <div className="box-border flex flex-col gap-1">
              <h3 className="box-border m-0 text-base font-bold text-[var(--foreground)]">
                {rule.head}
              </h3>
              <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
                {rule.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {note ? (
        <div className="box-border p-4 rounded-2xl bg-[var(--primary)]/8 border border-[var(--primary)]/20 text-sm text-[var(--foreground)]">
          <span className="font-semibold text-[var(--primary)]">
            {t('games.landing.ruleNote')}:{' '}
          </span>
          {note}
        </div>
      ) : null}
    </section>
  );
}
