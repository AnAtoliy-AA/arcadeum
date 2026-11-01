import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArcadePetGiftsModal } from './ArcadePetGiftsModal';
import { useArcadePetStore } from '../store/useArcadePetStore';

const mockSessionState = { role: 'user', userId: 'player-1' };

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: mockSessionState,
    hydrated: true,
  }),
}));

describe('ArcadePetGiftsModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionState.role = 'user';
    useArcadePetStore.setState({
      gemBalance: 200,
      pets: [],
      presents: [
        {
          id: 'gift-1',
          senderId: 'player-42',
          senderName: 'Charlie',
          species: 'dino',
          theme: 'zen',
          petName: 'Zen Rex',
          message: 'Good luck in games!',
          createdAt: Date.now(),
          isOpened: false,
        },
      ],
    });
  });

  it('renders received present with claim button', () => {
    render(<ArcadePetGiftsModal open onClose={onClose} />);
    expect(screen.getByTestId('arcade-pet-gifts-modal')).toBeInTheDocument();
    expect(screen.getByText('Zen Rex')).toBeInTheDocument();
    expect(screen.getByText('From: Charlie')).toBeInTheDocument();
    expect(screen.getByTestId('claim-present-gift-1')).toBeInTheDocument();
  });

  it('displays admin badge on gifts sent by admin', () => {
    useArcadePetStore.setState({
      presents: [
        {
          id: 'admin-gift-1',
          senderId: 'admin',
          senderName: '👑 Arcadeum Admin',
          species: 'dragon',
          theme: 'cyberpunk',
          petName: 'Neon Wyrm',
          message: 'Official prize!',
          createdAt: Date.now(),
          isOpened: false,
        },
      ],
    });

    render(<ArcadePetGiftsModal open onClose={onClose} />);
    expect(screen.getByTestId('admin-gift-badge')).toBeInTheDocument();
    expect(screen.getByText('👑 Admin Gift')).toBeInTheDocument();
  });

  it('claims present when button is clicked', () => {
    render(<ArcadePetGiftsModal open onClose={onClose} />);
    const claimBtn = screen.getByTestId('claim-present-gift-1');
    fireEvent.click(claimBtn);

    expect(useArcadePetStore.getState().pets.length).toBe(1);
    expect(useArcadePetStore.getState().pets[0]?.name).toBe('Zen Rex');
    expect(useArcadePetStore.getState().gemBalance).toBe(250);
  });

  it('allows sending pet gift to another player', () => {
    render(<ArcadePetGiftsModal open onClose={onClose} />);
    const sendTab = screen.getByTestId('tab-send-gift');
    fireEvent.click(sendTab);

    const recipientInput = screen.getByTestId('gift-recipient-input');
    fireEvent.change(recipientInput, { target: { value: 'Dave' } });

    const sendBtn = screen.getByTestId('send-pet-gift-btn');
    fireEvent.click(sendBtn);

    expect(useArcadePetStore.getState().gemBalance).toBe(150);
    expect(screen.getByText(/Pet gift sent to Dave/i)).toBeInTheDocument();
  });

  it('displays admin authority callout and grants gift for 0 gems when user is admin', () => {
    mockSessionState.role = 'admin';
    useArcadePetStore.setState({ gemBalance: 0 });

    render(<ArcadePetGiftsModal open onClose={onClose} />);
    const sendTab = screen.getByTestId('tab-send-gift');
    expect(sendTab).toHaveTextContent('Admin Gift Pet 👑');
    fireEvent.click(sendTab);

    expect(screen.getByTestId('admin-gift-callout')).toBeInTheDocument();
    const sendBtn = screen.getByTestId('send-pet-gift-btn');
    expect(sendBtn).toHaveTextContent(
      'Grant Pet Gift (0 💎 Admin Authority) 👑',
    );

    const recipientInput = screen.getByTestId('gift-recipient-input');
    fireEvent.change(recipientInput, { target: { value: 'WinnerUser' } });
    fireEvent.click(sendBtn);

    expect(useArcadePetStore.getState().gemBalance).toBe(0);
    expect(
      screen.getByText(/Pet gift sent to WinnerUser/i),
    ).toBeInTheDocument();
    const presents = useArcadePetStore.getState().presents;
    expect(presents[0]?.senderId).toBe('admin');
  });
});
