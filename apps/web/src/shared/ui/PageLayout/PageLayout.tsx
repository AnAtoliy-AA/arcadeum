import styled from 'styled-components';
import { ReactNode, HTMLAttributes } from 'react';

export interface PageLayoutProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

const StyledPage = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

export function PageLayout({ children, ...props }: PageLayoutProps) {
  return <StyledPage {...props}>{children}</StyledPage>;
}
