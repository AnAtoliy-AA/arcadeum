import React from 'react';
import { styled, YStack, XStack } from 'tamagui';
import { Button } from '@arcadeum/ui';

interface GameControlsProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  showFullscreen?: boolean;
  onFullscreenToggle?: () => void;
  showSettings?: boolean;
  onSettings?: () => void;
  showHelp?: boolean;
  onHelp?: () => void;
}

const ControlsContainer = styled(XStack, {
  name: 'GameControls',
  alignItems: 'center',
  gap: '$3',
  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
  flexWrap: 'wrap',

  $sm: {
    gap: '$2',
    paddingHorizontal: '$3',
    paddingVertical: '$2',
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$background',
        borderColor: '$borderColor',
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: '$borderColor',
      },
      minimal: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
        shadowColor: 'transparent',
      },
    },
  } as const,
});

const ControlDivider = styled(YStack, {
  name: 'ControlDivider',
  width: 1,
  height: 24,
  backgroundColor: '$borderColor',
  opacity: 0.3,
  marginHorizontal: '$1',
});

export function GameControls({
  children,
  className,
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
    <ControlsContainer className={className} variant={variant}>
      {children}

      {children && (showFullscreen || showSettings || showHelp) && (
        <ControlDivider />
      )}

      {showFullscreen && (
        <Button variant={buttonVariant} size="sm" onClick={onFullscreenToggle}>
          🖥️
        </Button>
      )}

      {showSettings && (
        <Button variant={buttonVariant} size="sm" onClick={onSettings}>
          ⚙️
        </Button>
      )}

      {showHelp && (
        <Button variant={buttonVariant} size="sm" onClick={onHelp}>
          ❓
        </Button>
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
    <Button className={className} variant={variant} size="sm" onPress={onClick}>
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
      onPress={onClick}
      disabled={disabled}
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
      onPress={onClick}
    >
      {ready ? '✅' : '⚪'} {ready ? 'Ready' : 'Not Ready'}
    </Button>
  );
}
