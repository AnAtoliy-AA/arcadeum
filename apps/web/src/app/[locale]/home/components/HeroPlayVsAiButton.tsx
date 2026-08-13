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
        className="home-link-button inline-flex h-[60px] cursor-pointer items-center justify-center rounded-2xl border border-glass-border border-t-[rgba(255,255,255,0.14)] bg-secondary bg-glass-gradient px-8 font-extrabold text-secondary-text no-underline shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-[transform,filter] duration-200 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] hover:-translate-y-[2px] hover:bg-glass-gradient-hover hover:opacity-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
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
