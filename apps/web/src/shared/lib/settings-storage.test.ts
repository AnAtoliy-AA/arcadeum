import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
  SETTINGS_STORAGE_KEY,
} from './settings-storage';

describe('settings-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads empty settings if nothing is stored', () => {
    expect(loadStoredSettings()).toEqual({});
  });

  it('saves and loads settings', () => {
    saveStoredSettings({ hapticsEnabled: true, language: 'en' });
    expect(loadStoredSettings()).toEqual({
      hapticsEnabled: true,
      language: 'en',
    });

    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual({ hapticsEnabled: true, language: 'en' });
  });

  it('notifies subscribers on change', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToSettings(callback);

    saveStoredSettings({ themePreference: 'dark' });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    saveStoredSettings({ themePreference: 'light' });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles malformed JSON', () => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, 'invalid');
    expect(loadStoredSettings()).toEqual({});
  });
});
