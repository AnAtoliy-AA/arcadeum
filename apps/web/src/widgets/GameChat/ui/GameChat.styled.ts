import { styled, XStack, YStack, Text } from 'tamagui';

export const ACCENT_PINK = '#EC4899';
export const ACCENT_AMBER = '#F59E0B';
export const ACCENT_GRADIENT = `linear-gradient(135deg, ${ACCENT_PINK}, ${ACCENT_AMBER})`;

export const SYS_COLOR: Record<'elim' | 'round' | 'combo' | 'join', string> = {
  elim: '#F87171',
  round: '#22D3EE',
  combo: '#F59E0B',
  join: '#34D399',
};

export const Panel = styled(YStack, {
  name: 'GameChatPanel',
  width: '100%',
  height: '100%',
  minHeight: 360,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(15,17,18,0.78)',
  overflow: 'hidden',
  position: 'relative',
});

export const Head = styled(YStack, {
  name: 'GameChatHead',
  gap: 10,
  paddingHorizontal: 12,
  paddingTop: 12,
  paddingBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.06)',
});

export const HeadRow = styled(XStack, {
  name: 'GameChatHeadRow',
  alignItems: 'center',
  gap: 8,
});

export const TitleDot = styled(YStack, {
  name: 'GameChatTitleDot',
  width: 7,
  height: 7,
  borderRadius: 999,
  backgroundColor: '#34D399',
  shadowColor: '#34D399',
  shadowRadius: 8,
});

export const Title = styled(Text, {
  name: 'GameChatTitle',
  fontSize: 13,
  fontWeight: '600',
  color: '$color',
  letterSpacing: 0.2,
});

export const TabsRow = styled(XStack, {
  name: 'GameChatTabs',
  alignItems: 'center',
  padding: 3,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(255,255,255,0.04)',
  gap: 2,
});

export const Tab = styled(XStack, {
  name: 'GameChatTab',
  flex: 1,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
  gap: 6,
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.04)' },
});

export const TabLabel = styled(Text, {
  name: 'GameChatTabLabel',
  fontSize: 11.5,
  fontWeight: '600',
  color: '$colorMuted',
});

export const TabCount = styled(Text, {
  name: 'GameChatTabCount',
  minWidth: 16,
  textAlign: 'center',
  fontSize: 9.5,
  paddingHorizontal: 4,
  paddingVertical: 1,
  borderRadius: 999,
  color: 'rgba(255,255,255,0.7)',
  backgroundColor: 'rgba(255,255,255,0.08)',
});

export const Body = styled(YStack, {
  name: 'GameChatBody',
  flex: 1,
  minHeight: 0,
});

export const ListGap = styled(YStack, {
  name: 'GameChatListGap',
  gap: 10,
  paddingTop: 4,
  paddingBottom: 6,
  paddingHorizontal: 14,
});

export const Divider = styled(XStack, {
  name: 'GameChatDivider',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 4,
});

export const DividerLabel = styled(Text, {
  name: 'GameChatDividerLabel',
  fontSize: 9.5,
  fontWeight: '700',
  letterSpacing: 1.2,
  color: '$colorMuted',
  textTransform: 'uppercase',
  paddingHorizontal: 10,
});

export const Foot = styled(YStack, {
  name: 'GameChatFoot',
  gap: 8,
  paddingHorizontal: 14,
  paddingTop: 10,
  paddingBottom: 12,
  borderTopWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.06)',
});

export const QuickRow = styled(XStack, {
  name: 'GameChatQuickRow',
  gap: 6,
  flexWrap: 'wrap',
});

export const QuickButton = styled(XStack, {
  name: 'GameChatQuickBtn',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
  height: 24,
  paddingHorizontal: 10,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(255,255,255,0.03)',
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.06)' },
});

export const QuickButtonText = styled(Text, {
  name: 'GameChatQuickBtnText',
  fontSize: 11,
  fontWeight: '500',
  color: '$color',
});

export const InputPill = styled(XStack, {
  name: 'GameChatInputPill',
  alignItems: 'center',
  gap: 8,
  paddingLeft: 12,
  paddingRight: 4,
  height: 38,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(0,0,0,0.25)',
});

export const ChannelChip = styled(Text, {
  name: 'GameChatChannelChip',
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 1,
  textTransform: 'uppercase',
  paddingRight: 8,
  borderRightWidth: 1,
  borderRightColor: 'rgba(255,255,255,0.08)',
});

export const MetaLine = styled(XStack, {
  name: 'GameChatMetaLine',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const MetaText = styled(Text, {
  name: 'GameChatMetaText',
  fontSize: 9.5,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: '$colorMuted',
});

export const CollapsedShell = styled(XStack, {
  name: 'GameChatCollapsedShell',
  cursor: 'pointer',
  width: '100%',
  height: 44,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(15,17,18,0.85)',
  alignItems: 'center',
  paddingHorizontal: 12,
  gap: 8,
  hoverStyle: { borderColor: 'rgba(255,255,255,0.16)' },
});

export const CollapsedPreview = styled(Text, {
  name: 'GameChatCollapsedPreview',
  fontSize: 12,
  color: '$colorMuted',
  flex: 1,
  numberOfLines: 1,
});

export const UnreadBadge = styled(Text, {
  name: 'GameChatUnreadBadge',
  fontSize: 10,
  fontWeight: '700',
  color: '#06011b',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 999,
  letterSpacing: 0.4,
});

export const SysWrap = styled(XStack, {
  name: 'GameChatSysWrap',
  gap: 8,
  alignItems: 'center',
  paddingVertical: 7,
  paddingHorizontal: 10,
  borderRadius: 10,
  borderLeftWidth: 2,
  borderLeftColor: 'rgba(255,255,255,0.18)',
});

export const SysText = styled(Text, {
  name: 'GameChatSysText',
  fontSize: 11,
  color: '$color',
  flex: 1,
});

export const SysTime = styled(Text, {
  name: 'GameChatSysTime',
  fontSize: 10,
  color: '$colorMuted',
});
