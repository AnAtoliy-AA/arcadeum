'use client';

import React, { useEffect, useRef } from 'react';
import { styled, YStack, XStack, H1, Paragraph, Text } from 'tamagui';
import { Button, CloseIcon, LinkButton } from '@arcadeum/ui';
import { useSyncExternalStore } from 'react';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { useSound } from '@/shared/lib/sound';
import { Modal, CloseButton } from './SharedModalStyles';
import { Dialog, VisuallyHidden } from 'tamagui';
import { VictoryCelebration } from './VictoryCelebration';

// --- Types ---

type GameResultKind = 'victory' | 'defeat' | 'draw';

interface GameResultModalProps {
  isOpen: boolean;
  result: GameResultKind | null;
  onRematch?: () => void;
  onClose?: () => void;
  rematchLoading?: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  /**
   * Per-game override for the headline + body copy. Use this when the
   * game has its own end-state vocabulary (e.g. tic-tac-toe ships
   * `gameOver.won/lost/draw`) and the shared `games.table.*` keys would
   * be wrong. When omitted, the modal falls back to
   * `games.table.${result}.title`/`.message`.
   */
  messages?: { title: string; message?: string };
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
  backdropFilter: 'blur(12px)',

  variants: {
    tone: {
      victory: {
        background:
          'radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0.95) 100%)',
      },
      defeat: {
        background:
          'radial-gradient(circle at center, rgba(255, 77, 77, 0.08) 0%, rgba(0, 0, 0, 0.95) 100%)',
      },
      draw: {
        background:
          'radial-gradient(circle at center, rgba(148, 163, 184, 0.1) 0%, rgba(0, 0, 0, 0.95) 100%)',
      },
    },
  } as const,
});

const ContentWrapper = styled(YStack, {
  name: 'GameResultContent',
  alignItems: 'center',
  padding: '$10',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(40px)',
  borderRadius: 40,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  shadowColor: 'rgba(0, 0, 0, 0.8)',
  shadowRadius: 100,
  shadowOffset: { width: 0, height: 40 },
  maxWidth: '90%',
  width: 520,
  position: 'relative',
  borderTopColor: 'rgba(255, 255, 255, 0.2)',
  borderLeftColor: 'rgba(255, 255, 255, 0.15)',
});

const ResultTitleText = styled(H1, {
  name: 'ResultTitleText',
  fontSize: 56,
  fontWeight: '800',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: 2,

  variants: {
    tone: {
      victory: {
        color: '#FFD700',
        textShadowColor: 'rgba(255, 215, 0, 0.4)',
        textShadowRadius: 20,
      },
      defeat: {
        color: '#ff4d4d',
        textShadowColor: 'rgba(255, 77, 77, 0.4)',
        textShadowRadius: 20,
      },
      draw: {
        color: '#cbd5e1',
        textShadowColor: 'rgba(148, 163, 184, 0.4)',
        textShadowRadius: 20,
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
  gap: '$5',
  width: '100%',
});

const HomeLink = styled(LinkButton, {
  name: 'HomeLink',
  variant: 'secondary',
  marginTop: '$2',
  width: '100%',
});

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
  messages,
}: GameResultModalProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { play } = useSound();
  // Play the result sting once when the modal opens (not on every re-render).
  const playedForRef = useRef<GameResultKind | null>(null);
  useEffect(() => {
    if (!isOpen || !result) {
      playedForRef.current = null;
      return;
    }
    if (playedForRef.current === result) return;
    playedForRef.current = result;
    if (result === 'victory') play('win');
    else if (result === 'defeat') play('lose');
  }, [isOpen, result, play]);

  if (!isOpen || !result || !isClient) return null;

  const isVictory = result === 'victory';
  const isDraw = result === 'draw';
  const emoji = isVictory ? '🏆' : isDraw ? '🤝' : '💀';

  const title =
    messages?.title ?? t(`games.table.${result}.title` as TranslationKey);
  const body =
    messages?.message ?? t(`games.table.${result}.message` as TranslationKey);

  return (
    <Modal open={isOpen} onOpenChange={(val) => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" backgroundColor="black" />
        <StyledBackdrop tone={result} />
        <StyledResultContent elevate key="content">
          <VisuallyHidden>
            <Dialog.Title>Game Result</Dialog.Title>
            <Dialog.Description>
              Showing your game performance and options
            </Dialog.Description>
          </VisuallyHidden>

          <ContentWrapper className="animate-entrance">
            {onClose && (
              <XStack position="absolute" top="$4" right="$4">
                <CloseButton onClick={onClose} data-testid="modal-close-button">
                  <CloseIcon size={20} />
                </CloseButton>
              </XStack>
            )}

            <YStack alignItems="center" gap="$2" marginBottom="$6">
              <Text fontSize={80} marginBottom="$2" className="float">
                {emoji}
              </Text>
              <ResultTitleText
                tone={result}
                data-testid="game-result-title"
                className={isVictory ? 'pulse' : undefined}
              >
                {title}
              </ResultTitleText>
            </YStack>

            <ResultMessage className="animate-fade-in-up-delay-2">
              {body}
            </ResultMessage>

            <ActionsContainer className="animate-fade-in-up-delay-4">
              {onRematch && (
                <Button
                  variant={isVictory ? 'primary' : 'secondary'}
                  size="lg"
                  onClick={onRematch}
                  disabled={rematchLoading}
                  data-testid="rematch-button"
                  showShimmer={isVictory}
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
                <Button variant="ghost" onClick={onClose} size="md">
                  {t('games.table.modals.common.close' as TranslationKey)}
                </Button>
              )}
            </ActionsContainer>
          </ContentWrapper>
        </StyledResultContent>
      </Dialog.Portal>

      <VictoryCelebration tone={result} />
    </Modal>
  );
}
