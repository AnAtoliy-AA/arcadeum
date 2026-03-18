import { styled, YStack, XStack, H3, Text } from 'tamagui';
import React from 'react';
import { ButtonProps, IconButton } from '@arcadeum/ui';

// Sidebar
export const Sidebar = styled(YStack, {
  name: 'LobbySidebar',
  gap: '$4',
  width: 300,
  $sm: {
    width: '100%',
  },
});

export const LobbyCard = styled(YStack, {
  name: 'LobbyCard',
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  borderRadius: 16,
  padding: '$5',
  position: 'relative',
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.15)',
});

export const LobbyCardGlow = styled(YStack, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 2,
  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
});

export const CardHeader = styled(XStack, {
  name: 'CardHeader',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '$4',
});

export const CardTitle = styled(H3, {
  name: 'CardTitle',
  fontSize: '$1',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: '$textSecondary',
  margin: 0,
});

// Player List
export const PlayerList = styled(YStack, {
  name: 'LobbyPlayerList',
  gap: '$3',
});

export const PlayerItem = styled(XStack, {
  name: 'PlayerItem',
  alignItems: 'center',
  gap: '$3',
  padding: '$2',
  borderRadius: 10,
  variants: {
    $isHost: {
      true: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
      },
      false: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'transparent',
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
  backgroundColor: '$background',
  flexShrink: 0,
});

export const LobbyPlayerAvatarText = styled(Text, {
  name: 'LobbyPlayerAvatarText',
  fontWeight: '600',
  fontSize: '$2',
  color: 'white',
});

export const PlayerInfo = styled(YStack, {
  name: 'PlayerInfo',
  flex: 1,
  minWidth: 0,
});

export const LobbyPlayerName = styled(Text, {
  name: 'LobbyPlayerName',
  fontSize: '$3',
  fontWeight: '500',
  color: '$color',
});

export const PlayerBadge = styled(Text, {
  name: 'PlayerBadge',
  fontSize: 10,
  paddingHorizontal: '$2',
  paddingVertical: 2,
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: 'white',
  borderRadius: 8,
  fontWeight: '600',
});

export const ReorderButton = (props: ButtonProps) => (
  <IconButton size="sm" {...props} />
);

export const EmptySlot = styled(XStack, {
  name: 'EmptySlot',
  alignItems: 'center',
  gap: '$3',
  padding: '$2',
  borderRadius: 10,
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: 'rgba(99, 102, 241, 0.2)',
  opacity: 0.5,
});

export const EmptyAvatar = styled(YStack, {
  name: 'EmptyAvatar',
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  alignItems: 'center',
  justifyContent: 'center',
});

export const EmptyAvatarText = styled(Text, {
  name: 'EmptyAvatarText',
  fontSize: '$4',
});

// Info Row
export const InfoRow = styled(XStack, {
  name: 'InfoRow',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: '$2',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(99, 102, 241, 0.1)',
  // Handle last-child via props or conditionally in component
});

export const InfoLabel = styled(Text, {
  name: 'InfoLabel',
  fontSize: '$2',
  color: '$textSecondary',
});

export const InfoValue = styled(Text, {
  name: 'InfoValue',
  fontSize: '$3',
  fontWeight: '500',
  color: '$color',
});

export const StatusBadge = styled(Text, {
  name: 'StatusBadge',
  fontSize: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 8,
  fontWeight: '500',
  variants: {
    $status: {
      lobby: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
      },
      ready: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        color: '#6366f1',
      },
      in_progress: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        color: '#6366f1',
      },
      completed: {
        backgroundColor: 'rgba(156, 163, 175, 0.15)',
        color: '#9ca3af',
      },
    },
  } as const,
});

export const FastBadge = styled(XStack, {
  name: 'FastBadge',
  paddingHorizontal: '$3',
  paddingVertical: '$1',
  borderRadius: 8,
  backgroundColor: 'rgba(234, 179, 8, 0.15)',
  alignItems: 'center',
  gap: '$2',
});

export const FastBadgeText = styled(Text, {
  name: 'FastBadgeText',
  fontSize: '$2',
  fontWeight: '500',
  color: '#eab308',
});
