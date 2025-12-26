import styled from 'styled-components';
import { ReactNode, HTMLAttributes } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  children: ReactNode;
}

const sizeMap = {
  sm: '600px',
  md: '800px',
  lg: '1000px',
  xl: '1200px',
  full: '100%',
};

const StyledContainer = styled.div<{ $size: ContainerSize }>`
  max-width: ${({ $size }) => sizeMap[$size]};
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export function Container({ size = 'lg', children, ...props }: ContainerProps) {
  return (
    <StyledContainer $size={size} {...props}>
      {children}
    </StyledContainer>
  );
}
