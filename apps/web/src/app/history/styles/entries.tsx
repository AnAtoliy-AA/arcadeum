import { styled, XStack, YStack } from 'tamagui';
import { Card, Badge, Typography } from '@arcadeum/ui';
import type { ReactNode } from 'react';

export const EntriesGrid = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.25rem',
    }}
  >
    {children}
  </div>
);

export const EntryCard = styled(Card, {
  name: 'EntryCard',
  variant: 'elevated' as any,
  cardPadding: 'md' as any,
  interactive: true,
  flexDirection: 'column',
  gap: '$3',
  cursor: 'pointer',
  group: 'entry' as any,
} as any);

export const EntryHeader = styled(XStack, {
  jc: 'space-between',
  ai: 'flex-start',
  gap: '$4',
});

export const EntryTitleGroup = styled(YStack, {
  flex: 1,
  minWidth: 0,
});

const StyledEntryGameName = styled(Typography, {
  uiSize: 'lg',
  weight: '600',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  width: '100%',
} as any);

export const EntryGameName = ({
  children,
  title,
  ...props
}: { children?: ReactNode; title?: string } & Record<string, unknown>) => (
  <StyledEntryGameName title={title as any} {...(props as any)}>
    {children}
  </StyledEntryGameName>
);

const StyledEntryRoomName = styled(Typography, {
  uiSize: 'sm',
  alpha: 'medium',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  width: '100%',
} as any);

export const EntryRoomName = ({
  children,
  title,
  ...props
}: { children?: ReactNode; title?: string } & Record<string, unknown>) => (
  <StyledEntryRoomName title={title as any} {...(props as any)}>
    {children}
  </StyledEntryRoomName>
);

export const EntryStatus = ({
  children,
  ...props
}: { children?: ReactNode } & Record<string, unknown>) => (
  <Badge variant="info" size="sm" borderRadius={999} flexShrink={0} {...(props as any)}>
    {children}
  </Badge>
);

export const EntryMeta = styled(XStack, {
  flexWrap: 'wrap',
  gap: '$2',
});

export const EntryFooter = styled(XStack, {
  jc: 'space-between',
  ai: 'center',
  gap: '$4',
  marginTop: 'auto',
  paddingTop: '$3',
  borderTopWidth: 1,
  borderColor: '$borderColor',
});

export const EntryTimestamp = styled(Typography, {
  uiSize: 'xs',
  alpha: 'medium',
} as any);

export const EntryViewDetails = styled(Typography, {
  uiSize: 'sm',
  weight: '600',
  color: '$primary',
  '$group-entry-hover': {
    opacity: 0.8,
  },
} as any);
