import { YStack, Text, styled } from 'tamagui';
import { memo } from 'react';
import type { ReactNode, ReactElement } from 'react';

export type EmptyStateProps = {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
};

const StyledEmpty = styled(YStack, {
  name: 'EmptyState',
  padding: '$8',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$4',
  borderRadius: '$5',
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: '$borderColor',
  backgroundColor: '$background',
});

const EmptyIcon = styled(YStack, {
  name: 'EmptyIcon',
  opacity: 0.5,
  scale: 2,
  marginBottom: '$2',
});

const EmptyMessage = styled(Text, {
  name: 'EmptyMessage',
  fontSize: '$4',
  color: '$color',
  opacity: 0.7,
  style: {
    textAlign: 'center',
  },
});

export const EmptyState = memo(function EmptyState({
  message,
  icon,
  action,
}: EmptyStateProps): ReactElement {
  return (
    <StyledEmpty>
      {icon && (
        <EmptyIcon>
          {typeof icon === 'string' ? <Text>{icon}</Text> : icon}
        </EmptyIcon>
      )}
      <EmptyMessage>{message}</EmptyMessage>
      {action && <YStack marginTop="$2">{action}</YStack>}
    </StyledEmpty>
  );
});
