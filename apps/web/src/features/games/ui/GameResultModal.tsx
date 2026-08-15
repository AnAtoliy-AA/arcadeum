'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { Button, CloseIcon, LinkButton } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { useSound } from '@/shared/lib/sound';
import { Modal, CloseButton } from './SharedModal';
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

// --- Tone (result) styles ---

const TONE_BACKDROP_CLASSES: Record<GameResultKind, string> = {
  victory:
    'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1)_0%,rgba(0,0,0,0.95)_100%)]',
  defeat:
    'bg-[radial-gradient(circle_at_center,rgba(255,77,77,0.08)_0%,rgba(0,0,0,0.95)_100%)]',
  draw: 'bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.1)_0%,rgba(0,0,0,0.95)_100%)]',
};

const TONE_TITLE_CLASSES: Record<GameResultKind, string> = {
  victory: 'text-[#FFD700] [text-shadow:0_0_20px_rgba(255,215,0,0.4)]',
  defeat: 'text-[#ff4d4d] [text-shadow:0_0_20px_rgba(255,77,77,0.4)]',
  draw: 'text-[#cbd5e1] [text-shadow:0_0_20px_rgba(148,163,184,0.4)]',
};

// --- Main Component ---

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
      <div
        className={cx(
          'fixed top-0 left-0 w-screen h-[100dvh] z-[1199] backdrop-blur-[12px]',
          TONE_BACKDROP_CLASSES[result],
        )}
      />
      <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[1200] flex items-center justify-center">
        <div className="animate-entrance flex flex-col items-center p-10 bg-[rgba(255,255,255,0.03)] backdrop-blur-[40px] rounded-[40px] border border-[rgba(255,255,255,0.1)] border-t-[rgba(255,255,255,0.2)] border-l-[rgba(255,255,255,0.15)] shadow-[0_40px_100px_rgba(0,0,0,0.8)] max-w-[90%] w-[520px] max-h-[90dvh] overflow-y-auto relative max-[800px]:p-5 max-[800px]:rounded-[24px] max-[800px]:w-[95%]">
          {onClose && (
            <div className="flex flex-row items-stretch absolute">
              <CloseButton onClick={onClose} data-testid="modal-close-button">
                <CloseIcon size={20} />
              </CloseButton>
            </div>
          )}

          <div className="flex flex-col items-center gap-2 -mb-6">
            <span className="text-[80px] -mb-2 animate-[float_3s_ease-in-out_infinite]">
              {emoji}
            </span>
            <h1
              data-testid="game-result-title"
              className={cx(
                'text-[56px] font-extrabold text-center uppercase tracking-[2px]',
                TONE_TITLE_CLASSES[result],
                isVictory && 'animate-pulse',
              )}
            >
              {title}
            </h1>
          </div>

          <p className="animate-fade-in-up-delay-2 text-[20px] leading-[24px] text-center mb-8 text-[rgba(255,255,255,0.8)]">
            {body}
          </p>

          <div className="animate-fade-in-up-delay-4 flex flex-col items-stretch gap-5 w-full">
            {onRematch && (
              <Button
                variant={isVictory ? 'primary' : 'secondary'}
                size={media.sm ? 'md' : 'lg'}
                onClick={onRematch}
                disabled={rematchLoading}
                data-testid="rematch-button"
                showShimmer={isVictory}
                className={isVictory ? 'active:scale-[0.95]' : undefined}
              >
                {rematchLoading
                  ? t('games.table.rematch.loading' as TranslationKey)
                  : t('games.table.rematch.button' as TranslationKey)}
              </Button>
            )}

            <LinkButton href="/" className="mt-2 w-full" variant="secondary">
              {t('games.common.actions.backToHome' as TranslationKey)}
            </LinkButton>

            {onClose && (
              <Button
                variant="ghost"
                onClick={onClose}
                size={media.sm ? 'sm' : 'md'}
              >
                {t('games.table.modals.common.close' as TranslationKey)}
              </Button>
            )}
          </div>
        </div>
      </div>

      <VictoryCelebration tone={result} />
    </Modal>
  );
}
