import React from 'react';
import { styled, XStack, YStack, Text } from 'tamagui';
import { Card } from '@/shared/ui';

// ─── Class name constants ─────────────────────────────────────────────────────
export const GAME_TILE_CLASS = 'games-create-tile';
export const SELECTION_INDICATOR_CLASS = 'games-create-selection-indicator';
export const GAME_TILE_ICON_CLASS = 'games-create-tile-icon';

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
  .${GAME_TILE_CLASS}:hover:not([data-disabled='true']) { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
`;

// ─── Helper for dynamic GameTile styles ───────────────────────────────────────
export function getGameTileStyle(
  active?: boolean,
  disabled?: boolean,
): React.CSSProperties {
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
    width: '100%',
  };
}

// ─── Simple layout components ─────────────────────────────────────────────────

export const FormContainer = styled(YStack, {
  name: 'FormContainer',
  flexDirection: 'column',
  gap: '$5',
});

export const GameSelector = styled(YStack, {
  name: 'GameSelector',
  display: 'grid' as 'flex',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '$4',
} as unknown as Record<string, unknown>);

export const SelectionIndicator = styled(XStack, {
  name: 'SelectionIndicator',
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: 999,
  backgroundColor: '$primaryGradientStart',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  opacity: 0,
  transform: 'scale(0.5)',
  animation: 'quick',
} as unknown as Record<string, unknown>);

export const GameTile = styled(Card, {
  name: 'GameTile',
  padding: 'sm',
  borderRadius: '$3',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  interactive: true,
});

export const GameTileIcon = styled(Text, {
  name: 'GameTileIcon',
  fontSize: '2.5rem',
  marginBottom: '0.75rem',
  display: 'inline-block' as 'flex',
  transition: 'transform 0.3s ease',
} as unknown as Record<string, unknown>);

export const GameTileName = styled(Text, {
  name: 'GameTileName',
  fontWeight: '700',
  fontSize: '1.125rem',
  marginBottom: '0.25rem',
  color: '$color',
  display: 'block',
});

export const GameTileSummary = styled(Text, {
  name: 'GameTileSummary',
  fontSize: '0.875rem',
  color: 'rgba(236,239,238,0.7)',
  lineHeight: 1.4,
  display: 'block',
});

export const ComingSoonBadge = styled(Text, {
  name: 'ComingSoonBadge',
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
});

// $xs = max-width:640px (note: Tamagui $xs = 660px breakpoint ~20px gap from 640px)
export const Row = styled(YStack, {
  name: 'Row',
  flexDirection: 'row',
  gap: '$4',
  $xs: { flexDirection: 'column' },
});

export const ExpansionGrid = styled(YStack, {
  name: 'ExpansionGrid',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '$3',
});

export const ExpansionCheckbox = styled(XStack, {
  name: 'ExpansionCheckbox',
  tag: 'label',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as unknown as Record<string, unknown>);

export const ExpansionLabel = styled(Text, {
  name: 'ExpansionLabel',
  tag: 'span',
  flex: 1,
  fontSize: '0.875rem',
  fontWeight: '500',
} as unknown as Record<string, unknown>);

export const ExpansionBadge = styled(Text, {
  name: 'ExpansionBadge',
  tag: 'span',
  fontSize: '0.75rem',
  color: 'rgba(236,239,238,0.45)',
  backgroundColor: '$background',
  padding: '0.125rem 0.5rem',
  borderRadius: 12,
} as unknown as Record<string, unknown>);

export const ExpandablePackContainer = styled(YStack, {
  name: 'ExpandablePackContainer',
  flexDirection: 'column',
  gap: '0.5rem',
});

export const ExpandablePackHeader = styled(XStack, {
  name: 'ExpandablePackHeader',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
} as unknown as Record<string, unknown>);

export const ExpandToggle = styled(Text, {
  name: 'ExpandToggle',
  tag: 'span',
  marginLeft: 'auto',
  fontSize: '0.875rem',
  transition: 'transform 0.2s ease',
} as unknown as Record<string, unknown>);

export const PackCardList = styled(YStack, {
  name: 'PackCardList',
  flexDirection: 'column',
  gap: '0.25rem',
  paddingLeft: '1.5rem',
  marginTop: '-0.25rem',
});

export const PackCardRow = styled(XStack, {
  name: 'PackCardRow',
  tag: 'label',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: 6,
  backgroundColor: '$background',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
} as unknown as Record<string, unknown>);

export const PackCardName = styled(Text, {
  name: 'PackCardName',
  tag: 'span',
  flex: 1,
  fontSize: '0.8125rem',
  color: 'rgba(236,239,238,0.7)',
} as unknown as Record<string, unknown>);

export const QuantityControl = styled(XStack, {
  name: 'QuantityControl',
  alignItems: 'center',
  gap: '0.25rem',
});

export const QuantityValue = styled(Text, {
  name: 'QuantityValue',
  tag: 'span',
  minWidth: 24,
  textAlign: 'center',
  fontSize: '0.8125rem',
  fontWeight: '600',
  color: '$color',
} as unknown as Record<string, unknown>);

export const SelectAllRow = styled(XStack, {
  name: 'SelectAllRow',
  tag: 'label',
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
} as unknown as Record<string, unknown>);

export const ThemeHeader = styled(XStack, {
  name: 'ThemeHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
} as unknown as Record<string, unknown>);
