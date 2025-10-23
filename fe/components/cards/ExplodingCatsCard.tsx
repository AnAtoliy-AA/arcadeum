import { memo } from 'react';
import type { SvgProps } from 'react-native-svg';

import ExplodingCat1 from '@/assets/cards/exploding-cat-1.svg';
import ExplodingCat2 from '@/assets/cards/exploding-cat-2.svg';
import ExplodingCat3 from '@/assets/cards/exploding-cat-3.svg';
import Defuse1 from '@/assets/cards/defuse-1.svg';
import Defuse2 from '@/assets/cards/defuse-2.svg';
import Defuse3 from '@/assets/cards/defuse-3.svg';
import Attack1 from '@/assets/cards/attack-1.svg';
import Attack2 from '@/assets/cards/attack-2.svg';
import Attack3 from '@/assets/cards/attack-3.svg';
import Skip1 from '@/assets/cards/skip-1.svg';
import Skip2 from '@/assets/cards/skip-2.svg';
import Skip3 from '@/assets/cards/skip-3.svg';
import HairballRedirect1 from '@/assets/cards/hairball-redirect-1.svg';
import HairballRedirect2 from '@/assets/cards/hairball-redirect-2.svg';
import HairballRedirect3 from '@/assets/cards/hairball-redirect-3.svg';
import CatnipFirewall1 from '@/assets/cards/catnip-firewall-1.svg';
import CatnipFirewall2 from '@/assets/cards/catnip-firewall-2.svg';
import CatnipFirewall3 from '@/assets/cards/catnip-firewall-3.svg';
import TemporalLaserPointer1 from '@/assets/cards/temporal-laser-pointer-1.svg';
import TemporalLaserPointer2 from '@/assets/cards/temporal-laser-pointer-2.svg';
import TemporalLaserPointer3 from '@/assets/cards/temporal-laser-pointer-3.svg';
import Tacocat1 from '@/assets/cards/tacocat-1.svg';
import Tacocat2 from '@/assets/cards/tacocat-2.svg';
import Tacocat3 from '@/assets/cards/tacocat-3.svg';
import HairyPotatoCat1 from '@/assets/cards/hairy-potato-cat-1.svg';
import HairyPotatoCat2 from '@/assets/cards/hairy-potato-cat-2.svg';
import HairyPotatoCat3 from '@/assets/cards/hairy-potato-cat-3.svg';
import RainbowRalphingCat1 from '@/assets/cards/rainbow-ralphing-cat-1.svg';
import RainbowRalphingCat2 from '@/assets/cards/rainbow-ralphing-cat-2.svg';
import RainbowRalphingCat3 from '@/assets/cards/rainbow-ralphing-cat-3.svg';
import Cattermelon1 from '@/assets/cards/cattermelon-1.svg';
import Cattermelon2 from '@/assets/cards/cattermelon-2.svg';
import Cattermelon3 from '@/assets/cards/cattermelon-3.svg';
import BeardedCat1 from '@/assets/cards/bearded-cat-1.svg';
import BeardedCat2 from '@/assets/cards/bearded-cat-2.svg';
import BeardedCat3 from '@/assets/cards/bearded-cat-3.svg';

const CARD_ARTWORK = {
  'exploding-cat': [ExplodingCat1, ExplodingCat2, ExplodingCat3],
  defuse: [Defuse1, Defuse2, Defuse3],
  attack: [Attack1, Attack2, Attack3],
  skip: [Skip1, Skip2, Skip3],
  'hairball-redirect': [HairballRedirect1, HairballRedirect2, HairballRedirect3],
  'temporal-laser-pointer': [TemporalLaserPointer1, TemporalLaserPointer2, TemporalLaserPointer3],
  'catnip-firewall': [CatnipFirewall1, CatnipFirewall2, CatnipFirewall3],
  tacocat: [Tacocat1, Tacocat2, Tacocat3],
  'hairy-potato-cat': [HairyPotatoCat1, HairyPotatoCat2, HairyPotatoCat3],
  'rainbow-ralphing-cat': [RainbowRalphingCat1, RainbowRalphingCat2, RainbowRalphingCat3],
  cattermelon: [Cattermelon1, Cattermelon2, Cattermelon3],
  'bearded-cat': [BeardedCat1, BeardedCat2, BeardedCat3],
} as const;

export type CardKey = keyof typeof CARD_ARTWORK;

type ExplodingCatsCardProps = SvgProps & {
  card: CardKey;
  variant?: 1 | 2 | 3;
  accessibilityLabel?: string;
};

export const ExplodingCatsCard = memo(({ card, variant = 1, accessibilityLabel, accessibilityRole, accessible, ...svgProps }: ExplodingCatsCardProps) => {
  const variants = CARD_ARTWORK[card];
  const index = Math.min(Math.max(variant, 1), variants.length) - 1;
  const Artwork = variants[index];

  const role = accessible === false ? undefined : accessibilityRole ?? 'image';
  const label = accessible === false ? undefined : accessibilityLabel ?? `${card} card`;

  return (
    <Artwork
      accessible={accessible}
      accessibilityRole={role}
      accessibilityLabel={label}
      {...svgProps}
    />
  );
});

ExplodingCatsCard.displayName = 'ExplodingCatsCard';
