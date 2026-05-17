import Link from 'next/link';
import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import {
  Container,
  GlassCard,
  PageLayout,
  PageTitle,
  Section,
  Typography,
  YStack,
  XStack,
  LinkButton,
} from '@/shared/ui';
import styles from './SeaBattleLanding.module.css';

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

export default function SeaBattleLanding({
  landing,
  rulesT,
  createRoomHref,
  roomsHref,
  homeHref,
  gamesHref,
}: Props) {
  if (!landing) return null;

  const highlightCards: Array<{
    key: string;
    title?: string;
    body?: string;
  }> = [
    { key: 'players', ...landing.highlights.players },
    { key: 'teams', ...landing.highlights.teams },
    { key: 'themes', ...landing.highlights.themes },
    { key: 'free', ...landing.highlights.free },
  ];

  const howToSteps: Array<{ key: string; title?: string; body?: string }> = [
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

  return (
    <PageLayout>
      <Container size="lg">
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

        <GlassCard padding="$6">
          <YStack gap="$4">
            <PageTitle size="xl" gradient>
              {landing.hero.title}
            </PageTitle>
            <Typography variant="body" uiSize="lg" alpha="high">
              {landing.hero.tagline}
            </Typography>
            <Typography variant="body" uiSize="md" alpha="medium">
              {landing.hero.intro}
            </Typography>
            <XStack gap="$3" flexWrap="wrap">
              <LinkButton href={createRoomHref} variant="primary" size="lg">
                {landing.hero.ctaPlay}
              </LinkButton>
              <LinkButton href={roomsHref} variant="secondary" size="lg">
                {landing.hero.ctaRooms}
              </LinkButton>
            </XStack>
          </YStack>
        </GlassCard>

        <Section title={landing.highlights.title}>
          <div className={styles.grid}>
            {highlightCards.map((card) => (
              <GlassCard key={card.key} padding="$5">
                <YStack gap="$2">
                  <Typography asChild uiSize="md" fontWeight="600">
                    <h3>{card.title}</h3>
                  </Typography>
                  <Typography variant="body" uiSize="sm" alpha="medium">
                    {card.body}
                  </Typography>
                </YStack>
              </GlassCard>
            ))}
          </div>
        </Section>

        <Section title={landing.howToPlay.title}>
          <ol className={styles.steps}>
            {howToSteps.map((step) => (
              <li key={step.key}>
                <Typography asChild uiSize="md" fontWeight="600">
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  {step.body}
                </Typography>
              </li>
            ))}
          </ol>
        </Section>

        {rulesT ? (
          <Section title={rulesT.title}>
            <YStack gap="$4">
              <article>
                <Typography asChild uiSize="md" fontWeight="600">
                  <h3>{rulesT.headers.objective}</h3>
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  {rulesT.objective}
                </Typography>
              </article>
              <article>
                <Typography asChild uiSize="md" fontWeight="600">
                  <h3>{rulesT.headers.gameplay}</h3>
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  {rulesT.gameplay}
                </Typography>
              </article>
              <article>
                <Typography asChild uiSize="md" fontWeight="600">
                  <h3>{rulesT.headers.placement}</h3>
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  {rulesT.placement}
                </Typography>
              </article>
              <article>
                <Typography asChild uiSize="md" fontWeight="600">
                  <h3>{rulesT.headers.battle}</h3>
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  {rulesT.battle}
                </Typography>
              </article>
              <article>
                <Typography asChild uiSize="md" fontWeight="600">
                  <h3>{rulesT.headers.ships}</h3>
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  <span style={{ whiteSpace: 'pre-line' }}>{rulesT.ships}</span>
                </Typography>
              </article>
            </YStack>
          </Section>
        ) : null}

        <Section title={landing.faq.title}>
          <YStack gap="$4">
            {faqItems.map((item) => (
              <GlassCard key={item.key} padding="$5">
                <Typography asChild uiSize="md" fontWeight="600">
                  <h3>{item.question}</h3>
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  {item.answer}
                </Typography>
              </GlassCard>
            ))}
          </YStack>
        </Section>

        <GlassCard padding="$6">
          <YStack gap="$3" ai="center">
            <Typography asChild uiSize="lg" fontWeight="600">
              <h2>{landing.hero.title}</h2>
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              alpha="medium"
              textAlign="center"
            >
              {landing.hero.tagline}
            </Typography>
            <LinkButton href={createRoomHref} variant="primary" size="lg">
              {landing.hero.ctaPlay}
            </LinkButton>
          </YStack>
        </GlassCard>
      </Container>
    </PageLayout>
  );
}
