import { styled, XStack, YStack, Text, GetProps } from 'tamagui';

const LIST_VIEW_MIN_WIDTH = '200px';

// ─── Styled Components ────────────────────────────────────────────────────────

export const StyledRoomCard = styled(YStack, {
  name: 'StyledRoomCard',
  borderColor: '$glassBorder',
  backgroundColor: '$glassBg',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',

  hoverStyle: {
    scale: 1.05,
    y: -12,
    borderColor: 'rgba(122, 215, 255, 0.4)',
    backgroundColor: '$backgroundHover',
    boxShadow:
      '0 30px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(122, 215, 255, 0.25)',
  },

  variants: {
    animate: {
      true: {
        animation: 'slow',
      },
    },
    viewMode: {
      grid: {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        gap: '$5',
        padding: '$6',
        borderRadius: '$6',
        minHeight: 280,
      },
      list: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '$4',
        padding: '$4 $6',
        borderRadius: '$4',
        flexWrap: 'wrap',
      },
    },
  } as const,

  defaultVariants: {
    viewMode: 'grid',
    animate: true,
  },
});

export type StyledRoomCardProps = GetProps<typeof StyledRoomCard>;

export const StyledStatusBadge = styled(Text, {
  name: 'StyledStatusBadge',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: '$2',
  fontSize: 10,
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  color: 'white',

  variants: {
    status: {
      lobby: {
        backgroundColor: '$success',
        boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
      },
      in_progress: {
        backgroundColor: '$warning',
        boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
      },
      completed: {
        backgroundColor: '$neutral',
        boxShadow: '0 0 10px rgba(107, 114, 128, 0.3)',
      },
    },
  } as const,
});

export const StyledGameName = styled(Text, {
  name: 'StyledGameName',
  fontWeight: '700',
  fontSize: 15,
  color: '$color',
  opacity: 0.9,
  numberOfLines: 1,

  variants: {
    hasGradient: {
      true: {
        // Handled via inline style or CSS module if needed
      },
    },
  } as const,
});

export const StyledRoomHeader = styled(XStack, {
  name: 'StyledRoomHeader',
  alignItems: 'center',
  gap: '$4',

  variants: {
    viewMode: {
      grid: {
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '$2',
      },
      list: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '$1',
        minWidth: LIST_VIEW_MIN_WIDTH,
        maxWidth: 300,
        flexShrink: 0,
      },
    },
  } as const,
});

export const StyledRoomActions = styled(XStack, {
  name: 'StyledRoomActions',
  gap: '$3',
  flexShrink: 0,

  variants: {
    viewMode: {
      grid: {
        marginTop: 'auto',
        paddingTop: '$4',
        borderTopWidth: 1,
        borderTopColor: '$glassBorder',
        width: '100%',
      },
      list: {
        marginTop: 0,
        paddingTop: 0,
        borderTopWidth: 0,
        width: 'auto',
        marginLeft: 'auto',
      },
    },
  } as const,
});

export const StyledParticipantChip = styled(XStack, {
  name: 'StyledParticipantChip',
  alignItems: 'center',
  paddingHorizontal: '$3',
  paddingVertical: '$1.5',
  borderRadius: '$3',
  backgroundColor: '$backgroundFocus',
  borderWidth: 1,
  borderColor: '$glassBorder',
  gap: '$1.5',

  variants: {
    isHost: {
      true: {
        borderColor: '$primary',
        backgroundColor: 'rgba(122, 215, 255, 0.1)',
      },
    },
  } as const,
});

export const ParticipantText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  color: '$color',
});

export const RoomMeta = styled(YStack, {
  name: 'RoomMeta',
  width: '100%',
  gap: '$4',
});

export const MetaGrid = styled(XStack, {
  name: 'MetaGrid',
  flexWrap: 'wrap',
  gap: '$4',
  width: '100%',
});

export const MetaRow = styled(XStack, {
  name: 'MetaRow',
  alignItems: 'center',
  gap: '$3',
  minWidth: 'fit-content',
});

export const MetaIcon = styled(Text, {
  name: 'MetaIcon',
  fontSize: 16,
  opacity: 0.8,
});

export const MetaLabel = styled(Text, {
  name: 'MetaLabel',
  fontWeight: '500',
  color: '$color',
  opacity: 0.5,
  fontSize: 12,
});

export const MetaValue = styled(Text, {
  name: 'MetaValue',
  color: '$color',
  fontWeight: '600',
  fontSize: 14,
  numberOfLines: 1,
});

export const ParticipantsLabel = styled(Text, {
  name: 'ParticipantsLabel',
  fontWeight: '600',
  color: '$color',
  opacity: 0.5,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: '$2',
});

export const MetaListContainer = styled(XStack, {
  name: 'MetaListContainer',
  gap: '$6',
  alignItems: 'center',
  flex: 1,
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  paddingHorizontal: '$2',
});

export const ParticipantsList = styled(XStack, {
  name: 'ParticipantsList',
  flexWrap: 'wrap',
  gap: '$2',
});

export const FastBadge = styled(XStack, {
  name: 'FastBadge',
  alignItems: 'center',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: '$2',
  backgroundColor: '$warning',
  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
  flexShrink: 0,
});

export const FastBadgeText = styled(Text, {
  fontSize: 10,
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
  color: 'white',
});

export const BadgeIcon = styled(Text, {
  name: 'BadgeIcon',
  marginRight: 4,
  fontSize: 12,
});
