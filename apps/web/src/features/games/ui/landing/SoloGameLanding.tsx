'use client';

import Link from 'next/link';
import { Badge, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { GameLandingLayout } from './GameLandingLayout';
import { GameLandingLiveStats } from './GameLandingLiveStats';
import { GameSectionNav } from './GameSectionNav';
import { GameHowToPlay } from './GameHowToPlay';
import { GameRulesSection } from './GameRulesSection';
import { GameHighlightsGrid } from './GameHighlightsGrid';
import { GameFaqSection } from './GameFaqSection';
import type { GameSectionNavItem } from './types';

export interface SoloLandingCopy {
  name: string;
  tagline: string;
  heroSubtitle: string;
  ctaPlayLabel: string;
  /** Optional compact facts row under the primary action. */
  facts?: Array<{ label: string; value: string }>;
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

const GLOW_BY_CLASS_HINT: Array<[string, 'amber' | 'emerald' | 'blue']> = [
  ['amber', 'amber'],
  ['emerald', 'emerald'],
];

/** Maps the legacy Tailwind glow class onto the shared layout glow preset. */
function resolveGlow(glowClass: string): 'amber' | 'emerald' | 'blue' {
  const hit = GLOW_BY_CLASS_HINT.find(([hint]) => glowClass.includes(hint));
  return hit ? hit[1] : 'blue';
}

/**
 * Landing for single-player games. Same hierarchy as the multiplayer landing
 * (one primary Play action, compact facts, sticky section nav, shared section
 * components) without any bot or AI vs AI UI.
 */
export function SoloGameLanding({
  copy,
  playHref,
  gamesHref,
  accentGlowClass = 'from-emerald-500/15 via-teal-500/10',
}: SoloGameLandingProps) {
  const { t } = useTranslation();
  if (!copy) return null;

  const hasFeatures = copy.features.length > 0;
  const hasSteps = copy.steps.length > 0;
  const hasRules = copy.rules.length > 0;
  const hasFaq = copy.faq.length > 0;
  const facts = copy.facts ?? [];

  // Page order: Play, How to play, Rules, Highlights, FAQ.
  const navItems: GameSectionNavItem[] = [
    { id: 'play', labelKey: 'games.landing.navPlay' },
  ];
  if (hasSteps) {
    navItems.push({
      id: 'how-to-play',
      labelKey: 'games.landing.navHowToPlay',
    });
  }
  if (hasRules) {
    navItems.push({ id: 'rules', labelKey: 'games.landing.navRules' });
  }
  if (hasFeatures) {
    navItems.push({
      id: 'highlights',
      labelKey: 'games.landing.navHighlights',
    });
  }
  if (hasFaq) {
    navItems.push({ id: 'faq', labelKey: 'games.landing.navFaq' });
  }

  return (
    <GameLandingLayout
      accentGlow={resolveGlow(accentGlowClass)}
      breadcrumbs={[
        { label: t('games.landing.allGames'), href: gamesHref },
        { label: copy.name },
      ]}
    >
      <header
        id="play"
        data-testid="solo-landing-hero"
        className="box-border relative w-full pt-6 pb-10 scroll-mt-32 flex flex-col gap-5 max-w-4xl"
      >
        <div className="box-border flex flex-wrap items-center gap-2">
          <Badge variant="info" size="sm">
            {copy.tagline}
          </Badge>
        </div>
        <div className="box-border flex flex-col gap-3">
          <h1 className="box-border m-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1]">
            {copy.name}
          </h1>
          <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-90 leading-relaxed max-w-2xl">
            {copy.heroSubtitle}
          </p>
        </div>

        <div
          role="group"
          aria-label={t('games.landing.primaryActions')}
          className="box-border flex flex-wrap items-center gap-3"
        >
          <Link href={playHref} className="box-border inline-flex">
            <Button variant="primary" size="lg">
              {copy.ctaPlayLabel}
            </Button>
          </Link>
        </div>

        {facts.length > 0 ? (
          <dl
            aria-label={t('games.landing.facts')}
            data-testid="game-hero-facts"
            className="box-border m-0 flex flex-wrap items-stretch gap-x-6 gap-y-3 pt-4 border-t border-[var(--borderColor)]/40"
          >
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="box-border flex flex-col gap-0.5"
              >
                <dt className="box-border text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-60">
                  {fact.label}
                </dt>
                <dd className="box-border m-0 text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <GameLandingLiveStats />
      </header>

      <GameSectionNav items={navItems} />

      {hasSteps ? (
        <GameHowToPlay
          steps={copy.steps.map((step, index) => ({
            key: step.title,
            stepNumber: index + 1,
            title: step.title,
            body: step.body,
          }))}
        />
      ) : null}

      {hasRules ? (
        <GameRulesSection
          rules={copy.rules.map((rule) => ({
            key: rule.label,
            head: rule.label,
            body: rule.body,
          }))}
        />
      ) : null}

      {hasFeatures ? (
        <GameHighlightsGrid
          items={copy.features.map((feature) => ({
            key: feature.title,
            icon: feature.icon,
            title: feature.title,
            body: feature.body,
          }))}
        />
      ) : null}

      {hasFaq ? (
        <GameFaqSection
          items={copy.faq.map((item) => ({
            key: item.question,
            question: item.question,
            answer: item.answer,
          }))}
        />
      ) : null}

      <section
        data-testid="solo-final-cta"
        className="box-border my-10 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--glassBg)] to-[var(--primary)]/10 border border-[var(--borderColor)] flex flex-col items-center text-center gap-6"
      >
        <h2 className="box-border m-0 text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          {copy.name}
        </h2>
        <div className="box-border flex flex-wrap items-center justify-center gap-3">
          <Link href={playHref} className="box-border inline-flex">
            <Button variant="primary" size="lg">
              {copy.ctaPlayLabel}
            </Button>
          </Link>
          <Link href={gamesHref} className="box-border inline-flex">
            <Button variant="outline" size="lg">
              {t('games.landing.allGames')}
            </Button>
          </Link>
        </div>
      </section>
    </GameLandingLayout>
  );
}
