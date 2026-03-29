import { styled, XStack, YStack, Text, Button } from 'tamagui';

// ─── Class name constants ─────────────────────────────────────────────────────
export const GAME_TILE_CLASS = 'games-create-tile';
export const SELECTION_INDICATOR_CLASS = 'games-create-selection-indicator';
export const GAME_TILE_ICON_CLASS = 'games-create-tile-icon';

// ─── CSS string for complex nested selectors ──────────────────────────────────
export const GameTileItem = styled(YStack, {
  name: 'GameTileItem',
  padding: '$4',
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderWidth: 2,
  borderColor: '#32353d',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  display: 'block',
  width: '100%',
  // animation: 'quick',

  pressStyle: {
    backgroundColor: 'rgba(122,215,255,0.05)',
    borderColor: '#7ad7ff',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(122,215,255,0.05)',
        borderColor: '#7ad7ff',
      },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.6,
      },
    },
  } as const,
});

export const GameTileContainer = styled(Button, {
  name: 'GameTileContainer',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: 0,
  height: 'auto',
  display: 'block',
  width: '100%',

  hoverStyle: {
    y: -4,
    backgroundColor: 'transparent',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
  },

  pressStyle: {
    backgroundColor: 'transparent',
  },
});

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
  top: '$3',
  right: '$3',
  width: 20,
  height: 20,
  borderRadius: 999,
  backgroundColor: '$primaryGradientStart',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  scale: 0.5,

  variants: {
    active: {
      true: {
        opacity: 1,
        scale: 1,
      },
    },
  } as const,
});

export const GameTileIcon = styled(Text, {
  name: 'GameTileIcon',
  fontSize: '$8',
  marginBottom: '$3',
  display: 'flex',

  hoverStyle: {
    scale: 1.1,
  },
});

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

export const ExpandablePackHeader = styled(Button, {
  name: 'ExpandablePackHeader',
  padding: '$3',
  alignItems: 'center',
  gap: '$3',
  borderRadius: 8,
  backgroundColor: '$background',
  borderWidth: 1,
  height: 'auto',
  justifyContent: 'flex-start',
  width: '100%',
  cursor: 'pointer',

  hoverStyle: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  pressStyle: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },
  } as const,
});

export const ExpandToggle = styled(Text, {
  name: 'ExpandToggle',
  fontSize: '$2',
  color: '$textMuted',

  variants: {
    expanded: {
      true: {
        rotate: '180deg',
      },
    },
  } as const,
});

export const PackCardList = styled(YStack, {
  name: 'PackCardList',
  paddingLeft: '$8',
  paddingRight: '$4',
  paddingBottom: '$4',
  gap: '$2',
  display: 'none',

  variants: {
    visible: {
      true: {
        display: 'flex',
      },
    },
  } as const,
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
