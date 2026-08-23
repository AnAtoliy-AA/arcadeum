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

  it('saves and loads the music last-played index', () => {
    saveStoredSettings({ musicLastPlayedIndex: 4 });
    expect(loadStoredSettings().musicLastPlayedIndex).toBe(4);

    saveStoredSettings({ musicLastPlayedIndex: 0 });
    expect(loadStoredSettings().musicLastPlayedIndex).toBe(0);
  });

  it('saves and loads the show-rules-on-room-entry setting', () => {
    saveStoredSettings({ showRulesOnRoomEntry: false });
    expect(loadStoredSettings().showRulesOnRoomEntry).toBe(false);

    saveStoredSettings({ showRulesOnRoomEntry: true });
    expect(loadStoredSettings().showRulesOnRoomEntry).toBe(true);
  });

  it.each(['easy', 'medium', 'hard', 'expert'])(
    'saves and loads the %s AI difficulty',
    (d) => {
      saveStoredSettings({
        aiDifficulty: d as 'easy' | 'medium' | 'hard' | 'expert',
      });
      expect(loadStoredSettings().aiDifficulty).toBe(d);
    },
  );

  it('ignores an invalid stored AI difficulty', () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ aiDifficulty: 'impossible' }),
    );
    expect(loadStoredSettings().aiDifficulty).toBeUndefined();
  });

  it.each(['none', 'deuteranopia', 'protanopia', 'tritanopia', 'highContrast'])(
    'saves and loads the %s vision mode',
    (mode) => {
      saveStoredSettings({
        visionMode: mode as
          | 'none'
          | 'deuteranopia'
          | 'protanopia'
          | 'tritanopia'
          | 'highContrast',
      });
      expect(loadStoredSettings().visionMode).toBe(mode);
    },
  );

  it('ignores an invalid stored vision mode', () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ visionMode: 'grayscale' }),
    );
    expect(loadStoredSettings().visionMode).toBeUndefined();
  });
});
