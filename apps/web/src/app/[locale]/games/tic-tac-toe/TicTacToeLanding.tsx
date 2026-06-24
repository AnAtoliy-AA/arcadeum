import Link from 'next/link';
import { Container, PageLayout } from '@arcadeum/ui';
import type { TicTacToeMessages } from '@/shared/i18n/messages/games/tic-tac-toe';
import styles from './TicTacToeLanding.module.scss';
import { TicTacToeHero } from './TicTacToeHero';
import { TicTacToeThemesGrid } from './TicTacToeThemesGrid';
import { TicTacToeFinalCtaButtons } from './TicTacToeFinalCtaButtons';

type TttMessages = TicTacToeMessages['tic_tac_toe_v1'];
type Landing = TttMessages['landing'];
type Variants = TttMessages['variants'];
type Rules = TttMessages['rules'];

interface Props {
  landing?: Landing;
  variants?: Variants;
  rules?: Rules;
  createRoomHref: string;
  roomsHref: string;
  gamesHref: string;
  homeHref: string;
}

export default function TicTacToeLanding({
  landing,
  variants,
  rules,
  createRoomHref,
  roomsHref,
  gamesHref,
  homeHref,
}: Props) {
  if (!landing) return null;

  const highlights = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'sizes', icon: '🎯', ...landing.highlights.sizes },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
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
          <TicTacToeHero
            title={landing.hero.title}
            subtitle={landing.hero.subtitle}
            createRoomHref={createRoomHref}
            roomsHref={roomsHref}
            createRoomLabel={landing.hero.createRoom}
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
              <TicTacToeThemesGrid
                variants={variants}
                baseHref={createRoomHref}
              />
            </section>
          ) : null}

          {rules ? (
            <section className={styles.rules}>
              <h2 className={styles.sectionTitle}>{rules.title}</h2>
              <p>{rules.steps}</p>
              <p className={styles.rulesNote}>{rules.winLengths}</p>
            </section>
          ) : null}

          <section className={styles.faq}>
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

          <TicTacToeFinalCtaButtons
            createRoomHref={createRoomHref}
            roomsHref={roomsHref}
            gamesHref={gamesHref}
            createRoomLabel={landing.hero.createRoom}
            browseRoomsLabel={landing.hero.browseRooms}
          />

          <nav className={styles.breadcrumbs}>
            <Link href={homeHref}>Home</Link>
            <span aria-hidden> / </span>
            <Link href={gamesHref}>Games</Link>
            <span aria-hidden> / </span>
            <span>Tic-Tac-Toe</span>
          </nav>
        </main>
      </Container>
    </PageLayout>
  );
}
