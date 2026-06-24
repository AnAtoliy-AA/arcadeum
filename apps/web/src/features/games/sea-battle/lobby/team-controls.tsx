'use client';

import { Button, Typography, XStack } from '@arcadeum/ui';
import { MIN_TEAM_SIZE, TEAM_DEFAULT_COLORS } from './team-mode.types';

interface ColorPaletteProps {
  color: string;
  onChange: (next: string) => void;
}

export function ColorPalette({ color, onChange }: ColorPaletteProps) {
  return (
    <XStack gap="$1" data-testid="color-palette">
      {TEAM_DEFAULT_COLORS.map((c) => {
        const selected = c === color;
        return (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={selected}
            onClick={() => onChange(c)}
            style={{
              backgroundColor: c,
              outline: selected ? '2px solid white' : 'none',
              outlineOffset: 1,
              width: 20,
              height: 20,
              padding: 0,
              minWidth: 20,
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
            }}
          />
        );
      })}
    </XStack>
  );
}

interface SizeStepperProps {
  value: number;
  onChange: (next: number) => void;
  max?: number;
}

export function SizeStepper({ value, onChange, max }: SizeStepperProps) {
  return (
    <XStack alignItems="center" gap="$1" data-testid="size-stepper">
      <Button
        size="sm"
        variant="secondary"
        aria-label="decrement"
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
        aria-label="increment"
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </Button>
    </XStack>
  );
}
