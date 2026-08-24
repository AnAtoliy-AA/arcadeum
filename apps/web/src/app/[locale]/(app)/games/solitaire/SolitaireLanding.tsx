import { SoloGameLanding } from '@/features/games/ui/landing';
import type { SolitaireMessages } from '@/shared/i18n/messages/games/solitaire';

type Landing = SolitaireMessages['solitaire_v1']['landing'];
type Rules = SolitaireMessages['solitaire_v1']['rules'];

interface Props {
  landing?: Landing;
  rules?: Rules;
  gameId: string;
  playHref: string;
  gamesHref: string;
  homeHref: string;
  locale: string;
}

const FEATURE_ICONS = ['🃏', '💾', '📊'] as const;
const FEATURE_KEYS = ['solo', 'progress', 'stats'] as const;
const FAQ_KEYS = ['q1', 'q2', 'q3'] as const;
const STEP_KEYS = ['create', 'join', 'play'] as const;

export default function SolitaireLanding({
  landing,
  rules,
  playHref,
  gamesHref,
  homeHref,
}: Props) {
  if (!landing || !rules) return null;

  return (
    <SoloGameLanding
      copy={{
        name: landing.hero.title,
        tagline: landing.tagline,
        heroSubtitle: landing.hero.subtitle,
        ctaPlayLabel: landing.hero.ctaPlay,
        features: FEATURE_KEYS.map((key, index) => ({
          icon: FEATURE_ICONS[index],
          ...landing.features[key],
        })),
        steps: STEP_KEYS.map((key) => landing.steps[key]),
        rules: (
          [
            ['objective', rules.objective],
            ['gameplay', rules.gameplay],
            ['scoring', rules.scoring],
          ] as const
        ).map(([label, body]) => ({ label, body })),
        faq: FAQ_KEYS.map((key) => landing.faq[key]),
      }}
      gamesHref={gamesHref}
      homeHref={homeHref}
      playHref={playHref}
    />
  );
}
