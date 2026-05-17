import Link from 'next/link';
import type { CSSProperties, ReactElement } from 'react';
import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import { Container, PageLayout, LinkButton } from '@/shared/ui';
import styles from './SeaBattleLanding.module.css';
import { HIGHLIGHT_ICONS, Icon, STEP_ICONS } from './landingIcons';
import { THEME_PREVIEWS, type ThemePreview } from './themePreviews';

type Landing = SeaBattleGamesMessages['sea_battle_v1']['landing'];
type Rules = SeaBattleGamesMessages['sea_battle_v1']['rules'];

interface Props {
  landing?: Landing;
  rulesT?: Rules;
  createRoomHref: string;
  roomsHref: string;
  homeHref: string;
  gamesHref: string;
}

/* ------------------------------------------------------------------ */
/* Visual: animated 10×10 sonar board with ships, hits, misses        */
/* ------------------------------------------------------------------ */

const SHIPS: ReadonlyArray<readonly [number, number]> = [
  [1, 2],
  [1, 3],
  [1, 4],
  [4, 7],
  [5, 7],
  [6, 7],
  [7, 7],
  [7, 1],
  [7, 2],
];
const HITS = new Set(['4-7', '5-7', '7-2']);
const MISSES = new Set(['2-6', '3-3', '8-5', '5-2', '6-9']);
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function SonarBoard({ label }: { label: string }) {
  const cells: ReactElement[] = [];
  for (let r = 0; r < 10; r += 1) {
    for (let c = 0; c < 10; c += 1) {
      const key = `${r}-${c}`;
      const isShip = SHIPS.some(([sr, sc]) => sr === r && sc === c);
      const isHit = HITS.has(key);
      const isMiss = MISSES.has(key);
      const className = [
        styles.boardCell,
        isShip && !isHit ? styles.ship : '',
        isHit ? `${styles.ship} ${styles.hit}` : '',
        isMiss ? styles.miss : '',
      ]
        .filter(Boolean)
        .join(' ');
      cells.push(<div key={key} className={className} />);
    }
  }

  return (
    <div className={styles.boardWrap} aria-hidden="true">
      <span className={styles.boardLabel}>{label}</span>
      <div className={styles.boardCoordsTop}>
        {COL_LABELS.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className={styles.boardCoordsSide}>
        {ROW_LABELS.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
      <div className={styles.board}>{cells}</div>
      <div className={styles.sonarSweep} />
      <div className={styles.sonarCenter} />
    </div>
  );
}

function ThemeChip({ theme }: { theme: ThemePreview }) {
  const style = {
    ['--cellGrid' as never]: theme.grid,
    ['--cellBg' as never]: theme.cellBg,
    ['--cellShip' as never]: theme.ship,
    ['--cellHit' as never]: theme.hit,
  } as CSSProperties;
  return (
    <div className={styles.themeChip} style={style}>
      <div className={styles.themeChipBoard}>
        {theme.cells.map((kind, idx) => (
          <span key={idx} className={kind ? styles[kind] : undefined} />
        ))}
      </div>
      <span className={styles.themeChipName}>{theme.name}</span>
    </div>
  );
}

export default function SeaBattleLanding({
  landing,
  rulesT,
  createRoomHref,
  roomsHref,
  homeHref,
  gamesHref,
}: Props) {
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

              <div className={styles.heroCtas}>
                <LinkButton href={createRoomHref} variant="primary" size="lg">
                  {landing.hero.ctaPlay}
                </LinkButton>
                <LinkButton href={roomsHref} variant="secondary" size="lg">
                  {landing.hero.ctaRooms}
                </LinkButton>
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
            <SonarBoard label={landing.board.label} />
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
            <div className={styles.themeStrip}>
              {THEME_PREVIEWS.map((t) => (
                <ThemeChip key={t.key} theme={t} />
              ))}
            </div>
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

          {/* Final CTA */}
          <section className={styles.finalCta}>
            <h2 className={styles.finalCtaTitle}>{landing.hero.title}</h2>
            <p className={styles.finalCtaSub}>{landing.hero.tagline}</p>
            <LinkButton href={createRoomHref} variant="primary" size="lg">
              {landing.hero.ctaPlay}
            </LinkButton>
          </section>
        </div>
      </Container>
    </PageLayout>
  );
}
