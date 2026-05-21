import Link from 'next/link';
import type { CriticalGamesMessages } from '@/shared/i18n/messages/games/critical';
import { Container, PageLayout } from '@/shared/ui';
import styles from './CriticalLanding.module.css';

type CriticalMessages = CriticalGamesMessages['critical_v1'];
type Landing = CriticalMessages['landing'];

interface Props {
  landing?: Landing;
  createRoomHref: string;
  roomsHref: string;
  homeHref: string;
  gamesHref: string;
}

export function CriticalLandingView({
  landing,
  createRoomHref,
  roomsHref,
  homeHref,
  gamesHref,
}: Props) {
  if (!landing) return null;

  const faqItems = Object.values(landing.faq.items);

  return (
    <PageLayout>
      <Container size="md">
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <ol>
            <li>
              <Link href={homeHref}>{landing.breadcrumb.home}</Link>
            </li>
            <li>
              <Link href={gamesHref}>{landing.breadcrumb.games}</Link>
            </li>
            <li aria-current="page">{landing.breadcrumb.critical}</li>
          </ol>
        </nav>

        <section
          className={styles.hero}
          aria-labelledby="critical-hero-heading"
        >
          <span className={styles.eyebrow}>{landing.hero.eyebrow}</span>
          <h1 id="critical-hero-heading" className={styles.title}>
            {landing.hero.title}
          </h1>
          <p className={styles.tagline}>{landing.hero.tagline}</p>
          <p className={styles.intro}>{landing.hero.intro}</p>

          <div
            className={styles.ctas}
            role="group"
            aria-label={landing.hero.ctaGroupLabel}
          >
            <Link href={createRoomHref} className={styles.ctaPrimary}>
              {landing.hero.ctaPlay}
            </Link>
            <Link href={roomsHref} className={styles.ctaSecondary}>
              {landing.hero.ctaRooms}
            </Link>
          </div>

          <ul className={styles.chips}>
            {landing.hero.chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        </section>

        <section
          className={styles.section}
          aria-labelledby="critical-about-heading"
        >
          <span className={styles.kicker}>{landing.sections.aboutKicker}</span>
          <h2 id="critical-about-heading" className={styles.sectionTitle}>
            {landing.about.title}
          </h2>
          {landing.about.paragraphs.map((paragraph, index) => (
            <p key={index} className={styles.sectionBody}>
              {paragraph}
            </p>
          ))}
        </section>

        <section
          className={styles.section}
          aria-labelledby="critical-faq-heading"
        >
          <span className={styles.kicker}>{landing.sections.faqKicker}</span>
          <h2 id="critical-faq-heading" className={styles.sectionTitle}>
            {landing.faq.title}
          </h2>
          <ul className={styles.faqList}>
            {faqItems.map((item, index) => (
              <li key={index} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.question}</h3>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={styles.finalCta}
          aria-labelledby="critical-final-cta-heading"
        >
          <h2 id="critical-final-cta-heading" className={styles.finalCtaTitle}>
            {landing.finalCta.title}
          </h2>
          <p className={styles.finalCtaSubtitle}>{landing.finalCta.subtitle}</p>
          <Link href={createRoomHref} className={styles.ctaPrimary}>
            {landing.hero.ctaPlay}
          </Link>
        </section>
      </Container>
    </PageLayout>
  );
}
