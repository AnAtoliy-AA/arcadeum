import React, { useCallback } from 'react';
import { styled, YStack, XStack, Text } from 'tamagui';
import { Button, GameVariant, ModalButton, OptionButton } from '@arcadeum/ui';

export { ModalButton, OptionButton };
import { CardsGrid, Card } from './cards';

const VARIANT_COLORS = {
  cyberpunk: {
    background: 'rgba(20, 0, 30, 0.95)',
    primary: '#06b6d4',
    accent: '#d946ef',
  },
  underwater: {
    background: 'rgba(8, 51, 68, 0.85)',
    primary: '#22d3ee',
    accent: '#22d3ee',
  },
};

const Overlay = styled(YStack, {
  name: 'ModalOverlay',
  position: 'sticky' as unknown as 'sticky',
  top: 0,
  left: 0,
  right: 0,
  minHeight: '100%',
  backgroundColor: 'rgba(0,0,0,0.8)',
  zIndex: 1000,
  justifyContent: 'center' as never,
  alignItems: 'center' as never,
});

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open = false, onOpenChange, children }: ModalProps) {
  const handleOverlayClick = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <Overlay onPress={handleOverlayClick} data-testid="modal-overlay">
      {children}
    </Overlay>
  );
}

const StyledModalFrame = styled(YStack, {
  name: 'ModalFrame',
  backgroundColor: '$background',
  borderWidth: 2,
  borderColor: '$borderColor',
  borderRadius: 24,
  maxWidth: 600,
  width: '100%',
  maxHeight: '90%',
  position: 'relative' as unknown as 'relative',
  elevation: 10,
  overflow: 'hidden',
  zIndex: 1001,

  variants: {
    variant: {
      cyberpunk: {
        borderRadius: 4,
        borderColor: '#c026d3',
        backgroundColor: VARIANT_COLORS.cyberpunk.background,
      },
      underwater: {
        borderColor: '#22d3ee',
        backgroundColor: VARIANT_COLORS.underwater.background,
      },
      crime: { borderColor: '#ef4444' },
      horror: { borderColor: '#7c3aed' },
      adventure: { borderColor: '#10b981' },
      'high-altitude-hike': { borderColor: '#06b6d4' },
      fiver: { borderColor: '#f59e0b' },
    },
  } as const,
});

const StyledScrollArea = styled(YStack, {
  name: 'ScrollArea',
  overflowY: 'auto',
  padding: '$6',
  width: '100%',
  height: '100%',
});

export const ModalContent = ({
  children,
  variant,
  $variant,
  onPress: _onPress,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: GameVariant;
  $variant?: GameVariant;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: { stopPropagation: () => void }) => void;
  [key: string]: unknown;
}) => {
  return (
    <StyledModalFrame
      variant={variant || ($variant as GameVariant)}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.({ stopPropagation: () => {} });
      }}
      {...props}
    >
      <StyledScrollArea>{children}</StyledScrollArea>
    </StyledModalFrame>
  );
};

export const ModalHeader = styled(XStack, {
  name: 'ModalHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$6',
  paddingBottom: '$4',
  borderBottomWidth: 2,
  borderBottomColor: '$borderColor',
  variants: {
    $variant: {
      cyberpunk: { borderBottomColor: VARIANT_COLORS.cyberpunk.primary },
      underwater: { borderBottomColor: VARIANT_COLORS.underwater.primary },
      crime: { borderBottomColor: '#ef4444' },
      horror: { borderBottomColor: '#7c3aed' },
      adventure: { borderBottomColor: '#10b981' },
      'high-altitude-hike': { borderBottomColor: '#06b6d4' },
      fiver: { borderBottomColor: '#f59e0b' },
    },
  } as const,
});

export const ModalTitle = styled(Text, {
  name: 'ModalTitle',
  fontSize: 24,
  fontWeight: '700',
  color: '$color',
  variants: {
    $variant: {
      cyberpunk: { color: VARIANT_COLORS.cyberpunk.primary },
      underwater: { color: VARIANT_COLORS.underwater.primary },
      crime: { color: '#ef4444' },
      horror: { color: '#7c3aed' },
      adventure: { color: '#10b981' },
      'high-altitude-hike': { color: '#06b6d4' },
      fiver: { color: '#f59e0b' },
    },
  } as const,
});

export const CloseButton = ({
  variant,
  $variant,
  children,
  onPress,
  onClick,
  ...props
}: {
  variant?: GameVariant;
  $variant?: GameVariant;
  children?: React.ReactNode;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: (e: { stopPropagation: () => void }) => void;
  [key: string]: unknown;
}) => (
  <Button
    variant="icon"
    size="sm"
    hoverStyle={{ rotate: '90deg' }}
    gameVariant={(variant || $variant) as GameVariant}
    onClick={onClick || onPress}
    {...props}
  >
    {children}
  </Button>
);

export const ModalSection = styled(YStack, {
  name: 'ModalSection',
  marginBottom: '$6',
});

export const SectionLabel = styled(Text, {
  name: 'SectionLabel',
  fontSize: 14,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: '$3',

  variants: {
    $variant: {
      cyberpunk: {
        color: VARIANT_COLORS.cyberpunk.primary,
      },
      underwater: {
        color: VARIANT_COLORS.underwater.primary,
      },
      crime: {
        color: '#ef4444',
      },
      horror: {
        color: '#7c3aed',
      },
      adventure: {
        color: '#10b981',
      },
      'high-altitude-hike': {
        color: '#06b6d4',
      },
      fiver: {
        color: '#f59e0b',
      },
    },
  } as const,
});

export const OptionGrid = styled(XStack, {
  name: 'OptionGrid',
  flexWrap: 'wrap',
  gap: '$3',
});

export const ModalActions = styled(XStack, {
  name: 'ModalActions',
  gap: '$3',
  marginTop: '$8',
});

export const ScrollableCardsGrid = styled(CardsGrid, {
  name: 'ScrollableCardsGrid',
  maxHeight: '55vh',
  overflowY: 'auto',
  padding: '$2',
});

export const SelectableCard = styled(Card, {
  name: 'SelectableCard',
  cursor: 'pointer',
  // transition: 'all 0.2s ease',

  variants: {
    selected: {
      true: {
        scale: 1.05,
        borderColor: 'white',
        borderWidth: 2,
      },
    },
  } as const,

  hoverStyle: {
    scale: 1.05,
  },
});

export const RulesText = styled(Text, {
  lineHeight: 24,
  opacity: 0.9,
});

export const RulesTextPre = styled(RulesText, {
  whiteSpace: 'pre-line',
});
