'use client';

import { XStack, YStack } from 'tamagui';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import { ACTIVE_COLORS, type ActiveColor } from '../types';

interface ColorPickerProps {
  open: boolean;
  onPick: (color: ActiveColor) => void;
}

export function ColorPicker({ open, onPick }: ColorPickerProps) {
  const theme = useCascadeTheme();
  if (!open) return null;

  return (
    <YStack
      role="dialog"
      aria-label="Choose active color"
      position="absolute"
      bottom={120}
      left="50%"
      transform={[{ translateX: -160 }] as unknown as string}
      width={320}
      padding="$3"
      borderRadius="$4"
      backgroundColor="rgba(15, 15, 28, 0.92)"
      borderWidth={1}
      borderColor={theme.cardBorder}
      gap="$2"
      zIndex={50}
    >
      <YStack alignItems="center" paddingBottom="$1">
        <span style={{ color: '#fff', fontWeight: 700 }}>
          Choose a color
        </span>
      </YStack>
      <XStack gap="$2" justifyContent="center">
        {ACTIVE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPick(c)}
            aria-label={`Pick ${c}`}
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: theme.palette[c],
              border: `2px solid ${theme.cardBorder}`,
              cursor: 'pointer',
              color: '#fff',
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            {c}
          </button>
        ))}
      </XStack>
    </YStack>
  );
}
