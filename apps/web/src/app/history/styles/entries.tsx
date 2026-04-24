import {
  styled,
  XStack,
  YStack,
  type GetProps,
  type TamaguiComponent,
} from 'tamagui';
import { Card, Badge, Typography } from '@arcadeum/ui';
import type { ReactNode, ComponentType } from 'react';

type WithGetProps<
  T extends TamaguiComponent | ComponentType<Record<string, unknown>>,
> = GetProps<T> &
  React.HTMLAttributes<HTMLElement> & {
    children?: ReactNode;
  };

export const EntriesGrid = styled(YStack, {
  display: 'grid' as 'flex',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '$4',
  width: '100%',
});

export const EntryCard = styled(Card, {
  name: 'EntryCard',
  variant: 'elevated',
  cardPadding: 'md',
  interactive: true,
  flexDirection: 'column',
  gap: '$3',
  cursor: 'pointer',
});

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
});

export const EntryGameName = ({
  children,
  title,
  ...props
}: { title?: string } & WithGetProps<typeof StyledEntryGameName>) => (
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
});

export const EntryRoomName = ({
  children,
  title,
  ...props
}: { title?: string } & WithGetProps<typeof StyledEntryRoomName>) => (
  <StyledEntryRoomName title={title} {...props}>
    {children}
  </StyledEntryRoomName>
);

export const EntryStatus = ({
  children,
  ...props
}: WithGetProps<typeof Badge>) => (
  <Badge variant="info" size="sm" borderRadius={999} flexShrink={0} {...props}>
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
});

export const EntryViewDetails = styled(Typography, {
  uiSize: 'sm',
  weight: '600',
  color: '$primary',
});

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
});
