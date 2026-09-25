import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnlinePuzzleDuel } from '../OnlinePuzzleDuel';

beforeEach(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

vi.mock('@/features/chess/lib/puzzle-duel-socket', () => ({
  getChessPuzzleDuelSocket: () => ({
    connected: true,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

describe('OnlinePuzzleDuel', () => {
  it('renders online duel lobby with create and join room options', () => {
    render(<OnlinePuzzleDuel onBackToBot={vi.fn()} />);

    expect(screen.getByTestId('online-puzzle-duel')).toBeDefined();
    expect(screen.getByText('Live Multiplayer Duel')).toBeDefined();
    expect(screen.getByTestId('create-room-btn')).toBeDefined();
    expect(screen.getByTestId('join-room-input')).toBeDefined();
    expect(screen.getByTestId('join-room-btn')).toBeDefined();
  });

  it('generates room code on create room click', () => {
    render(<OnlinePuzzleDuel onBackToBot={vi.fn()} />);

    const createBtn = screen.getByTestId('create-room-btn');
    fireEvent.click(createBtn);

    expect(screen.getByTestId('room-code-display')).toBeDefined();
    expect(screen.getByTestId('copy-room-link-btn')).toBeDefined();
    expect(screen.getByTestId('start-solo-race-btn')).toBeDefined();
  });
});
