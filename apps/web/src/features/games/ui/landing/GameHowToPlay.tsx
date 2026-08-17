import type { GameHowToPlayProps } from './types';

export function GameHowToPlay({
  title,
  kicker,
  intro,
  steps,
}: GameHowToPlayProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section id="how-to-play" className="box-border flex flex-col gap-6 py-8">
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
          {intro ? (
            <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-80 max-w-2xl">
              {intro}
            </p>
          ) : null}
        </div>
      ) : null}

      <ol className="box-border m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {steps.map((step) => (
          <li
            key={step.key}
            className="box-border relative flex flex-col gap-3 p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-md transition-all duration-200 hover:border-[var(--primary)]/60 hover:shadow-md"
          >
            <div className="box-border flex items-center justify-between">
              <span className="box-border flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primaryText)] text-sm font-extrabold shadow-sm">
                {step.stepNumber}
              </span>
              {step.icon ? (
                <span className="box-border text-lg opacity-70">
                  {step.icon}
                </span>
              ) : null}
            </div>

            <h3 className="box-border m-0 text-base sm:text-lg font-bold text-[var(--foreground)]">
              {step.title}
            </h3>

            <p className="box-border m-0 text-sm text-[var(--foreground)] opacity-80 leading-relaxed flex-grow">
              {step.body}
            </p>

            {step.tip ? (
              <div className="box-border mt-2 p-2.5 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-xs text-[var(--foreground)] opacity-90">
                <span className="font-semibold text-[var(--primary)]">
                  Pro Tip:{' '}
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
