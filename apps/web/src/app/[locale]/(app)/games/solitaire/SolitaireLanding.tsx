import Link from 'next/link';
import { Container, GlassCard } from '@arcadeum/ui';
import type { SolitaireMessages } from '@/shared/i18n/messages/games/solitaire';

type Landing = SolitaireMessages['solitaire_v1']['landing'];
type Rules = SolitaireMessages['solitaire_v1']['rules'];

interface Props {
  landing?: Landing;
  rules?: Rules;
  gameId: string;
  playHref: string;
  gamesHref: string;
  homeHref: string;
  locale: string;
}

const FEATURE_ICONS = ['🃏', '💾', '📊'] as const;
const FEATURE_KEYS = ['solo', 'progress', 'stats'] as const;
const FAQ_KEYS = ['q1', 'q2', 'q3'] as const;
const STEP_KEYS = ['create', 'join', 'play'] as const;

export default function SolitaireLanding({
  landing,
  rules,
  playHref,
  gamesHref,
  homeHref,
}: Props) {
  if (!landing) return null;

  return (
    <div className="box-border relative min-h-screen overflow-hidden pb-20">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <Container size="lg">
        {/* Hero */}
        <header className="flex flex-col items-center gap-5 py-14 text-center sm:py-20">
          <span className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            Single-player · No signup
          </span>
          <h1 className="m-0 max-w-3xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            {landing.hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--foreground)] opacity-80 sm:text-lg">
            {landing.hero.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href={playHref}
              className="rounded-xl bg-[var(--primary)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-[1.03]"
            >
              ▸ {landing.hero.ctaPlay}
            </Link>
            <Link
              href={gamesHref}
              className="rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--primary)]/10"
            >
              ← Games
            </Link>
          </div>
        </header>

        {/* Feature highlights */}
        <section className="mt-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURE_KEYS.map((key, index) => {
              const feature = landing.features[key];
              return (
                <GlassCard key={key} className="flex flex-col gap-2 p-5">
                  <span className="text-2xl" aria-hidden="true">
                    {FEATURE_ICONS[index]}
                  </span>
                  <h2 className="m-0 text-lg font-bold text-[var(--foreground)]">
                    {feature.title}
                  </h2>
                  <p className="m-0 text-sm leading-relaxed text-[var(--foreground)] opacity-75">
                    {feature.body}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </section>

        {/* How to play */}
        {landing.steps && rules && (
          <section className="pt-6">
            <h2 className="mb-6 text-center text-2xl font-black text-[var(--foreground)] sm:text-3xl">
              How to play
            </h2>
            <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
              {STEP_KEYS.map((key, index) => {
                const step = landing.steps[key];
                return (
                  <li key={key}>
                    <GlassCard className="h-full p-5">
                      <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/15 text-sm font-bold text-[var(--primary)]">
                        {index + 1}
                      </span>
                      <h3 className="m-0 mb-1 text-base font-bold text-[var(--foreground)]">
                        {step.title}
                      </h3>
                      <p className="m-0 text-sm leading-relaxed text-[var(--foreground)] opacity-75">
                        {step.body}
                      </p>
                    </GlassCard>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Rules */}
        {rules && (
          <section className="mt-12">
            <GlassCard className="grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
              {(
                [
                  ['objective', rules.objective],
                  ['gameplay', rules.gameplay],
                  ['scoring', rules.scoring],
                ] as const
              ).map(([titleKey, body]) => (
                <div key={titleKey} className="flex flex-col gap-1">
                  <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-[var(--primary)]">
                    {titleKey}
                  </h3>
                  <p className="m-0 text-sm leading-relaxed text-[var(--foreground)] opacity-80">
                    {body}
                  </p>
                </div>
              ))}
            </GlassCard>
          </section>
        )}

        {/* FAQ */}
        {landing.faq && (
          <section id="faq" className="mt-12">
            <h2 className="mb-6 text-center text-2xl font-black text-[var(--foreground)] sm:text-3xl">
              FAQ
            </h2>
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              {FAQ_KEYS.map((key) => {
                const item = landing.faq[key];
                return (
                  <details
                    key={key}
                    className="group rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] p-4"
                  >
                    <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)] marker:hidden">
                      {item.question}
                    </summary>
                    <p className="mb-0 mt-2 text-sm leading-relaxed text-[var(--foreground)] opacity-75">
                      {item.answer}
                    </p>
                  </details>
                );
              })}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="mt-12">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--borderColor)] bg-gradient-to-br from-[var(--primary)]/15 to-transparent p-10 text-center">
            <h2 className="m-0 text-2xl font-black text-[var(--foreground)] sm:text-3xl">
              {landing.hero.title}
            </h2>
            <Link
              href={playHref}
              className="rounded-xl bg-[var(--primary)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-[1.03]"
            >
              ▸ {landing.hero.ctaPlay}
            </Link>
            <Link
              href={homeHref}
              className="text-xs font-semibold text-[var(--foreground)] opacity-60 underline-offset-4 hover:underline"
            >
              Arcadeum
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
