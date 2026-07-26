import Link from 'next/link';
import { Container, PageLayout } from '@arcadeum/ui';
import type { CheckersMessages } from '@/shared/i18n/messages/games/checkers';
import styles from './CheckersLanding.module.scss';
import { CheckersHero } from './CheckersHero';
import { CheckersThemesGrid } from './CheckersThemesGrid';
import { CheckersFinalCtaButtons } from './CheckersFinalCtaButtons';

type CkMessages = CheckersMessages['checkers_v1'];
type Landing = CkMessages['landing'];
type Variants = CkMessages['variants'];
type Rules = CkMessages['rules'];

interface Props {
  landing?: Landing;
  variants?: Variants;
  rules?: Rules;
  gameId: string;
  createRoomHref: string;
  roomsHref: string;
  gamesHref: string;
  homeHref: string;
}

export default function CheckersLanding({
  landing,
  variants,
  rules,
  gameId,
  createRoomHref,
  roomsHref,
  gamesHref,
  homeHref,
}: Props) {
  if (!landing) return null;

  const highlights = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'captures', icon: '⚡', ...landing.highlights.captures },
    { key: 'kings', icon: '👑', ...landing.highlights.kings },
  ];

  const steps = [
    { key: 'create', step: '1', ...landing.steps.create },
    { key: 'join', step: '2', ...landing.steps.join },
    { key: 'play', step: '3', ...landing.steps.play },
  ];

  return (
    <PageLayout>
      <Container>
        <main className={styles.root}>
          <CheckersHero
            title={landing.hero.title}
            subtitle={landing.hero.subtitle}
            gameId={gameId}
            roomsHref={roomsHref}
            ctaQuickplayLabel={landing.hero.ctaQuickplay}
            ctaQuickplayErrorLabel={landing.hero.ctaQuickplayError}
            browseRoomsLabel={landing.hero.browseRooms}
          />

          <section className={styles.highlights}>
            {highlights.map((h) => (
              <div key={h.key} className={styles.highlightCard}>
                <span className={styles.highlightIcon}>{h.icon}</span>
                <h2 className={styles.highlightTitle}>{h.title}</h2>
                <p className={styles.highlightBody}>{h.body}</p>
              </div>
            ))}
          </section>

          <section className={styles.steps}>
            {steps.map((s) => (
              <div key={s.key} className={styles.stepCard}>
                <span className={styles.stepNumber}>{s.step}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </section>

          {variants ? (
            <section className={styles.themes}>
              <h2 className={styles.sectionTitle}>{landing.themes.title}</h2>
              <p className={styles.sectionSubtitle}>
                {landing.themes.subtitle}
              </p>
              <CheckersThemesGrid
                variants={variants}
                baseHref={createRoomHref}
              />
            </section>
          ) : null}

          {rules ? (
            <section className={styles.rules}>
              <h2 className={styles.sectionTitle}>{rules.title}</h2>
              <p>{rules.objective}</p>
              <p>{rules.steps}</p>
              <p>{rules.kingPromotion}</p>
              <p>{rules.forcedCaptures}</p>
            </section>
          ) : null}

          <section id="faq" className={styles.faq}>
            {Object.entries(landing.faq).map(([key, entry]) => {
              const e = entry as { question: string; answer: string };
              return (
                <div key={key} className={styles.faqItem}>
                  <h3 className={styles.faqQuestion}>{e.question}</h3>
                  <p className={styles.faqAnswer}>{e.answer}</p>
                </div>
              );
            })}
          </section>

          <CheckersFinalCtaButtons
            gameId={gameId}
            roomsHref={roomsHref}
            gamesHref={gamesHref}
            ctaQuickplayLabel={landing.hero.ctaQuickplay}
            ctaQuickplayErrorLabel={landing.hero.ctaQuickplayError}
            browseRoomsLabel={landing.hero.browseRooms}
          />

          <nav className={styles.breadcrumbs}>
            <Link href={homeHref}>Home</Link>
            <span aria-hidden> / </span>
            <Link href={gamesHref}>Games</Link>
            <span aria-hidden> / </span>
            <span>Checkers</span>
          </nav>
        </main>
      </Container>
    </PageLayout>
  );
}
