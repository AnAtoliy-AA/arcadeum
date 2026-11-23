import { GameSectionHeading } from './GameSectionHeading';
import type { GameHighlightsGridProps } from './types';

/** Bento spans: the first card is featured on wide screens. */
function spanClass(index: number, total: number): string {
  if (total >= 4 && index === 0) return 'sm:col-span-2 lg:row-span-2';
  return '';
}

export function GameHighlightsGrid({
  id = 'highlights',
  title,
  kicker,
  items,
}: GameHighlightsGridProps) {
  if (!items || items.length === 0) return null;

  return (
    <section
      id={id}
      className="box-border scroll-mt-32 flex flex-col gap-8 py-10 sm:py-12"
    >
      <GameSectionHeading kicker={kicker} title={title} />

      <div className="box-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:auto-rows-fr">
        {items.map((item, index) => {
          const featured = spanClass(index, items.length) !== '';
          return (
            <article
              key={item.key}
              className={`box-border group flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md motion-safe:transition-all motion-safe:duration-200 hover:border-[var(--primary)]/70 hover:shadow-lg motion-safe:hover:-translate-y-0.5 ${spanClass(index, items.length)} ${
                featured
                  ? 'bg-gradient-to-br from-[var(--glassBg)] to-[var(--primary)]/10 justify-end'
                  : ''
              }`}
            >
              {item.icon ? (
                <div
                  className={`box-border flex items-center justify-center rounded-2xl bg-[var(--primary)]/12 text-[var(--primary)] font-bold ${
                    featured ? 'w-14 h-14 text-3xl' : 'w-11 h-11 text-xl'
                  }`}
                >
                  {item.icon}
                </div>
              ) : null}
              <div className="box-border flex flex-col gap-1.5">
                <h3
                  className={`box-border m-0 font-bold text-[var(--foreground)] ${
                    featured ? 'text-xl sm:text-2xl' : 'text-lg'
                  }`}
                >
                  {item.title}
                </h3>
                <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-80 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
