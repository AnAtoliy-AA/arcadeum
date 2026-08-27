import { SoloGameLanding } from '@/features/games/ui/landing';
import type { SudokuMessages } from '@/shared/i18n/messages/games/sudoku';

type Landing = SudokuMessages['sudoku_v1']['landing'];
type Rules = SudokuMessages['sudoku_v1']['rules'];

interface Props {
  landing?: Landing;
  rules?: Rules;
  playHref: string;
  gamesHref: string;
  homeHref: string;
}

const FEATURE_ICONS = ['🔢', '💾', '📊'] as const;
const FEATURE_KEYS = ['solo', 'progress', 'stats'] as const;
const FAQ_KEYS = ['q1', 'q2', 'q3'] as const;
const STEP_KEYS = ['create', 'join', 'play'] as const;

export default function SudokuLanding({
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
      accentGlowClass="from-sky-500/15 via-indigo-500/10"
      accentTextClass="text-sky-400 bg-sky-400/15"
      gamesHref={gamesHref}
      homeHref={homeHref}
      playHref={playHref}
    />
  );
}
