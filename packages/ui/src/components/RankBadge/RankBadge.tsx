import { Text, styled } from 'tamagui';

export const RankBadge = styled(Text, {
  name: 'RankBadge',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$1',
  fontWeight: '700',
  minWidth: 36,
  textAlign: 'center',
  borderWidth: 1,
  borderColor: 'transparent',

  variants: {
    tier: {
      mythic: {
        backgroundColor: 'rgba(236,72,153,0.18)',
        color: '$mythicAccent',
        borderColor: '$mythicAccent',
      },
      diamond: {
        backgroundColor: 'rgba(34,211,238,0.16)',
        color: '$diamondAccent',
        borderColor: '$diamondAccent',
      },
      platinum: {
        backgroundColor: 'rgba(167,139,250,0.16)',
        color: '$platinumAccent',
        borderColor: '$platinumAccent',
      },
      gold: {
        backgroundColor: 'rgba(250,204,21,0.16)',
        color: '$goldAccent',
        borderColor: '$goldAccent',
      },
      silver: {
        backgroundColor: 'rgba(148,163,184,0.16)',
        color: '$silverAccent',
        borderColor: '$silverAccent',
      },
      bronze: {
        backgroundColor: 'rgba(180,83,9,0.16)',
        color: '$bronzeAccent',
        borderColor: '$bronzeAccent',
      },
    },
  } as const,

  defaultVariants: {
    tier: 'gold',
  },
});

export type RankBadgeTier =
  | 'mythic'
  | 'diamond'
  | 'platinum'
  | 'gold'
  | 'silver'
  | 'bronze';
