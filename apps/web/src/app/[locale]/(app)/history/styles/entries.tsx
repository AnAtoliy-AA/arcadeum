import {
  styled,
  XStack,
  YStack,
  type GetProps,
  type TamaguiComponent,
} from 'tamagui';
import { Card, Badge, Typography } from '@arcadeum/ui';
import type { ReactNode, ComponentType } from 'react';
import type * as React from 'react';

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

const entryTextClasses =
  'w-full overflow-hidden whitespace-nowrap [text-overflow:ellipsis]';

export const EntryGameName = ({
  children,
  title,
  ...props
}: { title?: string } & React.ComponentProps<typeof Typography>) => (
  <Typography
    className={entryTextClasses}
    uiSize="lg"
    weight="600"
    title={title}
    {...props}
  >
    {children}
  </Typography>
);

export const EntryRoomName = ({
  children,
  title,
  ...props
}: { title?: string } & React.ComponentProps<typeof Typography>) => (
  <Typography
    className={entryTextClasses}
    uiSize="sm"
    alpha="medium"
    title={title}
    {...props}
  >
    {children}
  </Typography>
);

export const EntryStatus = ({
  children,
  ...props
}: WithGetProps<typeof Badge>) => (
  <Badge
    className="rounded-[999px] shrink-0"
    variant="info"
    size="sm"
    {...props}
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
