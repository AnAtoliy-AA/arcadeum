'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import { Container, PageLayout } from '@/shared/ui';
import styles from './SeaBattleLanding.module.css';
import { HIGHLIGHT_ICONS, Icon, STEP_ICONS } from './landingIcons';
import { QuickplayButton } from './QuickplayButton';
import { SeaBattleLandingBoard } from './SeaBattleLandingBoard';
import { SeaBattleThemesGrid } from './SeaBattleThemesGrid';

const SEA_BATTLE_GAME_ID = 'sea_battle_v1';

type SeaBattleMessages = SeaBattleGamesMessages['sea_battle_v1'];
type Landing = SeaBattleMessages['landing'];
type Rules = SeaBattleMessages['rules'];
type Variants = SeaBattleMessages['variants'];

interface Props {
  landing?: Landing;
  rulesT?: Rules;
  variantsT?: Variants;
  createRoomHref: string;
  roomsHref: string;
  homeHref: string;
  gamesHref: string;
}

export default function SeaBattleLanding({
  landing,
  rulesT,
  variantsT,
  createRoomHref,
  roomsHref,
  homeHref,
  gamesHref,
}: Props) {
  const [heroVariant, setHeroVariant] = useState<string>('classic');

  if (!landing) return null;

  const highlightCards = [
    { key: 'players', ...landing.highlights.players },
    { key: 'teams', ...landing.highlights.teams },
    { key: 'themes', ...landing.highlights.themes },
    { key: 'free', ...landing.highlights.free },
  ];

  const howToSteps = [
    { key: 'create', ...landing.howToPlay.steps.create },
    { key: 'place', ...landing.howToPlay.steps.place },
    { key: 'fire', ...landing.howToPlay.steps.fire },
    { key: 'win', ...landing.howToPlay.steps.win },
  ];

  const faqItems = Object.entries(landing.faq.items).map(([key, item]) => ({
    key,
    question: item.question,
    answer: item.answer,
  }));

  const rules = rulesT
    ? [
        {
          key: 'objective',
          head: rulesT.headers.objective,
          body: rulesT.objective,
        },
        {
          key: 'gameplay',
          head: rulesT.headers.gameplay,
          body: rulesT.gameplay,
        },
        {
          key: 'placement',
          head: rulesT.headers.placement,
          body: rulesT.placement,
        },
        { key: 'battle', head: rulesT.headers.battle, body: rulesT.battle },
        { key: 'ships', head: rulesT.headers.ships, body: rulesT.ships },
      ]
    : [];

  return (
    <PageLayout>
      <Container size="lg">
        <div className={styles.page}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href={homeHref} className={styles.breadcrumbLink}>
              {landing.breadcrumb.home}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={gamesHref} className={styles.breadcrumbLink}>
              {landing.breadcrumb.games}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{landing.breadcrumb.seaBattle}</span>
          </nav>

          {/* Hero */}
          <section className={styles.hero}>
            <div>
              <span className={styles.heroEyebrow}>{landing.hero.eyebrow}</span>
              <h1 className={styles.heroTitle}>{landing.hero.title}</h1>
              <p className={styles.heroTagline}>{landing.hero.tagline}</p>
              <p className={styles.heroIntro}>{landing.hero.intro}</p>

              <div
                className={styles.heroCtas}
                role="group"
                aria-label={landing.hero.ctaGroupLabel}
              >
                {/* Primary: one-click play vs AI — frictionless conversion. */}
                <QuickplayButton
                  gameId={SEA_BATTLE_GAME_ID}
                  mode="ai"
                  label={landing.hero.ctaQuickplay}
                  errorLabel={landing.hero.ctaQuickplayError}
                  variant={heroVariant}
                />
                {/* Secondary: matchmaking for users who want humans. */}
                <QuickplayButton
                  gameId={SEA_BATTLE_GAME_ID}
                  mode="human"
                  buttonVariant="secondary"
                  label={landing.hero.ctaPlayHuman}
                  errorLabel={landing.hero.ctaQuickplayError}
                  variant={heroVariant}
                />
                {/* Tertiary text links: power-user paths. */}
                <span className={styles.heroCtaDivider} aria-hidden="true" />
                <Link href={createRoomHref} className={styles.heroCtaLink}>
                  {landing.hero.ctaPlay}
                </Link>
                <Link href={roomsHref} className={styles.heroCtaLink}>
                  {landing.hero.ctaRooms}
                </Link>
              </div>

              <ul className={styles.heroChips}>
                {landing.hero.chips.map((chip) => (
                  <li key={chip}>
                    <Icon name="check" />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
            <SeaBattleLandingBoard
              variantNames={{
                classic: variantsT?.classic?.name,
                modern: variantsT?.modern?.name,
                cyber: variantsT?.cyber?.name,
                nebula: variantsT?.nebula?.name,
                pixel: variantsT?.pixel?.name,
                vintage: variantsT?.vintage?.name,
              }}
              label={landing.board.label}
              cycleHint={landing.board.cycleHint}
              cycleAriaLabel={landing.board.cycleAriaLabel}
              onVariantChange={setHeroVariant}
            />
          </section>

          {/* Highlights */}
          <section className={styles.section}>
            <header className={styles.sectionHead}>
              <div className={styles.sectionTitleGroup}>
                <p className={styles.sectionKicker}>
                  {landing.sections.highlightsKicker}
                </p>
                <h2 className={styles.sectionTitle}>
                  {landing.highlights.title}
                </h2>
              </div>
            </header>
            <div className={styles.highlightsGrid}>
              {highlightCards.map((card) => (
                <article key={card.key} className={styles.highlight}>
                  <div className={styles.highlightIcon}>
                    <Icon name={HIGHLIGHT_ICONS[card.key] ?? 'check'} />
                  </div>
                  <h3 className={styles.highlightTitle}>{card.title}</h3>
                  <p className={styles.highlightBody}>{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* How to play */}
          <section className={styles.section}>
            <header className={styles.sectionHead}>
              <div className={styles.sectionTitleGroup}>
                <p className={styles.sectionKicker}>
                  {landing.sections.howToKicker}
                </p>
                <h2 className={styles.sectionTitle}>
                  {landing.howToPlay.title}
                </h2>
              </div>
            </header>
            <ol className={styles.steps}>
              {howToSteps.map((step, idx) => (
                <li key={step.key} className={styles.step}>
                  <span className={styles.stepNumber}>{idx + 1}</span>
                  <div className={styles.stepGlyph}>
                    <Icon name={STEP_ICONS[idx] ?? 'check'} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Themes */}
          <section className={styles.section}>
            <header className={styles.sectionHead}>
              <div className={styles.sectionTitleGroup}>
                <p className={styles.sectionKicker}>
                  {landing.sections.themesKicker}
                </p>
                <h2 className={styles.sectionTitle}>
                  {landing.sections.themesTitle}
                </h2>
                <p className={styles.sectionLead}>
                  {landing.sections.themesLead}
                </p>
              </div>
            </header>
            <SeaBattleThemesGrid
              names={{
                classic: variantsT?.classic?.name,
                modern: variantsT?.modern?.name,
                pixel: variantsT?.pixel?.name,
                cartoon: variantsT?.cartoon?.name,
                cyber: variantsT?.cyber?.name,
                vintage: variantsT?.vintage?.name,
                nebula: variantsT?.nebula?.name,
                forest: variantsT?.forest?.name,
                sunset: variantsT?.sunset?.name,
                monochrome: variantsT?.monochrome?.name,
              }}
            />
          </section>

          {/* Rules */}
          {rulesT ? (
            <section className={styles.section}>
              <header className={styles.sectionHead}>
                <div className={styles.sectionTitleGroup}>
                  <p className={styles.sectionKicker}>
                    {landing.sections.rulesKicker}
                  </p>
                  <h2 className={styles.sectionTitle}>{rulesT.title}</h2>
                </div>
              </header>
              <div className={styles.rulesGrid}>
                {rules.map((r) => (
                  <article key={r.key} className={styles.ruleCard}>
                    <h3 className={styles.ruleHead}>{r.head}</h3>
                    <p className={styles.ruleBody}>{r.body}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {/* FAQ */}
          <section className={styles.section}>
            <header className={styles.sectionHead}>
              <div className={styles.sectionTitleGroup}>
                <p className={styles.sectionKicker}>
                  {landing.sections.faqKicker}
                </p>
                <h2 className={styles.sectionTitle}>{landing.faq.title}</h2>
              </div>
            </header>
            <div className={styles.faq}>
              {faqItems.map((item, idx) => (
                <details
                  key={item.key}
                  className={styles.faqItem}
                  open={idx === 0}
                >
                  <summary>{item.question}</summary>
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA — mirrors the hero pair so conversion intent is
              consistent top vs bottom of the page. */}
          <section className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>
              {landing.finalCta?.title ?? landing.hero.title}
            </h2>
            <p className={styles.finalCtaSub}>
              {landing.finalCta?.subtitle ?? landing.hero.tagline}
            </p>
            <div
              className={styles.finalCtaButtons}
              role="group"
              aria-label={landing.hero.ctaGroupLabel}
            >
              <QuickplayButton
                gameId={SEA_BATTLE_GAME_ID}
                mode="ai"
                label={landing.hero.ctaQuickplay}
                errorLabel={landing.hero.ctaQuickplayError}
                variant={heroVariant}
              />
              <QuickplayButton
                gameId={SEA_BATTLE_GAME_ID}
                mode="human"
                buttonVariant="secondary"
                label={landing.hero.ctaPlayHuman}
                errorLabel={landing.hero.ctaQuickplayError}
                variant={heroVariant}
              />
            </div>
          </section>
        </div>
      </Container>
    </PageLayout>
  );
}
