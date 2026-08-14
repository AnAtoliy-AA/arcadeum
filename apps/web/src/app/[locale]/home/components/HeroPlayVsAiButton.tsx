'use client';

import { useState, lazy, Suspense } from 'react';
import { Button } from '@arcadeum/ui';

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
      <Button
        variant="secondary"
        size="lg"
        data-testid="hero-play-vs-ai-button"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open && (
        <Suspense fallback={null}>
          <GamePickerModal open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
