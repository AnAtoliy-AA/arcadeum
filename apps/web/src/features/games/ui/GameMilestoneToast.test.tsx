import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameMilestoneToast } from './GameMilestoneToast';

describe('GameMilestoneToast', () => {
  it('does not render when isOpen is false', () => {
    render(
      <GameMilestoneToast
        isOpen={false}
        icon="⚡"
        title="Hidden Toast"
        onDismiss={vi.fn()}
      />,
    );

    expect(
      screen.queryByTestId('game-milestone-toast'),
    ).not.toBeInTheDocument();
  });

  it('renders milestone toast content correctly', () => {
    render(
      <GameMilestoneToast
        isOpen
        icon="👑"
        badge="Champion"
        title="2048 Achieved!"
        description="Great job"
        actionLabel="Keep Going"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByTestId('game-milestone-toast')).toBeInTheDocument();
    expect(screen.getByText('👑')).toBeInTheDocument();
    expect(screen.getByText('Champion')).toBeInTheDocument();
    expect(screen.getByText('2048 Achieved!')).toBeInTheDocument();
    expect(screen.getByText('Great job')).toBeInTheDocument();
    expect(screen.getByText('Keep Going')).toBeInTheDocument();
  });

  it('triggers onAction callback when action button is clicked', () => {
    const handleAction = vi.fn();
    const handleDismiss = vi.fn();

    render(
      <GameMilestoneToast
        isOpen
        icon="⚡"
        title="Power Up"
        actionLabel="Claim"
        onAction={handleAction}
        onDismiss={handleDismiss}
      />,
    );

    fireEvent.click(screen.getByTestId('game-milestone-dismiss'));
    expect(handleAction).toHaveBeenCalledTimes(1);
    expect(handleDismiss).not.toHaveBeenCalled();
  });

  it('falls back to onDismiss when action button is clicked without onAction', () => {
    const handleDismiss = vi.fn();

    render(
      <GameMilestoneToast
        isOpen
        icon="⚡"
        title="Power Up"
        actionLabel="Continue"
        onDismiss={handleDismiss}
      />,
    );

    fireEvent.click(screen.getByTestId('game-milestone-dismiss'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('triggers onDismiss when animation ends', () => {
    const handleDismiss = vi.fn();

    render(
      <GameMilestoneToast
        isOpen
        icon="⚡"
        title="Auto Fade"
        onDismiss={handleDismiss}
      />,
    );

    fireEvent.animationEnd(screen.getByTestId('game-milestone-toast'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders sparkles when provided', () => {
    render(
      <GameMilestoneToast
        isOpen
        icon="🌌"
        title="Sparkle Toast"
        sparkles={['✨', '🌟']}
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText('✨')).toBeInTheDocument();
    expect(screen.getByText('🌟')).toBeInTheDocument();
  });

  it('accepts custom test IDs', () => {
    render(
      <GameMilestoneToast
        isOpen
        icon="⚡"
        title="Custom ID"
        actionLabel="Dismiss"
        dataTestId="custom-toast"
        actionTestId="custom-action"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByTestId('custom-toast')).toBeInTheDocument();
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });
});
