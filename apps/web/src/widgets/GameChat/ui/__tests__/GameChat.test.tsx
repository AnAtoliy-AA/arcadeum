import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameChat } from '../GameChat';
import { useGameChatStore } from '../../store/gameChatStore';
import type { ChatLogEntry } from '../../store/gameChatStore';

import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';

vi.mock('@/shared/ui/PlayerAvatar', () => ({
  EquippedPlayerAvatar: ({ name }: { name?: string }) =>
    React.createElement('span', { 'data-testid': 'player-avatar' }, name),
}));

vi.mock('@/features/shop/hooks/useEquippedCosmetics', () => ({
  useEquippedCosmetics: () => ({ nameColor: null }),
}));

function renderChat(ui: React.ReactElement) {
  return render(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );
}

vi.mock('@arcadeum/ui', async () => {
  const passthrough = (name: string) =>
    function Stub({ children }: { children?: React.ReactNode }) {
      return React.createElement('div', { 'data-stub': name }, children);
    };
  const button = ({
    children,
    onClick,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
  }) => React.createElement('button', { onClick }, children);
  return {
    XStack: passthrough('XStack'),
    YStack: passthrough('YStack'),
    ScrollView: passthrough('ScrollView'),
    Button: button,
    IconButton: button,
    GlassCard: passthrough('GlassCard'),
    CloseIcon: () => React.createElement('span'),
    Typography: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('span', null, children),
    ChatInput: () =>
      React.createElement('input', { 'data-testid': 'chat-input' }),
    PlayerAvatar: ({ name }: { name?: string }) =>
      React.createElement('span', { 'data-testid': 'player-avatar' }, name),
    ChatMessage: ({
      senderName,
      senderColor,
      content,
      isOwn,
      type,
      senderAvatar,
    }: {
      senderName?: string;
      senderColor?: string;
      content: string;
      isOwn?: boolean;
      type?: 'system' | 'action' | 'message';
      senderAvatar?: React.ReactNode;
    }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'chat-message',
          'data-is-own': String(!!isOwn),
          'data-sender': senderName ?? '',
          'data-sender-color': senderColor ?? '',
          'data-type': type ?? 'message',
        },
        senderAvatar,
        content,
      ),
  };
});

function makeLog(overrides: Partial<ChatLogEntry> = {}): ChatLogEntry {
  return {
    id: overrides.id ?? '1',
    type: 'message',
    message: 'hello',
    createdAt: new Date().toISOString(),
    senderId: 'u1',
    senderName: null,
    scope: 'all',
    ...overrides,
  };
}

describe('GameChat', () => {
  beforeEach(() => {
    useGameChatStore.getState().clear();
  });

  it('marks a chat message as own when senderId matches currentUserId', () => {
    useGameChatStore
      .getState()
      .setLogs([
        makeLog({ id: 'a', senderId: 'me', message: 'mine' }),
        makeLog({ id: 'b', senderId: 'other', message: 'theirs' }),
      ]);

    renderChat(
      <GameChat
        currentUserId="me"
        resolveDisplayName={(id) => (id === 'me' ? 'You' : 'Bob')}
      />,
    );

    const rendered = screen.getAllByTestId('chat-message');
    expect(rendered).toHaveLength(2);
    expect(rendered[0]?.getAttribute('data-is-own')).toBe('true');
    expect(rendered[0]?.textContent).toContain('You');
    expect(rendered[1]?.getAttribute('data-is-own')).toBe('false');
    expect(rendered[1]?.textContent).toContain('Bob');
  });

  it('renders system and action logs separately from chat messages', () => {
    useGameChatStore.getState().setLogs([
      makeLog({
        id: 'a',
        type: 'action',
        senderId: 'p1',
        message: 'Drew a card',
      }),
      makeLog({
        id: 'b',
        type: 'system',
        senderId: 'p2',
        message: 'exploded!',
      }),
      makeLog({ id: 'c', type: 'message', senderId: 'p1', message: 'hi' }),
    ]);

    renderChat(
      <GameChat
        currentUserId="p1"
        resolveDisplayName={(id) => (id === 'p1' ? 'You' : 'Bob')}
      />,
    );

    // Only `message` logs use the ChatMessage component; system/action rows
    // render via the new GameChatSystemRow surface.
    const chatRendered = screen.getAllByTestId('chat-message');
    expect(chatRendered).toHaveLength(1);
    expect(chatRendered[0]?.textContent).toContain('hi');
    expect(chatRendered[0]?.textContent).toContain('You');

    // System / action messages still appear somewhere in the rendered tree.
    expect(screen.getByText(/Drew a card/)).toBeTruthy();
    expect(screen.getByText(/exploded!/)).toBeTruthy();
  });

  it('renders sender (and optional target) on system and action rows', () => {
    useGameChatStore.getState().setLogs([
      makeLog({
        id: 'sa',
        type: 'action',
        senderId: 'p1',
        targetId: 'p2',
        message: 'attacked H10 — MISS!',
      }),
      makeLog({
        id: 'ss',
        type: 'system',
        senderId: 'p1',
        message: 'A player has finished placing ships',
      }),
    ]);

    renderChat(
      <GameChat
        currentUserId="p1"
        resolveDisplayName={(id) =>
          id === 'p1' ? 'Alice' : id === 'p2' ? 'Bob' : id
        }
      />,
    );

    const senders = screen.getAllByTestId('system-row-sender');
    expect(senders.map((n) => n.textContent)).toEqual(['Alice', 'Alice']);

    const targets = screen.getAllByTestId('system-row-target');
    expect(targets.map((n) => n.textContent)).toEqual(['Bob']);
  });

  it('treats messages as not-own when currentUserId is missing', () => {
    useGameChatStore
      .getState()
      .setLogs([makeLog({ id: 'a', senderId: 'someone', message: 'hi' })]);

    renderChat(
      <GameChat
        resolveDisplayName={(id) => (id === 'someone' ? 'Alice' : id)}
      />,
    );

    const rendered = screen.getAllByTestId('chat-message');
    expect(rendered[0]?.getAttribute('data-is-own')).toBe('false');
    expect(rendered[0]?.textContent).toContain('Alice');
  });
});
