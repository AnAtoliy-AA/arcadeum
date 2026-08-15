'use client';

import React, { useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Button, CloseIcon, LinkButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { useSyncExternalStore } from 'react';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { useSound } from '@/shared/lib/sound';
import { Modal, CloseButton } from './SharedModalStyles';
import { VictoryCelebration } from './VictoryCelebration';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

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

const TONE_BACKDROP_CLASSES: Record<GameResultKind, string> = {
  victory:
    'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1)_0%,rgba(0,0,0,0.95)_100%)]',
  defeat:
    'bg-[radial-gradient(circle_at_center,rgba(255,77,77,0.08)_0%,rgba(0,0,0,0.95)_100%)]',
  draw: 'bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.1)_0%,rgba(0,0,0,0.95)_100%)]',
};

const StyledBackdrop = ({
  tone,
  className,
  ...props
}: {
  tone: GameResultKind;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border fixed top-0 left-0 w-screen h-[100dvh] z-[1199] backdrop-blur-[12px]',
      TONE_BACKDROP_CLASSES[tone],
      className,
    )}
    {...props}
  />
);

const ContentWrapper = ({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-center p-10 bg-[rgba(255,255,255,0.03)] backdrop-blur-[40px] rounded-[40px] border border-[rgba(255,255,255,0.1)] border-t-[rgba(255,255,255,0.2)] border-l-[rgba(255,255,255,0.15)] shadow-[0_40px_100px_rgba(0,0,0,0.8)] max-w-[90%] w-[520px] max-h-[90dvh] overflow-y-auto relative',
      className,
    )}
    style={style}
    {...props}
  >
    {children}
  </div>
);

const TONE_TITLE_CLASSES: Record<GameResultKind, string> = {
  victory: 'text-[#FFD700] [text-shadow:0_0_20px_rgba(255,215,0,0.4)]',
  defeat: 'text-[#ff4d4d] [text-shadow:0_0_20px_rgba(255,77,77,0.4)]',
  draw: 'text-[#cbd5e1] [text-shadow:0_0_20px_rgba(148,163,184,0.4)]',
};

const ResultTitleText = ({
  tone,
  className,
  children,
  ...props
}: {
  tone: GameResultKind;
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
} & HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cx(
      'box-border text-[56px] font-extrabold text-center uppercase tracking-[2px]',
      TONE_TITLE_CLASSES[tone],
      className,
    )}
    {...props}
  >
    {children}
  </h1>
);

const ResultMessage = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cx(
      'box-border text-[20px] leading-[24px] text-center mb-8 text-[rgba(255,255,255,0.8)]',
      className,
    )}
    {...props}
  >
    {children}
  </p>
);

const ActionsContainer = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border flex flex-col items-stretch gap-5 w-full',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

const HomeLink = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof LinkButton>) => (
  <LinkButton
    className={['mt-2 w-full', className].filter(Boolean).join(' ')}
    variant="secondary"
    {...props}
  >
    {children}
  </LinkButton>
);

// --- Main Component ---

const ResultContent = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      'box-border fixed top-0 left-0 w-screen h-[100dvh] z-[1200] flex items-center justify-center',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

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

  const media = useMediaQuery();
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
      <StyledBackdrop tone={result} />
      <ResultContent key="content">
        <div className="sr-only">
          <h2 className="sr-only">Game Result</h2>
          <p className="sr-only">Showing your game performance and options</p>
        </div>

        <ContentWrapper
          className="animate-entrance"
          style={{
            padding: media.sm ? '20px' : '40px',
            borderRadius: media.sm ? 24 : 40,
            width: media.sm ? '95%' : 520,
          }}
        >
          {onClose && (
            <div className="box-border flex flex-row items-stretch absolute">
              <CloseButton onClick={onClose} data-testid="modal-close-button">
                <CloseIcon size={20} />
              </CloseButton>
            </div>
          )}

          <div className="box-border flex flex-col items-center gap-2 -mb-6">
            <span className="box-border text-[80px] -mb-2 float">{emoji}</span>
            <ResultTitleText
              tone={result}
              data-testid="game-result-title"
              className={isVictory ? 'pulse' : undefined}
            >
              {title}
            </ResultTitleText>
          </div>

          <ResultMessage className="animate-fade-in-up-delay-2">
            {body}
          </ResultMessage>

          <ActionsContainer className="animate-fade-in-up-delay-4">
            {onRematch && (
              <Button
                variant={isVictory ? 'primary' : 'secondary'}
                size={media.sm ? 'md' : 'lg'}
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
              <Button
                variant="ghost"
                onClick={onClose}
                size={media.sm ? 'sm' : 'md'}
              >
                {t('games.table.modals.common.close' as TranslationKey)}
              </Button>
            )}
          </ActionsContainer>
        </ContentWrapper>
      </ResultContent>

      <VictoryCelebration tone={result} />
    </Modal>
  );
}
