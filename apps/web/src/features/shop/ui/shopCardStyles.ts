import { YStack as Stack } from 'tamagui';
import { styled } from 'tamagui';

export const CardFrame = styled(
  Stack,
  {
    name: 'ShopCardFrame',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: 200,
    borderRadius: '$4',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'hidden',
    position: 'relative',
    hoverStyle: {
      borderColor: 'rgba(255,255,255,0.22)',
      backgroundColor: 'rgba(255,255,255,0.04)',
      y: -2,
    },

    variants: {
      small: {
        true: { width: 144 },
      },
    } as const,
  },
  {
    defaultProps: {
      animation: 'quick',
    },
  },
);

export const ArtBox = styled(Stack, {
  name: 'ShopCardArt',
  position: 'relative',
  height: 140,
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    small: {
      true: { height: 96 },
    },
  } as const,
});

export const Chip = styled(Stack, {
  name: 'ShopCardChip',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: '$2',
  borderWidth: 1,
});

export const ActionButton = styled(
  Stack,
  {
    name: 'ShopCardActionButton',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: '$2',
    borderRadius: '$3',
    borderWidth: 1,
    cursor: 'pointer',
    focusStyle: {
      outlineColor: 'rgba(125,211,252,0.6)',
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineOffset: 1,
    },

    variants: {
      intent: {
        buy: {
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(255,255,255,0.18)',
          hoverStyle: {
            backgroundColor: 'rgba(255,255,255,0.10)',
            borderColor: 'rgba(255,255,255,0.30)',
          },
        },
        equip: {
          backgroundColor: 'rgba(16,185,129,0.12)',
          borderColor: 'rgba(34,197,94,0.45)',
          hoverStyle: {
            backgroundColor: 'rgba(16,185,129,0.20)',
            borderColor: 'rgba(34,197,94,0.70)',
          },
        },
        unequip: {
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.14)',
          hoverStyle: {
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.28)',
          },
        },
      },
      affordable: {
        false: { opacity: 0.7 },
        true: {},
      },
      pending: {
        true: { opacity: 0.55 },
        false: {},
      },
    } as const,
  },
  {
    defaultProps: {
      animation: 'quick',
    },
  },
);

export function uuid(): string {
  return globalThis.crypto.randomUUID();
}
