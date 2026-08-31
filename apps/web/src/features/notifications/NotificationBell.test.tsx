import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import { useNotificationsStore } from './notifications.store';

const socketListeners = new Map<string, (payload: unknown) => void>();

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { accessToken: 'mock-token' },
  }),
}));

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}));

vi.mock('@/shared/lib/socket', () => ({
  useNotificationSocket: (
    event: string,
    handler: (payload: unknown) => void,
  ) => {
    socketListeners.set(event, handler);
  },
}));

vi.mock('./notifications.api', () => ({
  notificationsApi: {
    getPreferences: vi.fn().mockResolvedValue({}),
    unreadCount: vi.fn().mockResolvedValue({ count: 0 }),
    listInbox: vi.fn().mockResolvedValue([]),
    markRead: vi.fn().mockResolvedValue(undefined),
    updatePreferences: vi.fn().mockResolvedValue({}),
  },
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    socketListeners.clear();
    useNotificationsStore.setState({
      initialized: false,
      unreadCount: 0,
      items: [],
      error: null,
    });
  });

  it('renders bell and updates unread badge via socket events', async () => {
    await act(async () => {
      render(<NotificationBell />);
    });

    expect(screen.getByTestId('notification-bell')).toBeDefined();
    expect(screen.queryByTestId('notification-bell-badge')).toBeNull();

    const countListener = socketListeners.get('notification:unread-count');
    expect(countListener).toBeDefined();

    await act(async () => {
      countListener?.({ count: 3 });
    });

    const badge = screen.getByTestId('notification-bell-badge');
    expect(badge.textContent).toContain('3');
  });

  it('receives notification:new socket event and increments unread', async () => {
    await act(async () => {
      render(<NotificationBell />);
    });

    const newNotificationListener = socketListeners.get('notification:new');
    expect(newNotificationListener).toBeDefined();

    await act(async () => {
      newNotificationListener?.({
        id: 'n-1',
        category: 'marketing',
        titleKey: 'test.title',
        bodyKey: 'test.body',
        i18nParams: {},
        url: '/games',
        data: {},
        read: false,
        createdAt: '2026-08-31T00:00:00.000Z',
      });
    });

    const badge = screen.getByTestId('notification-bell-badge');
    expect(badge.textContent).toContain('1');
  });

  it('opens popover on click', async () => {
    await act(async () => {
      render(<NotificationBell />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-bell'));
    });

    expect(screen.getByTestId('notification-popover')).toBeDefined();
  });
});
