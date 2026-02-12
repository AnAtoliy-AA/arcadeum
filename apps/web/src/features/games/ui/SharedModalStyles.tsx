import styled, { css, DefaultTheme } from 'styled-components';
import React from 'react';
import { Button } from '@/shared/ui';

// Simplified constants/types to avoid external deps
const GAME_VARIANT = {
  CYBERPUNK: 'cyberpunk',
  UNDERWATER: 'underwater',
};

const VARIANT_COLORS = {
  cyberpunk: {
    background: 'rgba(20, 0, 30, 0.95)',
    primary: '#06b6d4',
    accent: '#d946ef',
  },
};

const getModalFrameBackground = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return VARIANT_COLORS.cyberpunk.background;
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(8, 51, 68, 0.85)';
  return theme.surfaces.card.background;
};

const getModalFrameBorder = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) return 'rgba(192, 38, 211, 0.6)';
  if ($variant === GAME_VARIANT.UNDERWATER) return 'rgba(34, 211, 238, 0.5)';
  return theme.surfaces.card.border;
};

const getModalFrameShadow = ($variant: string | undefined) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) {
    return '0 0 30px rgba(192, 38, 211, 0.2), inset 0 0 20px rgba(192, 38, 211, 0.1)';
  }
  if ($variant === GAME_VARIANT.UNDERWATER) {
    return '0 0 30px rgba(34, 211, 238, 0.2), inset 0 0 20px rgba(34, 211, 238, 0.1)';
  }
  return '0 20px 60px rgba(0, 0, 0, 0.5)';
};

const getModalHeaderBorder = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK) return 'rgba(6, 182, 212, 0.3)';
  return theme.surfaces.card.border;
};

const getModalTitleColor = (
  $variant: string | undefined,
  theme: DefaultTheme,
) => {
  if ($variant === GAME_VARIANT.CYBERPUNK)
    return VARIANT_COLORS.cyberpunk.accent;
  return theme.text.primary;
};

// Modal Components
export const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
  overflow-y: auto;
`;

const StyledModalFrame = styled.div<{ $variant?: string }>`
  background: ${({ theme, $variant }) =>
    getModalFrameBackground($variant, theme)};
  border: 2px solid
    ${({ theme, $variant }) => getModalFrameBorder($variant, theme)};
  border-radius: ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK ? '4px' : '24px'};
  max-width: 600px;
  width: 100%;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: ${({ $variant }) => getModalFrameShadow($variant)};
  animation: slideUp 0.3s ease-out;
  margin: auto;

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        width: 20px;
        height: 20px;
        border-top: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        border-left: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        pointer-events: none;
      }
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
        border-bottom: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        border-right: 2px solid ${VARIANT_COLORS.cyberpunk.primary};
        pointer-events: none;
      }
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      &::before {
        content: '';
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(34, 211, 238, 0.2);
        border-radius: 20px;
        pointer-events: none;
      }
    `}
`;

const StyledScrollArea = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem;
  width: 100%;
  height: 100%;
  border-radius: inherit;
`;

export const ModalContent = ({
  children,
  $variant,
  onClick,
  style,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { $variant?: string }) => {
  return (
    <StyledModalFrame
      $variant={$variant}
      onClick={onClick}
      style={style}
      className={className}
      {...props}
    >
      <StyledScrollArea>{children}</StyledScrollArea>
    </StyledModalFrame>
  );
};

export const ModalHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid
    ${({ theme, $variant }) => getModalHeaderBorder($variant, theme)};
`;

export const ModalTitle = styled.h2<{ $variant?: string }>`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme, $variant }) => getModalTitleColor($variant, theme)};

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(232, 121, 249, 0.5);
    `}

  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      color: #22d3ee;
      text-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
    `}
`;

export const CloseButton = styled(Button).attrs({
  variant: 'icon',
  size: 'sm',
})<{ $variant?: string }>`
  &:hover:not(:disabled) {
    transform: rotate(90deg);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
`;

export const ModalButton = styled(Button)`
  flex: 1;
`;
