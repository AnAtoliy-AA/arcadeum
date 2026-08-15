import {
  styled,
  YStack,
  XStack,
  Text,
  Dialog,
  TamaguiComponent,
} from 'tamagui';
import React, { ComponentProps } from 'react';
import { Button, GameVariant } from '@arcadeum/ui';

// Simplified constants/types to avoid external deps
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

export const Modal = styled(Dialog, {
  name: 'Modal',
});

export const StyledModalFrame: TamaguiComponent = styled(Dialog.Content, {
  name: 'ModalFrame',
  maxWidth: 600,
  width: '100%',
  maxHeight: 'calc(100vh - 40px)',
  position: 'relative',
  margin: 'auto',
  overflow: 'hidden',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: 24,
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  shadowRadius: 60,
  shadowOffset: { width: 0, height: 20 },
  zIndex: 1200,

  variants: {
    variant: {
      cyberpunk: {
        backgroundColor: VARIANT_COLORS.cyberpunk.background,
        borderColor: 'rgba(192, 38, 211, 0.6)',
        borderWidth: 2,
        borderRadius: 4,
        shadowColor: 'rgba(192, 38, 211, 0.2)',
        shadowRadius: 30,
      },
      underwater: {
        backgroundColor: VARIANT_COLORS.underwater.background,
        borderColor: 'rgba(34, 211, 238, 0.5)',
        borderWidth: 2,
        borderRadius: 24,
        shadowColor: 'rgba(34, 211, 238, 0.2)',
        shadowRadius: 30,
      },
    },
  } as const,
});

export const StyledScrollArea = styled(YStack, {
  name: 'ModalScrollArea',
  overflowY: 'auto',
  padding: '$5',
  width: '100%',
  height: '100%',
});

export const ModalContent = ({
  children,
  $variant,
  ...props
}: ComponentProps<typeof StyledModalFrame> & { $variant?: string }) => {
  const variant = ($variant as GameVariant) || 'default';

  return (
    <StyledModalFrame variant={variant as unknown as 'cyberpunk'} {...props}>
      {variant === 'cyberpunk' && (
        <>
          <div
            className={
              '"box-border flex flex-col items-stretch absolute top-[-2px] left-[-2px] w-[20px] h-[20px] border-t-[2px] border-l-[2px] pointer-events-none"'
            }
            style={{ borderColor: VARIANT_COLORS.cyberpunk.primary }}
          />
          <div
            className={
              '"box-border flex flex-col items-stretch absolute bottom-[-2px] right-[-2px] w-[20px] h-[20px] border-b-[2px] border-r-[2px] pointer-events-none"'
            }
            style={{ borderColor: VARIANT_COLORS.cyberpunk.primary }}
          />
        </>
      )}
      {variant === 'underwater' && (
        <div className="box-border flex flex-col items-stretch absolute inset-[4px] border border-[rgba(34,_211,_238,_0.2)] rounded-[20px] pointer-events-none" />
      )}
      <StyledScrollArea>{children}</StyledScrollArea>
    </StyledModalFrame>
  );
};

export const ModalHeader = styled(XStack, {
  name: 'ModalHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$4',
  paddingBottom: '$3',
  borderBottomWidth: 2,
  borderBottomColor: '$borderColor',

  variants: {
    variant: {
      cyberpunk: {
        borderBottomColor: 'rgba(6, 182, 212, 0.3)',
      },
    },
  } as const,
});

export const ModalTitle = styled(Dialog.Title, {
  name: 'ModalTitle',
  margin: 0,
  fontSize: '$7',
  fontWeight: '700',
  color: '$color',

  variants: {
    variant: {
      cyberpunk: {
        color: VARIANT_COLORS.cyberpunk.accent,
        fontFamily: '$body',
        textTransform: 'uppercase',
        letterSpacing: 2,
        textShadowColor: 'rgba(232, 121, 249, 0.5)',
        textShadowRadius: 10,
      },
      underwater: {
        color: '#22d3ee',
        fontFamily: '$body',
        letterSpacing: 1,
        textShadowColor: 'rgba(34, 211, 238, 0.5)',
        textShadowRadius: 10,
      },
    },
  } as const,
});

interface CloseButtonProps extends ComponentProps<typeof Button> {
  $variant?: string;
}

export const CloseButton = ({ $variant, ...props }: CloseButtonProps) => (
  <Button
    className={'hover:rotate-[180deg] hover:scale-[1.1]'}
    variant="icon"
    size="sm"
    data-testid="modal-close-button"
    gameVariant={$variant as GameVariant}
    {...props}
  />
);

export const ModalActions = styled(XStack, {
  name: 'ModalActions',
  gap: '$3',
  marginTop: '$5',
});

export const ModalSection = styled(YStack, {
  name: 'ModalSection',
  marginBottom: '$4',
});

export const SectionLabel = styled(Text, {
  name: 'SectionLabel',
  fontSize: '$2',
  fontWeight: '600',
  color: '$textSecondary',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: '$2',

  variants: {
    variant: {
      cyberpunk: {
        color: VARIANT_COLORS.cyberpunk.primary,
        fontFamily: '$body',
        textShadowColor: 'rgba(6, 182, 212, 0.5)',
        textShadowRadius: 5,
      },
      underwater: {
        color: '#22d3ee',
        fontFamily: '$body',
        textShadowColor: 'rgba(34, 211, 238, 0.5)',
        textShadowRadius: 5,
      },
    },
  } as const,
});

export const RulesText = styled(Text, {
  name: 'RulesText',
  lineHeight: '$3',
  opacity: 0.9,
});

export const RulesTextPre = styled(RulesText, {
  name: 'RulesTextPre',
  whiteSpace: 'pre-line',
});
