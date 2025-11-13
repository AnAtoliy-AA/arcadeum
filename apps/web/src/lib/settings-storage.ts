export const SETTINGS_STORAGE_KEY = "aicoapp_web_settings_v1" as const;

export type StoredSettings = {
  themePreference?: string;
  language?: string;
};

export function loadStoredSettings(): StoredSettings {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    const settings: StoredSettings = {};

    if (parsed.themePreference && typeof parsed.themePreference === "string") {
      settings.themePreference = parsed.themePreference;
    }

    if (parsed.language && typeof parsed.language === "string") {
      settings.language = parsed.language;
    }

    return settings;
  } catch {
    return {};
  }
}

export function saveStoredSettings(update: Partial<StoredSettings>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = loadStoredSettings();
    const next = { ...current, ...update } satisfies StoredSettings;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors
  }
}
