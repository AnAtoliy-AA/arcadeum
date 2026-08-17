import type { GameStrategySectionProps } from './types';

export function GameStrategySection({
  title = 'Pro Strategy & Tips',
  kicker = 'Tactics',
  intro,
  tips,
}: GameStrategySectionProps) {
  if (!tips || tips.length === 0) return null;

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
        {intro ? (
          <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-80 max-w-2xl">
            {intro}
          </p>
        ) : null}
      </div>

      <div className="box-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tips.map((tip, index) => (
          <article
            key={tip.key}
            className="box-border flex flex-col gap-2.5 p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md transition-all duration-200 hover:border-[var(--primary)]/50 hover:shadow-sm"
          >
            <div className="box-border flex items-center justify-between">
              <span className="box-border text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]">
                Tip #{index + 1}
              </span>
            </div>
            <h3 className="box-border m-0 text-base sm:text-lg font-bold text-[var(--foreground)]">
              {tip.title}
            </h3>
            <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
              {tip.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
