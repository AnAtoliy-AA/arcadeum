'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@arcadeum/ui';
import { ProgressBar } from '@arcadeum/ui/components/Progress/Progress';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { TUTORIAL_UI_KEYS, getTutorialDefinition } from '../lib/tutorial-steps';
import {
  TUTORIAL_TARGET_SELECTORS,
  type ResolvedTutorialStep,
  type TutorialStepTargetId,
} from '../lib/tutorial-types';
import { useTutorialStore } from '../store/tutorialStore';

interface TutorialOverlayProps {
  gameId: string;
  open: boolean;
  onClose: () => void;
}

const CARD_WIDTH = 400;
const ESTIMATED_CARD_HEIGHT = 300;
const VIEWPORT_PADDING = 16;

/**
 * Guided walkthrough overlay for a game room. Spotlights shared layout
 * regions (board / control panel / chat) with a ring cutout and walks
 * the player through short contextual steps. Finishing marks the game
 * tutorial as completed in localStorage; skipping marks it dismissed.
 */
export function TutorialOverlay({
  gameId,
  open,
  onClose,
}: TutorialOverlayProps) {
  const { t } = useTranslation();
  const markCompleted = useTutorialStore((s) => s.markCompleted);
  const markDismissed = useTutorialStore((s) => s.markDismissed);

  const def = useMemo(() => getTutorialDefinition(gameId), [gameId]);
  const steps: ResolvedTutorialStep[] = useMemo(
    () =>
      def ? def.steps.map((step, i) => ({ ...step, key: `s${i + 1}` })) : [],
    [def],
  );

  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isCompleteStep = steps.length > 0 && index >= steps.length;
  const step = isCompleteStep ? null : steps[index];

  const handleClose = useCallback(
    (completed: boolean) => {
      if (completed) markCompleted(gameId);
      else markDismissed(gameId);
      // Reset so a later re-open starts from the first step.
      setIndex(0);
      onClose();
    },
    [gameId, markCompleted, markDismissed, onClose],
  );

  // Measure the spotlight target for the current step.
  useLayoutEffect(() => {
    if (!open || typeof window === 'undefined') return;
    let raf = 0;
    const measure = () => {
      raf = requestAnimationFrame(() => {
        const selector = step?.target
          ? TUTORIAL_TARGET_SELECTORS[step.target as TutorialStepTargetId]
          : null;
        const el = selector ? document.querySelector(selector) : null;
        if (!el) {
          setTargetRect(null);
          return;
        }
        const styleRect = el.getBoundingClientRect();
        setTargetRect({
          top: styleRect.top,
          left: styleRect.left,
          width: styleRect.width,
          height: styleRect.height,
        });
      });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, step?.target, index, steps.length]);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, steps.length));
  }, [steps.length]);

  const goBack = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // Escape on the completion card still counts as finishing the tutorial.
      if (event.key === 'Escape') handleClose(isCompleteStep);
      else if (event.key === 'ArrowRight' && !isCompleteStep) goNext();
      else if (event.key === 'ArrowLeft' && index > 0) goBack();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, isCompleteStep, index, goNext, goBack, handleClose]);

  // Modal focus management: move focus into the dialog on open and
  // restore it to the previously focused element on close.
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();
    return () => {
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  if (!open || !def || steps.length === 0 || typeof document === 'undefined') {
    return null;
  }

  const total = steps.length + 1;
  const progressValue = ((index + 1) / total) * 100;
  const gameName = t(def.nameKey);

  // Card placement: near the spotlight when there is one, centered otherwise.
  const viewportW =
    typeof window !== 'undefined' ? window.innerWidth : CARD_WIDTH;
  const viewportH =
    typeof window !== 'undefined' ? window.innerHeight : ESTIMATED_CARD_HEIGHT;
  let cardStyle: React.CSSProperties;
  if (!targetRect) {
    cardStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  } else {
    const spaceBelow = viewportH - (targetRect.top + targetRect.height);
    const placeBelow =
      spaceBelow >= ESTIMATED_CARD_HEIGHT + VIEWPORT_PADDING * 2;
    const cardLeft = Math.max(
      VIEWPORT_PADDING,
      Math.min(
        targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2,
        viewportW - CARD_WIDTH - VIEWPORT_PADDING,
      ),
    );
    const cardTop = placeBelow
      ? Math.min(
          targetRect.top + targetRect.height + 16,
          viewportH - ESTIMATED_CARD_HEIGHT - VIEWPORT_PADDING,
        )
      : Math.max(VIEWPORT_PADDING, targetRect.top - ESTIMATED_CARD_HEIGHT - 16);
    cardStyle = { top: Math.max(VIEWPORT_PADDING, cardTop), left: cardLeft };
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200]"
      data-testid="tutorial-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={
        isCompleteStep ? t(TUTORIAL_UI_KEYS.completeTitle) : t(step!.titleKey)
      }
    >
      <div
        className="absolute inset-0 cursor-pointer"
        data-testid="tutorial-blocker"
        onClick={() => handleClose(false)}
      />

      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-[16px] border-2 border-[var(--primary)] transition-all duration-300 ease-out"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
          }}
          data-testid="tutorial-spotlight"
        />
      )}
      {!targetRect && (
        <div
          className="absolute inset-0 bg-[rgba(0,_0,_0,_0.65)] transition-opacity duration-300 cursor-pointer"
          data-testid="tutorial-backdrop"
          onClick={() => handleClose(false)}
        />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        className={cx(
          'absolute w-[calc(100vw_-_32px)] max-w-[400px] rounded-[20px]',
          'border border-[var(--glassBorderStrong)] bg-[var(--glassBg)]',
          'p-6 shadow-[0_24px_64px_rgba(0,_0,_0,_0.45)] backdrop-blur-[24px]',
          'outline-none',
        )}
        style={cardStyle}
        data-testid="tutorial-card"
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-[var(--accent)] opacity-60 hover:opacity-100 transition-opacity p-1 rounded-full cursor-pointer"
          onClick={() => handleClose(isCompleteStep)}
          aria-label={t(TUTORIAL_UI_KEYS.close)}
          data-testid="tutorial-close-button"
        >
          ✕
        </button>

        <p className="sr-only" role="status" aria-live="polite">
          {t(TUTORIAL_UI_KEYS.stepOf, {
            current: index + 1,
            total,
          })}
        </p>

        {isCompleteStep ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-[44px]" aria-hidden="true">
              🎉
            </span>
            <h2
              className="text-[22px] font-bold tracking-[-0.15px] text-[var(--accent)]"
              data-testid="tutorial-complete-title"
            >
              {t(TUTORIAL_UI_KEYS.completeTitle)}
            </h2>
            <p className="text-[14px] leading-[22px] opacity-80">
              {t(TUTORIAL_UI_KEYS.completeBody, { game: gameName })}
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => handleClose(true)}
              data-testid="tutorial-finish-button"
            >
              {t(TUTORIAL_UI_KEYS.finish)}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {step!.icon && (
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--primary)_18%,transparent)] text-[22px]"
                  aria-hidden="true"
                >
                  {step!.icon}
                </span>
              )}
              <h2
                id="tutorial-step-title"
                className="text-[18px] font-bold leading-[24px] text-[var(--accent)]"
                data-testid="tutorial-step-title"
              >
                {t(step!.titleKey)}
              </h2>
            </div>

            <p className="text-[14px] leading-[22px] opacity-80">
              {t(step!.bodyKey)}
            </p>

            <ProgressBar value={progressValue} height={6} />

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClose(false)}
                data-testid="tutorial-skip-button"
              >
                {t(TUTORIAL_UI_KEYS.skip)}
              </Button>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={goBack}
                    data-testid="tutorial-back-button"
                  >
                    {t(TUTORIAL_UI_KEYS.back)}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={goNext}
                  data-testid="tutorial-next-button"
                >
                  {t(TUTORIAL_UI_KEYS.next)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
