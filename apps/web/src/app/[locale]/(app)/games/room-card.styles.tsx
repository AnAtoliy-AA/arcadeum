import { styled, XStack, YStack, Text, GetProps } from 'tamagui';

// ─── Styled Components ────────────────────────────────────────────────────────

export const StyledRoomCard = styled(YStack, {
  name: 'StyledRoomCard',
  borderColor: '$glassBorder',
  backgroundColor: '$glassBg',
  cursor: 'pointer',
  position: 'relative',

  hoverStyle: {
    scale: 1.05,
    y: -8,
    borderColor: 'rgba(122, 215, 255, 0.4)',
    backgroundColor: '$backgroundHover',
    boxShadow:
      '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 20px rgba(122, 215, 255, 0.15)',
  },

  variants: {
    status: {
      completed: {
        borderColor: 'rgba(107, 114, 128, 0.2)',
        hoverStyle: {
          scale: 1,
          y: 0,
          borderColor: 'rgba(107, 114, 128, 0.2)',
          backgroundColor: '$glassBg',
          boxShadow: 'none',
        },
      },
    },
  } as const,
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
});

export const StyledRoomHeader = styled(XStack, {
  name: 'StyledRoomHeader',
  alignItems: 'center',
  gap: '$4',
});

export const StyledRoomActions = styled(XStack, {
  name: 'StyledRoomActions',
  gap: '$3',
  flexShrink: 0,
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
  minWidth: 0,
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
