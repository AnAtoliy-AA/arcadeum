import { styled, YStack, XStack, H2, Text, Paragraph } from 'tamagui';
export {
  Button,
  type ButtonProps,
  BotCountButton,
  DeleteButton,
  StartButton,
  IconButton,
  RefreshButton,
} from '@arcadeum/ui';

// Layout
export const LobbyContent = styled(XStack, {
  name: 'LobbyContent',
  gap: '$5',
  flex: 1,
  minHeight: 0,
  padding: '$5',
  overflowY: 'auto',
  overflowX: 'hidden',
  alignItems: 'flex-start',
  $tablet: {
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflowY: 'visible',
    overflowX: 'hidden',
    padding: '$3',
    gap: '$4',
    alignItems: 'stretch',
  },
});

// Main Center Section
export const CenterSection = styled(YStack, {
  name: 'CenterSection',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$5',
  flex: 1,
  minHeight: '100%',
  $tablet: {
    flex: 0,
    minHeight: 'unset',
    width: '100%',
    justifyContent: 'flex-start',
    gap: '$4',
  },
});

export const GameIcon = styled(Text, {
  name: 'GameIcon',
  fontSize: 80,
  lineHeight: 1,
  filter: 'drop-shadow(0 8px 24px rgba(99, 102, 241, 0.3))',
  $sm: {
    fontSize: 60,
  },
});

export const LobbyTitle = styled(H2, {
  name: 'LobbyTitle',
  fontSize: '$8',
  fontWeight: '700',
  textAlign: 'center',
  margin: 0,
  // Shimmer logic via background gradient
});

export const LobbyEmptyText = styled(Text, {
  name: 'LobbyEmptyText',
  fontSize: '$3',
  color: '$textMuted',
  textAlign: 'center',
  paddingTop: '$5',
  lineHeight: '$none',
});

export const LobbySubtitle = styled(Paragraph, {
  name: 'LobbySubtitle',
  fontSize: '$4',
  color: '$textSecondary',
  textAlign: 'center',
  margin: 0,
  maxWidth: 400,
});

// Room Name Badge
export const RoomNameBadge = styled(XStack, {
  name: 'RoomNameBadge',
  alignItems: 'center',
  gap: '$2',
  paddingVertical: '$2',
  paddingHorizontal: '$4',
  backgroundColor: 'rgba(16, 185, 129, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(16, 185, 129, 0.2)',
  borderRadius: 20,
});

export const RoomNameIcon = styled(Text, {
  name: 'RoomNameIcon',
  fontSize: '$4',
  display: 'inline-flex',
});

export const RoomNameText = styled(Text, {
  name: 'RoomNameText',
  fontSize: '$5',
  fontWeight: '600',
  color: '$color', // Will be overridden by gradient in component if needed
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

export const ProgressBar = styled(YStack, {
  name: 'ProgressBar',
  height: 8,
  backgroundColor: 'rgba(99, 102, 241, 0.15)',
  borderRadius: 4,
  overflow: 'hidden',
});

export const ProgressFill = styled(YStack, {
  name: 'ProgressFill',
  height: '100%',
  borderRadius: 4,
  backgroundColor: '#6366f1',
});

// Host Controls
export const HostControls = styled(YStack, {
  name: 'HostControls',
  alignItems: 'center',
  gap: '$4',
  padding: '$5',
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(99, 102, 241, 0.2)',
  borderRadius: 16,
});

export const HostLabel = styled(Text, {
  name: 'HostLabel',
  fontSize: 11,
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: '#6366f1',
});

// Sidebar re-exports
export * from './lobbySidebarStyles';

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
  backgroundColor: '#6366f1',
  opacity: 0.6,
});

export const VariantSelectorWrapper = styled(XStack, {
  name: 'VariantSelectorWrapper',
  position: 'relative',
  alignItems: 'center',
  marginLeft: '$2',
});

// ============ Container Components ============

export const GameContainer = styled(YStack, {
  name: 'GameContainer',
  flex: 1,
  minHeight: 0,
  width: '100%',
  maxWidth: '100%',
  overflow: 'hidden',
  backgroundColor: '$background',

  $tablet: {
    minHeight: 0,
    flex: 1,
  },
});

export const GameHeader = styled(XStack, {
  name: 'GameHeader',
  padding: '$4 $5',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  flexWrap: 'wrap',
  gap: '$3',
});

export const GameInfo = styled(XStack, {
  name: 'GameInfo',
  alignItems: 'center',
  gap: '$4',
  flexWrap: 'wrap',
});

export const GameTitleText = styled(H2, {
  name: 'GameTitleText',
  fontSize: '$6',
  fontWeight: '700',
  margin: 0,
});

export const VariantText = styled(Text, {
  name: 'VariantText',
  fontSize: '$4',
  fontWeight: '600',
});

export const HeaderActions = styled(XStack, {
  name: 'HeaderActions',
  alignItems: 'center',
  gap: '$3',
});

export const BotCountSelector = styled(YStack, {
  name: 'BotCountSelector',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$2',
});

export const BotCountLabel = styled(Text, {
  name: 'BotCountLabel',
  fontSize: '$2',
  fontWeight: '500',
  color: '$textSecondary',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
});

export const BotCountButtons = styled(XStack, {
  name: 'BotCountButtons',
  gap: '$2',
});
