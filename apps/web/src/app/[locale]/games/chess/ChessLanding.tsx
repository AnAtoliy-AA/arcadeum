import Link from 'next/link';
import type { ChessMessages } from '@/shared/i18n/messages/games/chess';
import styles from './ChessLanding.module.scss';
import { ChessHero } from './ChessHero';
import { ChessFinalCtaButtons } from './ChessFinalCtaButtons';

type ChessMsg = ChessMessages['chess_v1'];
type Landing = ChessMsg['landing'];
type Rules = ChessMsg['rules'];

interface Props {
  landing?: Landing;
  rules?: Rules;
  gameId: string;
  roomsHref: string;
  gamesHref: string;
  homeHref: string;
  navTranslations?: {
    homeTab: string;
    gamesTab: string;
  };
}

export default function ChessLanding({
  landing,
  rules,
  gameId,
  roomsHref,
  gamesHref,
  homeHref,
  navTranslations,
}: Props) {
  if (!landing) return null;

  const highlights = [
    { key: 'players', icon: '♟', ...landing.highlights.players },
    { key: 'variants', icon: '🎲', ...landing.highlights.variants },
    { key: 'clock', icon: '⏱', ...landing.highlights.clock },
  ];

  const steps = [
    { key: 'create', step: '1', ...landing.steps.create },
    { key: 'join', step: '2', ...landing.steps.join },
    { key: 'play', step: '3', ...landing.steps.play },
  ];

  return (
    <main className={styles.root}>
      <ChessHero
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

      {rules ? (
        <section className={styles.rules}>
          <h2 className={styles.sectionTitle}>{rules.title}</h2>
          <p>{rules.objective}</p>
          <p>{rules.pieces}</p>
          <p>{rules.special}</p>
        </section>
      ) : null}

      <section className={styles.faq} id="faq">
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

      <ChessFinalCtaButtons
        gameId={gameId}
        roomsHref={roomsHref}
        gamesHref={gamesHref}
        ctaQuickplayLabel={landing.hero.ctaQuickplay}
        ctaQuickplayErrorLabel={landing.hero.ctaQuickplayError}
        browseRoomsLabel={landing.hero.browseRooms}
        backToGamesLabel={landing.hero.backToGames ?? '← Games'}
      />

      <nav className={styles.breadcrumbs}>
        <Link href={homeHref}>{navTranslations?.homeTab ?? 'Home'}</Link>
        <span aria-hidden> / </span>
        <Link href={gamesHref}>{navTranslations?.gamesTab ?? 'Games'}</Link>
        <span aria-hidden> / </span>
        <span>{landing?.hero?.title ?? 'Chess'}</span>
      </nav>
    </main>
  );
}
