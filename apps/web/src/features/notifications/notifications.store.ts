'use client';

import { create } from 'zustand';
import { notificationsApi } from './notifications.api';
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type NotificationDto,
  type NotificationPreferences,
} from './notifications.types';

export type PermissionState = 'default' | 'granted' | 'denied';

type State = {
  initialized: boolean;
  permission: PermissionState;
  subscribed: boolean;
  unreadCount: number;
  items: NotificationDto[];
  prefs: NotificationPreferences;
  loading: boolean;
  error: string | null;
};

type Actions = {
  initialize(token: string): Promise<void>;
  fetchUnreadCount(token: string): Promise<void>;
  setPermission(permission: PermissionState): void;
  enableCategory(category: NotificationCategory, token: string): Promise<void>;
  disableCategory(category: NotificationCategory, token: string): Promise<void>;
  loadInbox(token: string): Promise<void>;
  markAllRead(token: string): Promise<void>;
  markRead(id: string, token: string): Promise<void>;
  onSocketEvent(event: 'notification:new', payload: NotificationDto): void;
  onSocketUnreadCount(count: number): void;
  resetForLogout(): void;
};

const defaultPrefs: NotificationPreferences = NOTIFICATION_CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c]: false }),
  {} as NotificationPreferences,
);

function readBrowserPermission(): PermissionState {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'default';
  }
  return Notification.permission as PermissionState;
}

export const useNotificationsStore = create<State & Actions>((set, get) => ({
  initialized: false,
  permission: readBrowserPermission(),
  subscribed: false,
  unreadCount: 0,
  items: [],
  prefs: { ...defaultPrefs },
  loading: false,
  error: null,

  async initialize(token: string) {
    if (get().initialized) return;
    set({ loading: true, error: null });
    try {
      const [prefs, unread] = await Promise.all([
        notificationsApi.getPreferences(token),
        notificationsApi.unreadCount(token),
      ]);
      set({
        initialized: true,
        prefs: { ...defaultPrefs, ...prefs },
        unreadCount: unread.count,
        permission: readBrowserPermission(),
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },

  async fetchUnreadCount(token: string) {
    try {
      const { count } = await notificationsApi.unreadCount(token);
      set({ unreadCount: count });
    } catch {
      // Silently ignore — badge will show 0 until bell is opened
    }
  },

  setPermission(permission) {
    set({ permission });
  },

  async enableCategory(category, token) {
    const permission = await ensurePermission();
    set({ permission });
    if (permission !== 'granted') {
      // Don't mark prefs enabled if the user didn't grant permission.
      set({ error: 'browser-permission-required' });
      return;
    }
    const subscribed = await ensureSubscription(token);
    if (!subscribed) {
      set({ error: 'subscribe-failed' });
      return;
    }
    set({ subscribed: true, error: null });
    const next = await notificationsApi.updatePreferences(
      { [category]: true },
      token,
    );
    set({ prefs: { ...defaultPrefs, ...next } });
  },

  async disableCategory(category, token) {
    const next = await notificationsApi.updatePreferences(
      { [category]: false },
      token,
    );
    set({ prefs: { ...defaultPrefs, ...next } });
  },

  async loadInbox(token) {
    const items = await notificationsApi.listInbox(token, { limit: 20 });
    set({ items });
  },

  async markAllRead(token) {
    await notificationsApi.markRead({ all: true }, token);
    set((state) => ({
      unreadCount: 0,
      items: state.items.map((i) => ({ ...i, read: true })),
    }));
  },

  async markRead(id, token) {
    await notificationsApi.markRead({ ids: [id] }, token);
    set((state) => {
      const wasUnread = state.items.find((i) => i.id === id && !i.read);
      return {
        items: state.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    });
  },

  onSocketEvent(event, payload) {
    if (event === 'notification:new') {
      set((state) => ({
        items: [payload, ...state.items].slice(0, 50),
        unreadCount: state.unreadCount + (payload.read ? 0 : 1),
      }));
    }
  },

  onSocketUnreadCount(count) {
    set({ unreadCount: count });
  },

  resetForLogout() {
    set({
      initialized: false,
      subscribed: false,
      unreadCount: 0,
      items: [],
      prefs: { ...defaultPrefs },
      error: null,
    });
  },
}));

// ---- Browser-side helpers ----

async function ensurePermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'denied';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result as PermissionState;
}

async function ensureSubscription(token: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  if (typeof PushManager === 'undefined') return false;

  try {
    const reg =
      (await navigator.serviceWorker.getRegistration('/')) ??
      (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const { publicKey } = await notificationsApi.getVapidPublicKey(token);
      if (!publicKey) return false;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
          .buffer as ArrayBuffer,
      });
    }

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

    await notificationsApi.addSubscription(
      {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        userAgent: navigator.userAgent,
      },
      token,
    );
    return true;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Std = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Std);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}
