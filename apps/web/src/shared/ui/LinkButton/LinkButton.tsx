import styled, { css } from 'styled-components';
import Link from 'next/link';
import { ReactNode, AnchorHTMLAttributes } from 'react';

export type LinkButtonVariant = 'primary' | 'secondary' | 'ghost';
export type LinkButtonSize = 'sm' | 'md' | 'lg';

export interface LinkButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
  fullWidth?: boolean;
  external?: boolean;
  children: ReactNode;
}

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

const sizeStyles = {
  sm: css`
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 8px;
  `,
  md: css`
    padding: 0.75rem 1.25rem;
    font-size: 0.85rem;
    border-radius: 10px;
  `,
  lg: css`
    padding: 0.875rem 1.75rem;
    font-size: 0.95rem;
    border-radius: 14px;
  `,
};

const variantStyles = {
  primary: css`
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart} 0%,
      ${({ theme }) =>
          theme.buttons.primary.gradientEnd ||
          theme.buttons.primary.gradientStart}
        100%
    );
    color: ${({ theme }) => theme.buttons.primary.text};
    box-shadow: 0 2px 10px
      ${({ theme }) => theme.buttons.primary.gradientStart}30;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px
        ${({ theme }) => theme.buttons.primary.gradientStart}50;
    }
  `,
  secondary: css`
    background: transparent;
    border: 1px solid ${({ theme }) => theme.surfaces.card.border};
    color: ${({ theme }) => theme.text.secondary};

    &:hover {
      border-color: ${({ theme }) => theme.text.secondary};
      color: ${({ theme }) => theme.text.primary};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.text.secondary};
    border-color: transparent;

    &:hover {
      background: ${({ theme }) => theme.surfaces.card.background};
      color: ${({ theme }) => theme.text.primary};
    }
  `,
};

interface StyledLinkProps {
  $variant: LinkButtonVariant;
  $size: LinkButtonSize;
  $fullWidth: boolean;
}

const StyledLink = styled(Link)<StyledLinkProps>`
  ${buttonBase}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
`;

const StyledExternalLink = styled.a<StyledLinkProps>`
  ${buttonBase}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
`;

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  external = false,
  children,
  ...props
}: LinkButtonProps) {
  if (external) {
    return (
      <StyledExternalLink
        href={href}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </StyledExternalLink>
    );
  }

  return (
    <StyledLink
      href={href}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledLink>
  );
}
