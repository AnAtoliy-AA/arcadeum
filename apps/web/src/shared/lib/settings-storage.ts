export const SETTINGS_STORAGE_KEY = 'aicoapp_web_settings_v1' as const;

export type StoredSettings = {
  themePreference?: string;
  language?: string;
  hapticsEnabled?: boolean;
};

const listeners = new Set<() => void>();

export function subscribeToSettings(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function loadStoredSettings(): StoredSettings {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    const settings: StoredSettings = {};

    if (parsed.themePreference && typeof parsed.themePreference === 'string') {
      settings.themePreference = parsed.themePreference;
    }

    if (parsed.language && typeof parsed.language === 'string') {
      settings.language = parsed.language;
    }

    if (typeof parsed.hapticsEnabled === 'boolean') {
      settings.hapticsEnabled = parsed.hapticsEnabled;
    }

    return settings;
  } catch {
    return {};
  }
}

export function saveStoredSettings(update: Partial<StoredSettings>) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = loadStoredSettings();
    const next = { ...current, ...update } satisfies StoredSettings;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((l) => l());
  } catch {
    // ignore persistence errors
  }
}
