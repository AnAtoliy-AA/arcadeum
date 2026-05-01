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
  borderColor: '$borderColor',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  gap: '$1.5',
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
  $xs: { paddingBottom: 96 },
});

export const StickyMobileCta = styled(YStack, {
  name: 'StickyMobileCta',
  $xs: {
    position: 'fixed' as unknown as 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '$3',
    paddingBottom:
      'calc(env(safe-area-inset-bottom, 0px) + 12px)' as unknown as number,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(16px)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 100,
  },
} as unknown as Record<string, unknown>);

export const GameSelector = styled(YStack, {
  name: 'GameSelector',
  display: 'grid',
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
  color: '$color',
});

export const GameTileSummary = styled(Text, {
  name: 'GameTileSummary',
  fontSize: '0.875rem',
  color: '$color',
  opacity: 0.65,
  lineHeight: '$normal',
});

export const ComingSoonBadge = styled(Text, {
  name: 'ComingSoonBadge',
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  backgroundColor: '$background',
  color: '$color',
  opacity: 0.5,
  fontSize: '0.625rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  padding: '0.25rem 0.5rem',
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '$borderColor',
});

// $xs = max-width:640px (note: Tamagui $xs = 660px breakpoint ~20px gap from 640px)
export const Row = styled(XStack, {
  name: 'Row',
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
  flex: 1,
  fontSize: '0.875rem',
  fontWeight: '500',
});

export const ExpansionBadge = styled(Text, {
  name: 'ExpansionBadge',
  fontSize: '0.75rem',
  color: '$color',
  opacity: 0.5,
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: '0.125rem 0.5rem',
  borderRadius: 12,
});

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
  flex: 1,
  fontSize: '0.8125rem',
  color: '$color',
  opacity: 0.7,
});

export const QuantityControl = styled(XStack, {
  name: 'QuantityControl',
  alignItems: 'center',
  gap: '0.25rem',
});

export const QuantityValue = styled(Text, {
  name: 'QuantityValue',
  minWidth: 24,
  textAlign: 'center',
  fontSize: '0.8125rem',
  fontWeight: '600',
  color: '$color',
});

export const SelectAllRow = styled(XStack, {
  name: 'SelectAllRow',
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
});
