import Link from 'next/link';
import { Container, GlassCard } from '@arcadeum/ui';
import { GameLandingLiveStats } from './GameLandingLiveStats';

export interface SoloLandingCopy {
  name: string;
  tagline: string;
  heroSubtitle: string;
  ctaPlayLabel: string;
  features: Array<{ icon: string; title: string; body: string }>;
  steps: Array<{ title: string; body: string }>;
  rules: Array<{ label: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
}

export interface SoloGameLandingProps {
  copy?: SoloLandingCopy;
  playHref: string;
  gamesHref: string;
  homeHref: string;
  accentGlowClass?: string;
  accentTextClass?: string;
}

export function SoloGameLanding({
  copy,
  playHref,
  gamesHref,
  homeHref,
  accentGlowClass = 'from-emerald-500/15 via-teal-500/10',
  accentTextClass = 'text-[var(--primary)] bg-[var(--primary)]/15',
}: SoloGameLandingProps) {
  if (!copy) return null;

  const playButton = (
    <Link
      href={playHref}
      className="rounded-xl bg-[var(--primary)] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/25 transition-transform hover:scale-[1.03]"
    >
      ▸ {copy.ctaPlayLabel}
    </Link>
  );

  return (
    <div className="box-border relative min-h-screen overflow-hidden pb-20">
      <div
        className={`pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b ${accentGlowClass} to-transparent blur-3xl`}
        aria-hidden="true"
      />

      <Container size="lg">
        {/* Hero */}
        <header className="flex flex-col items-center gap-5 py-14 text-center sm:py-20">
          <span className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            {copy.tagline}
          </span>
          <h1 className="m-0 max-w-3xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            {copy.name}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--foreground)] opacity-80 sm:text-lg">
            {copy.heroSubtitle}
          </p>

          <GameLandingLiveStats />

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {playButton}
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
            {copy.features.map((feature) => (
              <GlassCard
                key={feature.title}
                className="flex flex-col gap-2 p-5"
              >
                <span className="text-2xl" aria-hidden="true">
                  {feature.icon}
                </span>
                <h2 className="m-0 text-lg font-bold text-[var(--foreground)]">
                  {feature.title}
                </h2>
                <p className="m-0 text-sm leading-relaxed text-[var(--foreground)] opacity-75">
                  {feature.body}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* How to play */}
        <section className="mt-12 pt-6">
          <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
            {copy.steps.map((step, index) => (
              <li key={step.title}>
                <GlassCard className="h-full p-5">
                  <span
                    className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${accentTextClass}`}
                  >
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
            ))}
          </ol>
        </section>

        {/* Rules */}
        <section className="mt-12">
          <GlassCard className="grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
            {copy.rules.map((rule) => (
              <div key={rule.label} className="flex flex-col gap-1">
                <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-[var(--primary)]">
                  {rule.label}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-[var(--foreground)] opacity-80">
                  {rule.body}
                </p>
              </div>
            ))}
          </GlassCard>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-12">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {copy.faq.map((item) => (
              <details
                key={item.question}
                className="rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] p-4"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--foreground)] marker:hidden">
                  {item.question}
                </summary>
                <p className="mb-0 mt-2 text-sm leading-relaxed text-[var(--foreground)] opacity-75">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-12">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--borderColor)] bg-gradient-to-br from-[var(--primary)]/15 to-transparent p-10 text-center">
            <h2 className="m-0 text-2xl font-black text-[var(--foreground)] sm:text-3xl">
              {copy.name}
            </h2>
            {playButton}
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
