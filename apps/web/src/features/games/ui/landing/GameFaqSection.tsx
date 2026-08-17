import type { GameFaqSectionProps } from './types';

export function GameFaqSection({
  title = 'Frequently Asked Questions',
  kicker = 'FAQ',
  items,
}: GameFaqSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section id="faq" className="box-border flex flex-col gap-6 py-8">
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

      <div className="box-border flex flex-col gap-3">
        {items.map((item, idx) => (
          <details
            key={item.key}
            open={idx === 0}
            className="box-border group rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md p-4 sm:p-5 transition-all duration-200 open:border-[var(--primary)]/60"
          >
            <summary className="box-border flex items-center justify-between font-bold text-base sm:text-lg text-[var(--foreground)] cursor-pointer list-none select-none">
              <span>{item.question}</span>
              <span className="box-border ml-4 text-[var(--primary)] transition-transform duration-200 group-open:rotate-180 shrink-0">
                ▾
              </span>
            </summary>
            <div className="box-border mt-3 pt-3 border-t border-[var(--borderColor)] text-sm sm:text-base text-[var(--foreground)] opacity-85 leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
