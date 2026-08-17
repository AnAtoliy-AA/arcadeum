import type { GameHighlightsGridProps } from './types';

export function GameHighlightsGrid({
  title,
  kicker,
  items,
}: GameHighlightsGridProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="box-border flex flex-col gap-6 py-8">
      {kicker || title ? (
        <div className="box-border flex flex-col gap-1">
          {kicker ? (
            <span className="box-border text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              {kicker}
            </span>
          ) : null}
          {title ? (
            <h2 className="box-border m-0 text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              {title}
            </h2>
          ) : null}
        </div>
      ) : null}

      <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <article
            key={item.key}
            className="box-border flex flex-col gap-3 p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md transition-all duration-200 hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-0.5"
          >
            {item.icon ? (
              <div className="box-border w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-xl font-bold">
                {item.icon}
              </div>
            ) : null}
            <h3 className="box-border m-0 text-lg font-bold text-[var(--foreground)]">
              {item.title}
            </h3>
            <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
