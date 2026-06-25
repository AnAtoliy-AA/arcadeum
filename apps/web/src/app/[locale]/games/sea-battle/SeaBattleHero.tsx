'use client';

import Link from 'next/link';
import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import styles from './SeaBattleLanding.module.scss';
import { Icon } from './landingIcons';
import { QuickplayButton } from './QuickplayButton';
import { SeaBattleLandingBoard } from './SeaBattleLandingBoard';
import { useHeroVariant } from './heroVariantContext';

const SEA_BATTLE_GAME_ID = 'sea_battle_v1';

type Landing = SeaBattleGamesMessages['sea_battle_v1']['landing'];
type Variants = SeaBattleGamesMessages['sea_battle_v1']['variants'];

interface Props {
  landing: Landing;
  variantsT?: Variants;
  createRoomHref: string;
  roomsHref: string;
}

export function SeaBattleHero({
  landing,
  variantsT,
  createRoomHref,
  roomsHref,
}: Props) {
  const { variant, setVariant } = useHeroVariant();

  return (
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
          <QuickplayButton
            gameId={SEA_BATTLE_GAME_ID}
            mode="ai"
            label={landing.hero.ctaQuickplay}
            errorLabel={landing.hero.ctaQuickplayError}
            variant={variant}
          />
          <QuickplayButton
            gameId={SEA_BATTLE_GAME_ID}
            mode="human"
            buttonVariant="secondary"
            label={landing.hero.ctaPlayHuman}
            errorLabel={landing.hero.ctaQuickplayError}
            variant={variant}
          />
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
          forest: variantsT?.forest?.name,
          cartoon: variantsT?.cartoon?.name,
          sunset: variantsT?.sunset?.name,
          monochrome: variantsT?.monochrome?.name,
        }}
        label={landing.board.label}
        cycleHint={landing.board.cycleHint}
        cycleAriaLabel={landing.board.cycleAriaLabel}
        onVariantChange={setVariant}
      />
    </section>
  );
}
