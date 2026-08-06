'use client';

import { useState, lazy, Suspense } from 'react';

const GamePickerModal = lazy(() =>
  import('@/features/games/ui/GamePickerModal').then((m) => ({
    default: m.GamePickerModal,
  })),
);

interface Props {
  label: string;
}

export function HeroPlayVsAiButton({ label }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        data-testid="hero-play-vs-ai-button"
        className="home-link-button home-link-button-ghost"
        onClick={() => setOpen(true)}
        type="button"
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
