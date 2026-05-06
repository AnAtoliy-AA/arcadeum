'use client';

import type { ReactNode, CSSProperties } from 'react';
import { YStack, Text, styled } from 'tamagui';

export type StatTileProps = {
  value: ReactNode;
  label: string;
  sparkline?: boolean;
  'data-testid'?: string;
};

const Cell = styled(YStack, {
  name: 'StatTile',
  paddingVertical: 18,
  paddingHorizontal: 18,
  gap: 6,
  alignItems: 'flex-start',
  position: 'relative',
  flex: 1,
  minWidth: 140,
});

const ValueText = styled(Text, {
  fontSize: 28,
  fontWeight: '600',
  color: '$color',
  letterSpacing: -0.5,
});

const LabelText = styled(Text, {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1.4,
  color: '$textSecondary',
});

const sparkStyle: CSSProperties = {
  position: 'absolute',
  right: 14,
  top: 18,
  width: 56,
  height: 14,
  background:
    'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
  opacity: 0.25,
  pointerEvents: 'none',
  borderRadius: 4,
};

export function StatTile({
  value,
  label,
  sparkline = true,
  'data-testid': testId,
}: StatTileProps) {
  return (
    <Cell data-testid={testId}>
      <ValueText>{value}</ValueText>
      <LabelText>{label}</LabelText>
      {sparkline ? <span aria-hidden="true" style={sparkStyle} /> : null}
    </Cell>
  );
}

StatTile.displayName = 'StatTile';
