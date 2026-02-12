import styled from 'styled-components';
import { HTMLAttributes } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  alt?: string;
  src?: string;
  size?: AvatarSize;
}

const sizeMap = {
  sm: '24px',
  md: '36px',
  lg: '48px',
  xl: '64px',
};

const fontSizeMap = {
  sm: '0.65rem',
  md: '0.875rem',
  lg: '1rem',
  xl: '1.25rem',
};

interface StyledAvatarProps {
  $size: AvatarSize;
}

const StyledAvatar = styled.div<StyledAvatarProps>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart} 0%,
    ${({ theme }) =>
        theme.buttons.primary.gradientEnd ||
        theme.buttons.primary.gradientStart}
      100%
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => fontSizeMap[$size]};
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

export function Avatar({
  name = '?',
  alt,
  src,
  size = 'md',
  ...props
}: AvatarProps) {
  return (
    <StyledAvatar $size={size} {...props}>
      {src ? (
        <AvatarImage src={src} alt={alt !== undefined ? alt : name} />
      ) : (
        getInitials(name)
      )}
    </StyledAvatar>
  );
}
