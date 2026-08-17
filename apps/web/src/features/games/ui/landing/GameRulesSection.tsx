import type { GameRulesSectionProps } from './types';

export function GameRulesSection({
  title = 'Game Rules & Mechanics',
  kicker = 'Official Rules',
  rules,
  note,
}: GameRulesSectionProps) {
  if (!rules || rules.length === 0) return null;

  return (
    <section className="box-border flex flex-col gap-6 py-8">
      <div className="box-border flex flex-col gap-1">
        {kicker ? (
          <span className="box-border text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            {kicker}
          </span>
        ) : null}
        <h2 className="box-border m-0 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          {title}
        </h2>
      </div>

      <div className="box-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <article
            key={rule.key}
            className="box-border flex flex-col gap-2.5 p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md transition-all duration-200 hover:border-[var(--primary)]/50"
          >
            <h3 className="box-border m-0 text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <span className="box-border w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
              {rule.head}
            </h3>
            <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
              {rule.body}
            </p>
          </article>
        ))}
      </div>

      {note ? (
        <div className="box-border p-4 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-xs sm:text-sm text-[var(--foreground)] opacity-90">
          <span className="font-semibold text-[var(--primary)]">
            Rule Note:{' '}
          </span>
          {note}
        </div>
      ) : null}
    </section>
  );
}
