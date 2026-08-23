import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';
import { DEFAULT_VISION_MODE, type VisionMode } from '../lib/colorblind';

export function useVisionModeSetting() {
  const visionMode = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().visionMode ?? DEFAULT_VISION_MODE,
    () => DEFAULT_VISION_MODE,
  );

  const setVisionMode = useCallback((mode: VisionMode) => {
    saveStoredSettings({ visionMode: mode });
  }, []);

  return { visionMode, setVisionMode };
}

/**
 * Mirrors the persisted vision mode onto `<html data-vision-mode>` so plain
 * CSS (e.g. the high-contrast board outlines in tokens.scss) can react to it
 * without per-component plumbing.
 */
export function useVisionModeDocumentAttribute(visionMode: VisionMode) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-vision-mode', visionMode);
  }, [visionMode]);
}
