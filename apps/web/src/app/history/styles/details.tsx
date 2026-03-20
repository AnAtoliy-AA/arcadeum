import { styled, XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui';
import type { ReactNode } from 'react';

export const DetailTimestamp = styled(Typography, {
  uiSize: 'sm',
  alpha: 'medium',
  padding: '$3',
  paddingHorizontal: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$backgroundStrong',
} as any);

export const Section = styled(YStack, {
  gap: '$4',
  padding: '$6',
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$backgroundStrong',
});

// SectionTitle replaces ::before pseudo-element with a real accent bar element.
// Used 4 times in HistoryDetailModal — must stay as a named export.
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <XStack ai="center" gap="$2">
      <YStack
        width={4}
        height={18}
        borderRadius={2}
        // Use inline style for gradient — Tamagui's background prop doesn't support linear-gradient strings
        style={{ background: 'linear-gradient(180deg, var(--color-primary, #6366f1) 0%, var(--color-primary-dark, #4f46e5) 100%)' }}
      />
      <Typography uiSize="lg" weight="600" margin={0}>
        {children}
      </Typography>
    </XStack>
  );
}

export const SectionDescription = styled(Typography, {
  uiSize: 'sm',
  alpha: 'medium',
  lineHeight: '$5',
} as any);
