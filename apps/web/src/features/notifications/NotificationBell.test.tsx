import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import { useNotificationsStore } from './notifications.store';
import { useLiveStatsStore } from '@/features/live-stats';

const socketListeners = vi.hoisted(
  () => new Map<string, (payload: unknown) => void>(),
);

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: { accessToken: 'mock-token' },
  }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
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

  it('closes popover on outside click', async () => {
    await act(async () => {
      render(
        <div>
          <button data-testid="outside-button">Outside</button>
          <NotificationBell />
        </div>,
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-bell'));
    });
    expect(screen.getByTestId('notification-popover')).toBeDefined();

    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('outside-button'));
    });
    expect(screen.queryByTestId('notification-popover')).toBeNull();
  });

  it('closes popover on escape key', async () => {
    await act(async () => {
      render(<NotificationBell />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-bell'));
    });
    expect(screen.getByTestId('notification-popover')).toBeDefined();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByTestId('notification-popover')).toBeNull();
  });

  it('closes popover when live stats popover opens', async () => {
    await act(async () => {
      render(<NotificationBell />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-bell'));
    });
    expect(screen.getByTestId('notification-popover')).toBeDefined();

    await act(async () => {
      useLiveStatsStore.getState().setPopoverOpen(true);
    });
    expect(screen.queryByTestId('notification-popover')).toBeNull();
  });

  it('closes live stats popover when bell is opened', async () => {
    useLiveStatsStore.getState().setPopoverOpen(true);

    await act(async () => {
      render(<NotificationBell />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-bell'));
    });

    expect(screen.getByTestId('notification-popover')).toBeDefined();
    expect(useLiveStatsStore.getState().isPopoverOpen).toBe(false);
  });

  it('renders date in notification rows', async () => {
    const mockItem = {
      id: 'n-date',
      category: 'daily_reward_ready' as const,
      titleKey: 'Daily Bonus',
      bodyKey: 'Your reward is ready',
      i18nParams: {},
      url: '/rewards',
      data: {},
      read: false,
      createdAt: new Date().toISOString(),
    };
    const { notificationsApi } = await import('./notifications.api');
    vi.mocked(notificationsApi.listInbox).mockResolvedValueOnce([mockItem]);

    await act(async () => {
      render(<NotificationBell />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-bell'));
    });

    const dateEl = await screen.findByTestId('notification-date');
    expect(dateEl).toBeDefined();
    expect(dateEl.textContent?.length).toBeGreaterThan(0);
  });
});
