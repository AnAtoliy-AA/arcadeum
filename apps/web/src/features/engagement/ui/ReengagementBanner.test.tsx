import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ReengagementBanner } from './ReengagementBanner';

describe('ReengagementBanner', () => {
  const mockTrigger = {
    id: 'streak_danger',
    type: 'streak_danger' as const,
    title: 'Streak at Risk!',
    description: 'Your streak is expiring soon.',
    actionLabel: 'Play Now',
    actionUrl: '/daily-challenges',
    dismissible: true,
  };

  it('renders trigger title and description', () => {
    render(<ReengagementBanner trigger={mockTrigger} />);
    expect(screen.getByText('Streak at Risk!')).toBeDefined();
    expect(screen.getByText('Your streak is expiring soon.')).toBeDefined();
    expect(screen.getByText('Play Now')).toBeDefined();
  });

  it('handles dismiss button click', () => {
    const onDismiss = vi.fn();
    render(<ReengagementBanner trigger={mockTrigger} onDismiss={onDismiss} />);
    const dismissBtn = screen.getByLabelText('Dismiss banner');
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
