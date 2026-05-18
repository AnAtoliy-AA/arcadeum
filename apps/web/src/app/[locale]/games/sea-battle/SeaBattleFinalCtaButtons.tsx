'use client';

import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import styles from './SeaBattleLanding.module.css';
import { QuickplayButton } from './QuickplayButton';
import { useHeroVariant } from './heroVariantContext';

const SEA_BATTLE_GAME_ID = 'sea_battle_v1';

type Landing = SeaBattleGamesMessages['sea_battle_v1']['landing'];

interface Props {
  landing: Landing;
}

export function SeaBattleFinalCtaButtons({ landing }: Props) {
  const { variant } = useHeroVariant();

  return (
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
    </div>
  );
}
