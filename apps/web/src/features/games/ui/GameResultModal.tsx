'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { styled, YStack, XStack, H1, Paragraph, Text } from 'tamagui';
import { Button, CloseIcon, LinkButton, ModalButton } from '@arcadeum/ui';
import { useSyncExternalStore } from 'react';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { Modal, CloseButton } from './SharedModalStyles';
import { Dialog, VisuallyHidden } from 'tamagui';

// --- Types ---

interface GameResultModalProps {
  isOpen: boolean;
  result: 'victory' | 'defeat' | null;
  onRematch?: () => void;
  onClose?: () => void;
  rematchLoading?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

// --- Internal Styled Components ---

const StyledBackdrop = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(8px)',

  variants: {
    isVictory: {
      true: {
        backgroundColor: 'rgba(20, 0, 10, 0.9)',
      },
      false: {
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
      },
    },
  } as const,
});

const ContentWrapper = styled(YStack, {
  name: 'GameResultContent',
  alignItems: 'center',
  padding: '$10',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 32,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  shadowRadius: 60,
  maxWidth: '90%',
  width: 500,
  position: 'relative',
});

const ResultTitleText = styled(H1, {
  name: 'ResultTitleText',
  fontSize: 56,
  fontWeight: '800',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: 2,

  variants: {
    isVictory: {
      true: {
        color: '#FFD700',
      },
      false: {
        color: '#ff4d4d',
      },
    },
  } as const,
});

const ResultMessage = styled(Paragraph, {
  name: 'ResultMessage',
  fontSize: '$5',
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: '$4',
  textAlign: 'center',
  marginBottom: '$8',
});

const ActionsContainer = styled(YStack, {
  name: 'ResultActions',
  gap: '$4',
  width: '100%',
});

const HomeLink = styled(LinkButton, {
  name: 'HomeLink',
  variant: 'ghost',
  marginTop: '$2',
});

const ConfettiWrapper = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 0,
});

// --- Confetti Component ---

const CONFETTI_PARTICLES = Array.from({ length: 50 }).map((_, i) => ({
  left: (i * 7) % 100,
  delay: (i * 0.17) % 3,
  color: ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF'][i % 5],
}));

const ConfettiContainer = () => {
  return (
    <ConfettiWrapper>
      {CONFETTI_PARTICLES.map((p, i) => (
        <YStack
          key={i}
          position="absolute"
          top={-10}
          width={10}
          height={10}
          left={`${p.left}%`}
          backgroundColor={p.color}
          style={{
            animation: `fall 4s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </ConfettiWrapper>
  );
};

// --- Main Component ---

const StyledResultContent = styled(Dialog.Content, {
  name: 'ResultContent',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: 0,
  x: 0,
  y: 0,
  scale: 1,
  opacity: 1,

  variants: {
    animated: {
      true: {
        animation: [
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ] as unknown as object,
        enterStyle: { x: 0, y: -20, opacity: 0, scale: 0.9 },
        exitStyle: { x: 0, y: 10, opacity: 0, scale: 0.95 },
      },
    },
  } as const,

  defaultVariants: {
    animated: true,
  },
});

export function GameResultModal({
  isOpen,
  result,
  onRematch,
  onClose,
  rematchLoading,
  t,
}: GameResultModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!isOpen || !result || !isClient) return null;

  const isVictory = result === 'victory';

  return createPortal(
    <Modal open={isOpen} onOpenChange={(val) => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" backgroundColor="black" />
        <StyledBackdrop isVictory={isVictory} />
        <StyledResultContent elevate key="content">
          <VisuallyHidden>
            <Dialog.Title>Game Result</Dialog.Title>
            <Dialog.Description>
              Showing your game performance and options
            </Dialog.Description>
          </VisuallyHidden>

          <ContentWrapper>
            {onClose && (
              <XStack position="absolute" top="$4" right="$4">
                <CloseButton onClick={onClose} data-testid="modal-close-button">
                  <CloseIcon size={20} />
                </CloseButton>
              </XStack>
            )}

            <YStack alignItems="center" gap="$5" marginBottom="$5">
              <Text
                fontSize={80}
                style={{ animation: 'float 3s ease-in-out infinite' }}
              >
                {isVictory ? '🏆' : '💀'}
              </Text>
              <ResultTitleText
                isVictory={isVictory}
                data-testid="game-result-title"
              >
                {t(`games.table.${result}.title` as TranslationKey)}
              </ResultTitleText>
            </YStack>

            <ResultMessage>
              {t(`games.table.${result}.message` as TranslationKey)}
            </ResultMessage>

            <ActionsContainer>
              {onRematch && (
                <Button
                  variant={isVictory ? 'primary' : 'secondary'}
                  size="lg"
                  onClick={onRematch}
                  disabled={rematchLoading}
                  data-testid="rematch-button"
                  {...(isVictory
                    ? { animation: 'quick', pressStyle: { scale: 0.95 } }
                    : {})}
                >
                  {rematchLoading
                    ? t('games.table.rematch.loading' as TranslationKey)
                    : t('games.table.rematch.button' as TranslationKey)}
                </Button>
              )}

              <HomeLink href="/">
                {t('games.common.actions.backToHome' as TranslationKey)}
              </HomeLink>

              {onClose && (
                <ModalButton variant="ghost" onClick={onClose} padding="$3">
                  {t('games.table.modals.common.close' as TranslationKey)}
                </ModalButton>
              )}
            </ActionsContainer>
          </ContentWrapper>
        </StyledResultContent>
      </Dialog.Portal>

      {isVictory && <ConfettiContainer />}
    </Modal>,
    document.body,
  );
}
