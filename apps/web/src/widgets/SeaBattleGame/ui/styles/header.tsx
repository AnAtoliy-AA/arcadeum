import React from 'react';
import { styled, XStack, YStack } from 'tamagui';
import type { SeaBattleTheme } from '../../lib/theme';

export const CompactHeaderContainer = styled(XStack, {
  name: 'CompactHeaderContainer',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: '$4',
  paddingVertical: '$2',

  $sm: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '$2',
  },
});

export const HeaderTitleArea = styled(YStack, {
  name: 'HeaderTitleArea',
  minWidth: 0,
  flex: 1,

  $sm: {
    alignItems: 'center',
  },
});

export const PlacementHeader = styled(XStack, {
  name: 'PlacementHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$4',
  marginBottom: '$5',

  $sm: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '$2',
    marginBottom: '$3',
  },
});

// TEMPORARY backward-compat shim for Game.tsx until Task 15 updates it.
// Game.tsx uses <TurnIndicator $isYourTurn={...} $theme={...}> (old API).
// This shim accepts those props and renders a styled pill indicator.
export function TurnIndicator({
  $isYourTurn,
  children,
}: {
  $isYourTurn: boolean;
  $theme?: SeaBattleTheme;
  children?: React.ReactNode;
}) {
  const emoji = $isYourTurn ? '🎯' : '⏳';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 24px',
        background: $isYourTurn ? 'rgba(16, 185, 129, 0.45)' : 'rgba(0, 0, 0, 0.75)',
        border: `1px solid ${$isYourTurn ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: 100,
        fontSize: '0.9rem',
        fontWeight: 800,
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        minWidth: 240,
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {emoji} {children}
    </span>
  );
}
