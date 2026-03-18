import { styled, YStack, XStack, Text } from 'tamagui';
import { Button, ButtonProps } from '@arcadeum/ui';

// Layout
export const LobbyContent = styled(XStack, {
  name: 'LobbyContent',
  flex: 1,
  padding: '$6',
  gap: '$6',
  overflow: 'scroll',

  $gtSm: {
    flexDirection: 'row',
  },
  $sm: {
    flexDirection: 'column',
  },
});

// Main Center Section
export const CenterSection = styled(YStack, {
  name: 'CenterSection',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$6',
});

export const GameIcon = styled(Text, {
  name: 'GameIcon',
  fontSize: 80,
  lineHeight: 1,
  textShadowColor: 'rgba(99, 102, 241, 0.3)',
  textShadowOffset: { width: 0, height: 8 },
  textShadowRadius: 24,
});

export const LobbyTitle = styled(Text, {
  name: 'LobbyTitle',
  fontSize: '$7',
  fontWeight: '700',
  textAlign: 'center',
  color: '$primary',
});

export const LobbySubtitle = styled(Text, {
  name: 'LobbySubtitle',
  fontSize: '$4',
  color: '$color',
  opacity: 0.7,
  textAlign: 'center',
  maxWidth: 400,
});

// Room Name Badge
export const RoomNameBadge = styled(XStack, {
  name: 'RoomNameBadge',
  alignItems: 'center',
  gap: '$2',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  backgroundColor: '$glassBg',
  borderWidth: 1,
  borderColor: '$glassBorder',
  borderRadius: 20,
});

export const RoomNameIcon = styled(Text, {
  name: 'RoomNameIcon',
  fontSize: '$4',
});

export const RoomNameText = styled(Text, {
  name: 'RoomNameText',
  fontSize: '$5',
  fontWeight: '600',
});

// Progress Bar
export const ProgressWrapper = styled(YStack, {
  name: 'ProgressWrapper',
  width: '100%',
  maxWidth: 300,
});

export const ProgressLabel = styled(XStack, {
  name: 'ProgressLabel',
  justifyContent: 'space-between',
  marginBottom: '$2',
});

export const ProgressLabelText = styled(Text, {
  fontSize: '$2',
  color: '$color',
  opacity: 0.6,
});

// Host Controls
export const HostControls = styled(YStack, {
  name: 'HostControls',
  alignItems: 'center',
  gap: '$4',
  padding: '$6',
  backgroundColor: '$infoBgSoft',
  borderWidth: 1,
  borderColor: '$infoBorder',
  borderRadius: '$4',
});

export const HostLabel = styled(Text, {
  name: 'HostLabel',
  fontSize: 11,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: '$primary',
});

// Sidebar
export const Sidebar = styled(YStack, {
  name: 'Sidebar',
  width: 300,
  gap: '$4',
  $sm: {
    width: '100%',
  },
});

export const LobbyCard = styled(YStack, {
  name: 'LobbyCard',
  backgroundColor: '$glassBg',
  borderRadius: '$4',
  padding: '$5',
  borderWidth: 1,
  borderColor: '$glassBorder',
  position: 'relative',
  overflow: 'hidden',
});

export const CardTitle = styled(Text, {
  name: 'CardTitle',
  fontSize: 12,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  opacity: 0.6,
  marginBottom: '$4',
});

// Player List
export const PlayerList = styled(YStack, {
  name: 'PlayerList',
  gap: '$3',
});

export const PlayerItem = styled(XStack, {
  name: 'PlayerItem',
  alignItems: 'center',
  gap: '$3',
  padding: '$3',
  borderRadius: '$3',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',

  variants: {
    $isHost: {
      true: {
        backgroundColor: '$infoBgSoft',
        borderColor: '$infoBorder',
        borderWidth: 1,
      },
    },
  } as const,
});

export const LobbyPlayerAvatar = styled(YStack, {
  name: 'LobbyPlayerAvatar',
  width: 36,
  height: 36,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const LobbyPlayerAvatarText = styled(Text, {
  fontWeight: '600',
  fontSize: 14,
  color: 'white',
});

export const PlayerInfo = styled(YStack, {
  name: 'PlayerInfo',
  flex: 1,
});

export const LobbyPlayerName = styled(Text, {
  name: 'LobbyPlayerName',
  fontSize: 14,
  fontWeight: '500',
});

export const PlayerBadge = styled(Text, {
  name: 'PlayerBadge',
  fontSize: 10,
  paddingHorizontal: '$2',
  paddingVertical: 2,
  backgroundColor: '$primary',
  color: 'white',
  borderRadius: 8,
  fontWeight: '600',
});

export const ReorderButton = (props: ButtonProps) => (
  <Button variant="icon" size="sm" {...props} />
);

export const EmptySlot = styled(XStack, {
  name: 'EmptySlot',
  alignItems: 'center',
  gap: '$3',
  padding: '$3',
  borderRadius: '$3',
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: '$glassBorder',
  opacity: 0.5,
});

export const EmptyAvatar = styled(YStack, {
  name: 'EmptyAvatar',
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: '$infoBgSoft',
  alignItems: 'center',
  justifyContent: 'center',
});

// Info Row
export const InfoRow = styled(XStack, {
  name: 'InfoRow',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: '$2',
  borderBottomWidth: 1,
  borderBottomColor: '$glassBorder',
});

export const InfoLabel = styled(Text, {
  fontSize: 13,
  opacity: 0.6,
});

export const InfoValue = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
});

export const StatusBadge = styled(Text, {
  name: 'StatusBadge',
  fontSize: 12,
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 8,
  fontWeight: '500',

  variants: {
    $status: {
      lobby: {
        backgroundColor: '$successBgSoft',
        color: '$success',
      },
      playing: {
        backgroundColor: '$infoBgSoft',
        color: '$primary',
      },
    },
  } as const,
});

export const FastBadge = styled(XStack, {
  name: 'FastBadge',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 8,
  backgroundColor: '$warningBgSoft',
  alignItems: 'center',
  gap: '$2',
});

// Waiting Animation
export const WaitingDots = styled(XStack, {
  name: 'WaitingDots',
  gap: '$2',
});

export const Dot = styled(YStack, {
  name: 'Dot',
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$primary',
});

export const VariantSelectorWrapper = styled(XStack, {
  name: 'VariantSelectorWrapper',
  position: 'relative',
  alignItems: 'center',
  marginLeft: '$2',
});
