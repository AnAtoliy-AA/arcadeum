'use client';

import { useState, lazy, Suspense } from 'react';
import { livePulseActionClass, type LivePulseTone } from './LivePulseCard';

const GamePickerModal = lazy(() =>
  import('@/features/games/ui/GamePickerModal').then((m) => ({
    default: m.GamePickerModal,
  })),
);

interface Props {
  tone: LivePulseTone;
  label: string;
  testId: string;
}

/** Action button that opens the game picker (play vs bot / quick match). */
export function LivePulsePickerButton({ tone, label, testId }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-testid={testId}
        onClick={() => setOpen(true)}
        className={livePulseActionClass(tone)}
      >
        {label}
      </button>
      {open && (
        <Suspense fallback={null}>
          <GamePickerModal open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
