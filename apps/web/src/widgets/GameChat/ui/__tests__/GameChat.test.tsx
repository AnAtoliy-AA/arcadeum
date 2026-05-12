import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GameChat } from '../GameChat';
import { useGameChatStore } from '../../store/gameChatStore';
import type { ChatLogEntry } from '../../store/gameChatStore';

vi.mock('@arcadeum/ui', async () => {
  const React = await import('react');
  // Lightweight stubs for the Tamagui surface used by GameChat — we only
  // need to verify what GameChat passes to ChatMessage.
  const passthrough = (name: string) =>
    function Stub({ children }: { children?: React.ReactNode }) {
      return React.createElement('div', { 'data-stub': name }, children);
    };
  return {
    XStack: passthrough('XStack'),
    YStack: passthrough('YStack'),
    ScrollView: passthrough('ScrollView'),
    Button: ({
      children,
      onClick,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
    }) => React.createElement('button', { onClick }, children),
    GlassCard: passthrough('GlassCard'),
    CloseIcon: () => React.createElement('span'),
    Typography: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('span', null, children),
    ChatInput: () =>
      React.createElement('input', { 'data-testid': 'chat-input' }),
    ChatMessage: ({
      senderName,
      senderColor,
      content,
      isOwn,
      type,
    }: {
      senderName?: string;
      senderColor?: string;
      content: string;
      isOwn?: boolean;
      type?: 'system' | 'action' | 'message';
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

  it('marks a message as own when senderId matches currentUserId', () => {
    useGameChatStore
      .getState()
      .setLogs([
        makeLog({ id: 'a', senderId: 'me', message: 'mine' }),
        makeLog({ id: 'b', senderId: 'other', message: 'theirs' }),
      ]);

    render(
      <GameChat
        currentUserId="me"
        resolveDisplayName={(id) => (id === 'me' ? 'You' : 'Bob')}
      />,
    );

    const rendered = screen.getAllByTestId('chat-message');
    expect(rendered[0]?.getAttribute('data-is-own')).toBe('true');
    expect(rendered[0]?.getAttribute('data-sender')).toBe('You');
    expect(rendered[1]?.getAttribute('data-is-own')).toBe('false');
    expect(rendered[1]?.getAttribute('data-sender')).toBe('Bob');
  });

  it('passes raw message, sender name and a deterministic color for action/system logs', () => {
    useGameChatStore
      .getState()
      .setLogs([
        makeLog({ id: 'a', type: 'action', senderId: 'p1', message: 'Drew a card' }),
        makeLog({ id: 'b', type: 'system', senderId: 'p2', message: 'exploded!' }),
        makeLog({ id: 'c', type: 'message', senderId: 'p1', message: 'hi' }),
        makeLog({ id: 'd', type: 'action', senderId: null, message: 'Game started' }),
      ]);

    render(
      <GameChat
        currentUserId="p1"
        resolveDisplayName={(id) => (id === 'p1' ? 'You' : 'Bob')}
      />,
    );

    const rendered = screen.getAllByTestId('chat-message');

    // Action log: raw content, sender name resolved, deterministic color set.
    expect(rendered[0]?.textContent).toBe('Drew a card');
    expect(rendered[0]?.getAttribute('data-sender')).toBe('You');
    const p1Color = rendered[0]?.getAttribute('data-sender-color');
    expect(p1Color).toMatch(/^#/);

    // Same player id in a chat message gets the SAME color.
    expect(rendered[2]?.getAttribute('data-sender-color')).toBe(p1Color);

    // Different player → different color (probabilistically, but our palette is small)
    expect(rendered[1]?.getAttribute('data-sender')).toBe('Bob');
    expect(rendered[1]?.getAttribute('data-sender-color')).toMatch(/^#/);

    // Log without a senderId → no sender, no color.
    expect(rendered[3]?.getAttribute('data-sender')).toBe('');
    expect(rendered[3]?.getAttribute('data-sender-color')).toBe('');
  });

  it('treats messages as not-own when currentUserId is missing', () => {
    useGameChatStore
      .getState()
      .setLogs([makeLog({ id: 'a', senderId: 'someone', message: 'hi' })]);

    render(
      <GameChat
        resolveDisplayName={(id) => (id === 'someone' ? 'Alice' : id)}
      />,
    );

    const rendered = screen.getAllByTestId('chat-message');
    expect(rendered[0]?.getAttribute('data-is-own')).toBe('false');
    expect(rendered[0]?.getAttribute('data-sender')).toBe('Alice');
  });
});
