'use client';

import { useState } from 'react';
import { GamePickerModal } from '@/features/games/ui/GamePickerModal';

interface Props {
  label: string;
}

export function HeroPlayVsAiButton({ label }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="home-link-button home-link-button-ghost"
        onClick={() => setOpen(true)}
        type="button"
      >
        {label}
      </button>
      <GamePickerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
