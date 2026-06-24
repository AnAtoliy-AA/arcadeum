import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationsStore } from './notifications.store';
import { notificationsApi } from './notifications.api';

vi.mock('./notifications.api', () => ({
  notificationsApi: {
    getPreferences: vi.fn(),
    unreadCount: vi.fn(),
    updatePreferences: vi.fn(),
    listInbox: vi.fn(),
    markRead: vi.fn(),
    getVapidPublicKey: vi.fn(),
    addSubscription: vi.fn(),
    removeSubscription: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  useNotificationsStore.getState().resetForLogout();
});

describe('notifications store', () => {
  it('has all-false default prefs and zero unread', () => {
    const s = useNotificationsStore.getState();
    expect(s.unreadCount).toBe(0);
    expect(s.prefs.daily_reward_ready).toBe(false);
    expect(s.prefs.announcement_new).toBe(false);
    expect(s.items).toEqual([]);
  });

  it('initialize loads prefs + unread count', async () => {
    vi.mocked(notificationsApi.getPreferences).mockResolvedValue({
      daily_reward_ready: true,
      tournament_starting_soon: false,
      tournament_registration_opened: false,
      announcement_new: false,
    });
    vi.mocked(notificationsApi.unreadCount).mockResolvedValue({ count: 4 });

    await useNotificationsStore.getState().initialize('t');
    const s = useNotificationsStore.getState();
    expect(s.initialized).toBe(true);
    expect(s.prefs.daily_reward_ready).toBe(true);
    expect(s.unreadCount).toBe(4);
  });

  it('onSocketEvent notification:new prepends and bumps unread', () => {
    const item = {
      id: 'n1',
      category: 'announcement_new' as const,
      titleKey: 't',
      bodyKey: 'b',
      i18nParams: {},
      url: '/x',
      data: {},
      read: false,
      createdAt: '2026-05-24T10:00:00Z',
    };
    useNotificationsStore.getState().onSocketEvent('notification:new', item);
    const s = useNotificationsStore.getState();
    expect(s.items[0].id).toBe('n1');
    expect(s.unreadCount).toBe(1);
  });

  it('onSocketUnreadCount overrides count', () => {
    useNotificationsStore.getState().onSocketUnreadCount(7);
    expect(useNotificationsStore.getState().unreadCount).toBe(7);
  });

  it('markAllRead clears unread + marks items read', async () => {
    vi.mocked(notificationsApi.markRead).mockResolvedValue(undefined);
    useNotificationsStore.setState({
      items: [
        {
          id: 'n1',
          category: 'announcement_new',
          titleKey: 't',
          bodyKey: 'b',
          i18nParams: {},
          url: '/x',
          data: {},
          read: false,
          createdAt: '2026-05-24T10:00:00Z',
        },
      ],
      unreadCount: 5,
    });
    await useNotificationsStore.getState().markAllRead('t');
    const s = useNotificationsStore.getState();
    expect(s.unreadCount).toBe(0);
    expect(s.items[0].read).toBe(true);
  });

  it('markRead by id decrements unread only when item was unread', async () => {
    vi.mocked(notificationsApi.markRead).mockResolvedValue(undefined);
    useNotificationsStore.setState({
      items: [
        {
          id: 'n1',
          category: 'announcement_new',
          titleKey: 't',
          bodyKey: 'b',
          i18nParams: {},
          url: '/x',
          data: {},
          read: false,
          createdAt: '2026-05-24T10:00:00Z',
        },
      ],
      unreadCount: 1,
    });
    await useNotificationsStore.getState().markRead('n1', 't');
    expect(useNotificationsStore.getState().unreadCount).toBe(0);
    // Idempotent: marking the same again should not go below 0
    await useNotificationsStore.getState().markRead('n1', 't');
    expect(useNotificationsStore.getState().unreadCount).toBe(0);
  });

  it('disableCategory updates prefs without touching the browser', async () => {
    vi.mocked(notificationsApi.updatePreferences).mockResolvedValue({
      daily_reward_ready: false,
      tournament_starting_soon: false,
      tournament_registration_opened: false,
      announcement_new: false,
    });
    await useNotificationsStore
      .getState()
      .disableCategory('daily_reward_ready', 't');
    expect(useNotificationsStore.getState().prefs.daily_reward_ready).toBe(
      false,
    );
    expect(notificationsApi.updatePreferences).toHaveBeenCalledWith(
      { daily_reward_ready: false },
      't',
    );
  });

  it('resetForLogout zeroes everything', () => {
    useNotificationsStore.setState({
      unreadCount: 5,
      items: [
        {
          id: 'n1',
          category: 'announcement_new',
          titleKey: 't',
          bodyKey: 'b',
          i18nParams: {},
          url: '/x',
          data: {},
          read: false,
          createdAt: '',
        },
      ],
      initialized: true,
    });
    useNotificationsStore.getState().resetForLogout();
    const s = useNotificationsStore.getState();
    expect(s.unreadCount).toBe(0);
    expect(s.items).toEqual([]);
    expect(s.initialized).toBe(false);
  });
});
