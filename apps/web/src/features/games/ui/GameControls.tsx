import React from 'react';
import type { ReactNode } from 'react';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

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

const CONTROLS_VARIANT_CLASSES: Record<
  'primary' | 'secondary' | 'minimal',
  string
> = {
  primary: 'bg-[var(--background)] border-[var(--borderColor)]',
  secondary: 'bg-[rgba(255,255,255,0.05)] border-[var(--borderColor)]',
  minimal: 'bg-transparent border-transparent',
};

const ControlsContainer = ({
  variant = 'primary',
  className,
  children,
}: {
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cx(
      'flex flex-row items-center gap-3 px-4 py-3 rounded-[8px] border flex-wrap max-[800px]:gap-2 max-[800px]:px-3 max-[800px]:py-2',
      CONTROLS_VARIANT_CLASSES[variant],
      className,
    )}
  >
    {children}
  </div>
);

const ControlDivider = ({ className }: { className?: string }) => (
  <div
    className={cx(
      'w-[1px] h-6 bg-[var(--borderColor)] opacity-[0.3] mx-1',
      className,
    )}
  />
);

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
    <Button className={className} variant={variant} size="sm" onClick={onClick}>
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
    >
      {ready ? '✅' : '⚪'} {ready ? 'Ready' : 'Not Ready'}
    </Button>
  );
}
