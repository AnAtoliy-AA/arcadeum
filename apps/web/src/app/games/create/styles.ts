import React from 'react';
import { styled, YStack } from 'tamagui';
import { Card } from '@/shared/ui';

// ─── Class name constants ─────────────────────────────────────────────────────
export const GAME_TILE_CLASS = 'game-tile';
export const SELECTION_INDICATOR_CLASS = 'selection-indicator';
export const GAME_TILE_ICON_CLASS = 'game-tile-icon';

// ─── CSS string for complex nested selectors ──────────────────────────────────
export const gameTileCSS = `
  .${SELECTION_INDICATOR_CLASS}::after {
    content: '✓';
    font-weight: bold;
  }
  .${GAME_TILE_CLASS}.active .${SELECTION_INDICATOR_CLASS} {
    opacity: 1 !important;
    transform: scale(1) !important;
  }
  .${GAME_TILE_CLASS}:hover .${GAME_TILE_ICON_CLASS} {
    transform: scale(1.1);
  }
`;

// ─── Helper for dynamic GameTile styles ───────────────────────────────────────
export function getGameTileStyle(active?: boolean, disabled?: boolean): React.CSSProperties {
  return {
    padding: '1rem',
    borderRadius: '12px',
    background: active ? 'rgba(122,215,255,0.05)' : 'rgba(255,255,255,0.03)',
    border: `2px solid ${active ? '#7ad7ff' : '#32353d'}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    display: 'block',
    textAlign: 'left' as const,
    width: '100%',
  };
}

// ─── Simple layout components ─────────────────────────────────────────────────

export const Form = styled(YStack, {
  tag: 'form',
  flexDirection: 'column',
  gap: '1.5rem',
} as any);

export const GameSelector = styled(YStack, {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1rem',
} as any);

export const SelectionIndicator = styled(YStack, {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  backgroundColor: '#7ad7ff',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '0.75rem',
  opacity: 0,
  transform: 'scale(0.5)',
  transition: 'all 0.2s ease',
} as any);

export const GameTile = styled(Card, {
  padding: '$3',
  borderRadius: '$3',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
} as any);

export const GameTileIcon = styled(YStack, {
  fontSize: '2.5rem',
  marginBottom: '0.75rem',
  display: 'inline-block',
  transition: 'transform 0.3s ease',
} as any);

export const GameTileName = styled(YStack, {
  fontWeight: '700',
  fontSize: '1.125rem',
  marginBottom: '0.25rem',
  color: '$color',
} as any);

export const GameTileSummary = styled(YStack, {
  fontSize: '0.875rem',
  color: 'rgba(236,239,238,0.7)',
  lineHeight: 1.4,
} as any);

export const ComingSoonBadge = styled(YStack, {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  backgroundColor: '$background',
  color: 'rgba(236,239,238,0.45)',
  fontSize: '0.625rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  padding: '0.25rem 0.5rem',
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '$borderColor',
} as any);

// $xs = max-width:640px (note: Tamagui $xs = 660px breakpoint ~20px gap from 640px)
export const Row = styled(YStack, {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  $xs: { gridTemplateColumns: '1fr' },
} as any);

export const ExpansionGrid = styled(YStack, {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '0.75rem',
} as any);

export const ExpansionCheckbox = styled(YStack, {
  tag: 'label',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as any);

export const ExpansionLabel = styled(YStack, {
  tag: 'span',
  flex: 1,
  fontSize: '0.875rem',
  fontWeight: '500',
} as any);

export const ExpansionBadge = styled(YStack, {
  tag: 'span',
  fontSize: '0.75rem',
  color: 'rgba(236,239,238,0.45)',
  backgroundColor: '$background',
  padding: '0.125rem 0.5rem',
  borderRadius: 12,
} as any);

export const ExpandablePackContainer = styled(YStack, {
  flexDirection: 'column',
  gap: '0.5rem',
} as any);

export const ExpandablePackHeader = styled(YStack, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as any);

export const ExpandToggle = styled(YStack, {
  tag: 'span',
  marginLeft: 'auto',
  fontSize: '0.875rem',
  transition: 'transform 0.2s ease',
} as any);

export const PackCardList = styled(YStack, {
  flexDirection: 'column',
  gap: '0.25rem',
  paddingLeft: '1.5rem',
  marginTop: '-0.25rem',
} as any);

export const PackCardRow = styled(YStack, {
  tag: 'label',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: 6,
  backgroundColor: '$background',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
} as any);

export const PackCardName = styled(YStack, {
  tag: 'span',
  flex: 1,
  fontSize: '0.8125rem',
  color: 'rgba(236,239,238,0.7)',
} as any);

export const QuantityControl = styled(YStack, {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.25rem',
} as any);

export const QuantityValue = styled(YStack, {
  tag: 'span',
  minWidth: 24,
  textAlign: 'center',
  fontSize: '0.8125rem',
  fontWeight: '600',
  color: '$color',
} as any);

export const SelectAllRow = styled(YStack, {
  tag: 'label',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  marginBottom: '0.5rem',
  borderRadius: 8,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as any);

export const ThemeHeader = styled(YStack, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
} as any);
