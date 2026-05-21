import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameChatPopupOverlay } from '../GameChatPopupOverlay';
import { useGameChatStore } from '../../store/gameChatStore';

vi.mock('../ChatMessagePopup', () => ({
  ChatMessagePopup: ({
    senderName,
    message,
    isOwn,
  }: {
    senderName: string;
    message: string;
    isOwn?: boolean;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'chat-message-popup', 'data-is-own': String(!!isOwn) },
      React.createElement(
        'span',
        { 'data-testid': 'popup-sender' },
        senderName,
      ),
      React.createElement('span', { 'data-testid': 'popup-message' }, message),
    ),
}));

const baseLog = {
  id: 'msg-1',
  type: 'message' as const,
  senderId: 'opponent-1',
  senderName: 'Admiral',
  message: 'Prepare for battle!',
  createdAt: '2026-05-21T00:00:00Z',
  scope: 'all' as const,
};

describe('GameChatPopupOverlay', () => {
  beforeEach(() => {
    useGameChatStore.getState().clear();
  });

  it('renders nothing when there are no messages', () => {
    render(<GameChatPopupOverlay />);
    expect(screen.queryByTestId('chat-message-popup')).toBeNull();
  });

  it('renders the popup for the latest message when chat panel is closed', () => {
    useGameChatStore.getState().setLogs([baseLog]);
    render(<GameChatPopupOverlay />);
    expect(screen.getByTestId('chat-message-popup')).toBeTruthy();
    expect(screen.getByTestId('popup-sender').textContent).toBe('Admiral');
    expect(screen.getByTestId('popup-message').textContent).toBe(
      'Prepare for battle!',
    );
  });

  it('renders nothing when chat panel is open', () => {
    useGameChatStore.getState().setLogs([baseLog]);
    useGameChatStore.getState().setChatPanelOpen(true);
    render(<GameChatPopupOverlay />);
    expect(screen.queryByTestId('chat-message-popup')).toBeNull();
  });

  it('prefers game resolver over fallback for sender name', () => {
    useGameChatStore.getState().setLogs([baseLog]);
    useGameChatStore
      .getState()
      .registerResolveDisplayName((id) =>
        id === 'opponent-1' ? 'Captain Game' : undefined,
      );
    useGameChatStore
      .getState()
      .registerFallbackResolveDisplayName(() => 'Fallback Name');
    render(<GameChatPopupOverlay />);
    expect(screen.getByTestId('popup-sender').textContent).toBe('Captain Game');
  });

  it('falls back to fallback resolver when game resolver returns Unknown', () => {
    useGameChatStore.getState().setLogs([baseLog]);
    useGameChatStore.getState().registerResolveDisplayName(() => 'Unknown');
    useGameChatStore
      .getState()
      .registerFallbackResolveDisplayName(() => 'Member Name');
    render(<GameChatPopupOverlay />);
    expect(screen.getByTestId('popup-sender').textContent).toBe('Member Name');
  });

  it('marks popup as own when sender matches currentUserId', () => {
    useGameChatStore
      .getState()
      .setLogs([{ ...baseLog, senderId: 'me-1', senderName: 'Me' }]);
    useGameChatStore.getState().setCurrentUserId('me-1');
    render(<GameChatPopupOverlay />);
    expect(
      screen.getByTestId('chat-message-popup').getAttribute('data-is-own'),
    ).toBe('true');
  });
});
