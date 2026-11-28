'use client';

import { Button, Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { MIN_TEAM_SIZE, TEAM_DEFAULT_COLORS } from './team-mode.types';

interface ColorPaletteProps {
  color: string;
  onChange: (next: string) => void;
}

export function ColorPalette({ color, onChange }: ColorPaletteProps) {
  return (
    <div
      className="flex flex-row flex-wrap items-center"
      data-testid="color-palette"
    >
      {TEAM_DEFAULT_COLORS.map((c) => {
        const selected = c === color;
        return (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={selected}
            onClick={() => onChange(c)}
            className="flex h-11 w-9 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            <span
              aria-hidden
              className={`block h-6 w-6 rounded-md ${selected ? 'ring-2 ring-[var(--textPrimary)] ring-offset-1 ring-offset-[var(--surface)]' : ''}`}
              style={{ backgroundColor: c }}
            />
          </button>
        );
      })}
    </div>
  );
}

interface SizeStepperProps {
  value: number;
  onChange: (next: number) => void;
  max?: number;
}

export function SizeStepper({ value, onChange, max }: SizeStepperProps) {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-row items-center gap-1"
      data-testid="size-stepper"
    >
      <Button
        size="sm"
        variant="secondary"
        className="min-h-[44px] min-w-[44px]"
        aria-label={t('games.create.teamSizeDecrease')}
        onClick={() => onChange(Math.max(MIN_TEAM_SIZE, value - 1))}
      >
        −
      </Button>
      <Typography
        variant="body"
        uiSize="md"
        style={{ minWidth: 24, textAlign: 'center' }}
      >
        {value}
      </Typography>
      <Button
        size="sm"
        variant="secondary"
        className="min-h-[44px] min-w-[44px]"
        aria-label={t('games.create.teamSizeIncrease')}
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </Button>
    </div>
  );
}
