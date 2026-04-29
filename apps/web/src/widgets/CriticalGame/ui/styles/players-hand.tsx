import { styled, YStack, XStack, H2 } from 'tamagui';
import { Button, GameVariant } from '@arcadeum/ui';
import { Card, ActionButton, ActionButtonProps } from './cards';
import { getVariantStyles } from './variants';

// Hand Components
export const HandHeader = styled(XStack, {
  name: 'HandHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$4',
  flexWrap: 'wrap',
  gap: '$2',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const HandTitle = styled(H2, {
  name: 'HandTitle',
  marginRight: 'auto',
  fontSize: 14,
  fontWeight: '800',
  color: '$color',
  textTransform: 'uppercase',
  letterSpacing: 1,

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const HandControls = styled(XStack, {
  name: 'HandControls',
  flexWrap: 'wrap',
  gap: '$2',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const HandToggleButton = (props: ActionButtonProps) => (
  <ActionButton
    paddingVertical="$2"
    paddingHorizontal="$4"
    fontSize={12}
    minWidth="auto"
    width="auto"
    {...props}
  />
);

export const DropdownContainer = styled(YStack, {
  name: 'DropdownContainer',
  position: 'relative',

  variants: {
    $variant: (_val: unknown) => ({}),
  } as const,
});

export const DropdownTrigger = ({
  variant,
  $variant,
  isOpen,
  $isOpen,
  ...props
}: {
  variant?: GameVariant;
  $variant?: GameVariant;
  isOpen?: boolean;
  $isOpen?: boolean;
  [key: string]: unknown;
}) => (
  <Button
    variant="chip"
    size="sm"
    minWidth={120}
    justifyContent="flex-start"
    isActive={isOpen || $isOpen}
    gameVariant={(variant || $variant) as GameVariant}
    {...props}
  />
);

export const DropdownList = styled(YStack, {
  name: 'DropdownList',
  position: 'absolute',
  top: '100%',
  marginTop: 4,
  right: 0,
  zIndex: 100,
  minWidth: '100%',
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: '#1e293b',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  elevation: 10,

  variants: {
    $variant: (val: string) => {
      // Re-using tableInfo or chat variants for dropdown list as they are similar
      const config = getVariantStyles(val).chat;
      return {
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder() || 'rgba(255, 255, 255, 0.1)',
        shadowColor: config.getShadow(),
      };
    },
  } as const,
});

export const DropdownItem = ({
  isActive,
  $isActive,
  variant,
  $variant,
  ...props
}: {
  isActive?: boolean;
  $isActive?: boolean;
  variant?: GameVariant;
  $variant?: GameVariant;
  [key: string]: unknown;
}) => (
  <Button
    variant="listItem"
    size="sm"
    isActive={isActive || $isActive}
    gameVariant={(variant || $variant) as GameVariant}
    {...props}
  />
);

// Gold (yellow-400) ring + layered drop-shadow + soft glow used when a hand
// card is hovered/focused ("selected"). Spec: 2px gold border + triple-stack
// shadow from Task 12.
export const HAND_CARD_SELECTED_SHADOW =
  '0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.4), 0 0 24px rgba(250, 204, 21, 0.4)';
export const HAND_CARD_SELECTED_BORDER_COLOR = 'rgba(250, 204, 21, 1)';

export const HandCard = styled(Card, {
  name: 'HandCard',
  flexShrink: 0,
  // Size is now controlled via $size variant (set per-card by PlayerHand based
  // on useMedia().sm). Default width kept for any legacy callers.
  width: 110,
  variants: {
    $clickable: {
      true: { cursor: 'pointer', opacity: 1 },
      false: { cursor: 'default' },
    },
    $dimmed: {
      true: { opacity: 0.7 },
    },
    $size: {
      desktopFan: {
        width: 82,
        height: 114,
        aspectRatio: undefined,
        hoverStyle: {
          y: -26,
          borderColor: HAND_CARD_SELECTED_BORDER_COLOR,
          borderWidth: 2,
          boxShadow: HAND_CARD_SELECTED_SHADOW,
        },
      },
      mobileFlat: {
        width: 104,
        height: 142,
        aspectRatio: undefined,
        pressStyle: {
          y: -14,
          borderColor: HAND_CARD_SELECTED_BORDER_COLOR,
          borderWidth: 2,
          boxShadow: HAND_CARD_SELECTED_SHADOW,
        },
      },
    },
    $variant: (val: string) => {
      const config = getVariantStyles(val).cards;
      return {
        ...config.getCardStyles?.(),
      };
    },
  } as const,
});
