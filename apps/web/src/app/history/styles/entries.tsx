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
  variant: 'elevated' as never,
  cardPadding: 'md' as never,
  interactive: true,
  flexDirection: 'column',
  gap: '$3',
  cursor: 'pointer',
  group: 'entry' as never,
} as Record<string, unknown>);

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
} as Record<string, unknown>);

export const EntryGameName = ({
  children,
  title,
  ...props
}: { children?: ReactNode; title?: string } & Record<string, unknown>) => (
  // @ts-expect-error tamagui styled typings
  <StyledEntryGameName title={title} {...props}>
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
} as Record<string, unknown>);

export const EntryRoomName = ({
  children,
  title,
  ...props
}: { children?: ReactNode; title?: string } & Record<string, unknown>) => (
  // @ts-expect-error tamagui styled typings
  <StyledEntryRoomName title={title} {...props}>
    {children}
  </StyledEntryRoomName>
);

export const EntryStatus = ({
  children,
  ...props
}: { children?: ReactNode } & Record<string, unknown>) => (
  <Badge
    variant="info"
    size="sm"
    borderRadius={999}
    flexShrink={0}
    {...(props as Record<string, unknown>)}
  >
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
} as Record<string, unknown>);

export const EntryViewDetails = styled(Typography, {
  uiSize: 'sm',
  weight: '600',
  color: '$primary',
  '$group-entry-hover': {
    opacity: 0.8,
  },
} as Record<string, unknown>);

export const PaginationSpinner = styled(YStack, {
  name: 'PaginationSpinner',
  gridColumn: '1 / -1',
  jc: 'center',
  ai: 'center',
  padding: '$8',
  width: '100%',
});

export const EndOfListText = styled(Typography, {
  name: 'EndOfListText',
  uiSize: 'sm',
  alpha: 'medium',
  textAlign: 'center',
  padding: '$8',
  gridColumn: '1 / -1',
  width: '100%',
} as Record<string, unknown>);
