import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';

describe('OfflineStatusIndicator', () => {
  it('renders offline warning when isOnline is false', () => {
    const onPlay = vi.fn();
    render(
      <OfflineStatusIndicator
        isOnline={false}
        cachedGamesCount={3}
        onPlayOfflineClick={onPlay}
      />,
    );

    expect(screen.getByText('Offline Mode Active')).toBeDefined();
    expect(
      screen.getByText('3 game(s) available to play offline against AI'),
    ).toBeDefined();

    const btn = screen.getByText('Play Offline');
    fireEvent.click(btn);
    expect(onPlay).toHaveBeenCalled();
  });

  it('renders nothing when isOnline is true', () => {
    const { container } = render(
      <OfflineStatusIndicator isOnline={true} cachedGamesCount={3} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
