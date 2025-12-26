import styled from 'styled-components';
import { ReactNode, HTMLAttributes } from 'react';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const StyledEmpty = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
  font-size: 1.1rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-radius: 20px;
  border: 1px dashed ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  opacity: 0.5;
`;

const EmptyMessage = styled.p`
  margin: 0;
`;

const EmptyAction = styled.div`
  margin-top: 0.5rem;
`;

export function EmptyState({
  message,
  icon,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <StyledEmpty {...props}>
      {icon && <EmptyIcon>{icon}</EmptyIcon>}
      <EmptyMessage>{message}</EmptyMessage>
      {action && <EmptyAction>{action}</EmptyAction>}
    </StyledEmpty>
  );
}
