'use client';

import { useCallback, useRef } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useReplayStore } from '../store/replayStore';
import type { PlaybackSpeed } from '../lib/types';
import { PLAYBACK_SPEEDS } from '../lib/types';
import type { TranslationKey } from '@/shared/lib/useTranslation';

interface ReplayControlsProps {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function ReplayControls({ t }: ReplayControlsProps) {
  const replay = useReplayStore((s) => s.replay);
  const currentStep = useReplayStore((s) => s.currentStep);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const playbackSpeed = useReplayStore((s) => s.playbackSpeed);
  const play = useReplayStore((s) => s.play);
  const pause = useReplayStore((s) => s.pause);
  const stepForward = useReplayStore((s) => s.stepForward);
  const stepBackward = useReplayStore((s) => s.stepBackward);
  const goToStep = useReplayStore((s) => s.goToStep);
  const setSpeed = useReplayStore((s) => s.setSpeed);

  const progressRef = useRef<HTMLDivElement>(null);

  const totalSteps = replay?.actions.length ?? 0;

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || totalSteps === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      goToStep(Math.round(ratio * totalSteps));
    },
    [goToStep, totalSteps],
  );

  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={progressRef}
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-label={t('games.replay.controls.progress')}
        className="relative h-2 w-full cursor-pointer rounded-full bg-[rgba(255,255,255,0.08)]"
        onClick={handleProgressClick}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[var(--primary)] transition-[width] duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <ControlButton
            onClick={() => goToStep(0)}
            disabled={currentStep === 0}
            aria-label={t('games.replay.controls.first')}
          >
            ⏮
          </ControlButton>

          <ControlButton
            onClick={stepBackward}
            disabled={currentStep === 0}
            aria-label={t('games.replay.controls.prev')}
          >
            ◀
          </ControlButton>

          <ControlButton
            onClick={isPlaying ? pause : play}
            aria-label={
              isPlaying
                ? t('games.replay.controls.pause')
                : t('games.replay.controls.play')
            }
            className="h-10 w-10 text-lg"
          >
            {isPlaying ? '⏸' : '▶'}
          </ControlButton>

          <ControlButton
            onClick={stepForward}
            disabled={currentStep >= totalSteps}
            aria-label={t('games.replay.controls.next')}
          >
            ▶
          </ControlButton>

          <ControlButton
            onClick={() => goToStep(totalSteps)}
            disabled={currentStep >= totalSteps}
            aria-label={t('games.replay.controls.last')}
          >
            ⏭
          </ControlButton>
        </div>

        <span className="text-[13px] font-medium text-[rgba(255,255,255,0.6)]">
          {t('games.replay.controls.stepCounter', {
            current: currentStep,
            total: totalSteps,
          })}
        </span>

        <div className="flex items-center gap-1">
          {PLAYBACK_SPEEDS.map((speed) => (
            <SpeedButton
              key={speed}
              speed={speed}
              active={playbackSpeed === speed}
              onClick={() => setSpeed(speed)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  'aria-label': string;
}

function ControlButton({
  onClick,
  disabled,
  className,
  children,
  'aria-label': ariaLabel,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        'flex h-8 w-8 items-center justify-center rounded-lg',
        'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.8)]',
        'transition-colors duration-150',
        'hover:bg-[rgba(255,255,255,0.12)] hover:text-white',
        'disabled:cursor-not-allowed disabled:opacity-30',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface SpeedButtonProps {
  speed: PlaybackSpeed;
  active: boolean;
  onClick: () => void;
}

function SpeedButton({ speed, active, onClick }: SpeedButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-md px-2 py-1 text-[12px] font-semibold transition-colors duration-150',
        active
          ? 'bg-[var(--primary)] text-white'
          : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.12)]',
      )}
    >
      {speed}x
    </button>
  );
}
