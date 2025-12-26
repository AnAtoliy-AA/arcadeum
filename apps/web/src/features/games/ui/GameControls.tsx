'use client';

import React from 'react';
import styled from 'styled-components';
import { Button, Divider, Card } from '@/shared/ui';

interface GameControlsProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'primary' | 'secondary' | 'minimal';
  showFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  showSettings?: boolean;
  onSettings?: () => void;
  showHelp?: boolean;
  onHelp?: () => void;
}

const ControlsContainer = styled(Card)<{
  $position?: string;
  $variant?: string;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return theme.surfaces.panel.background;
      case 'secondary':
        return 'rgba(255, 255, 255, 0.05)';
      case 'minimal':
        return 'transparent';
      default:
        return theme.surfaces.panel.background;
    }
  }};
  border: ${({ theme, $variant }) =>
    $variant === 'minimal'
      ? 'none'
      : `1px solid ${theme.surfaces.card.border}`};
  box-shadow: ${({ $variant }) =>
    $variant === 'minimal' ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  backdrop-filter: blur(10px);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
  }
`;

const ControlButton = styled(Button)<{ $variant?: string }>`
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;

  @media (max-width: 768px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
`;

const ControlDivider = styled(Divider)`
  width: 1px;
  height: 24px;
  margin: 0;
  opacity: 0.3;
`;

export function GameControls({
  children,
  className,
  position = 'bottom',
  variant = 'primary',
  showFullscreen = true,
  onFullscreenToggle,
  showSettings = false,
  onSettings,
  showHelp = false,
  onHelp,
}: GameControlsProps) {
  const buttonVariant = variant === 'primary' ? 'primary' : 'secondary';

  return (
    <ControlsContainer
      className={className}
      $position={position}
      $variant={variant}
    >
      {children}

      {children && (showFullscreen || showSettings || showHelp) && (
        <ControlDivider />
      )}

      {showFullscreen && (
        <ControlButton
          variant={buttonVariant}
          size="sm"
          onClick={onFullscreenToggle}
          title="Toggle fullscreen"
        >
          🖥️
        </ControlButton>
      )}

      {showSettings && (
        <ControlButton
          variant={buttonVariant}
          size="sm"
          onClick={onSettings}
          title="Game settings"
        >
          ⚙️
        </ControlButton>
      )}

      {showHelp && (
        <ControlButton
          variant={buttonVariant}
          size="sm"
          onClick={onHelp}
          title="Game help"
        >
          ❓
        </ControlButton>
      )}
    </ControlsContainer>
  );
}

// Specific control buttons for common game actions
export function LeaveButton({
  onClick,
  className,
  variant = 'secondary',
}: {
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Button
      className={className}
      variant={variant}
      size="sm"
      onClick={onClick}
      title="Leave game"
    >
      🚪 Leave
    </Button>
  );
}

export function StartButton({
  onClick,
  className,
  disabled = false,
  variant = 'primary',
}: {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Button
      className={className}
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title="Start game"
    >
      ▶️ Start
    </Button>
  );
}

export function ReadyButton({
  onClick,
  className,
  ready = false,
}: {
  onClick?: () => void;
  className?: string;
  ready?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
}) {
  return (
    <Button
      className={className}
      variant={ready ? 'primary' : 'secondary'}
      size="sm"
      onClick={onClick}
      title={ready ? 'Not ready' : "I'm ready"}
    >
      {ready ? '✅' : '⚪'} {ready ? 'Ready' : 'Not Ready'}
    </Button>
  );
}
