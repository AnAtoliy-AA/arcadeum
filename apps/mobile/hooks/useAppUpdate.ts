import { useCallback, useEffect, useState } from 'react';
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

interface AppUpdateState {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string | null;
  isLoading: boolean;
}

/**
 * Compare two semantic version strings.
 * Returns true if latestVersion is greater than currentVersion.
 */
function isNewerVersion(
  currentVersion: string,
  latestVersion: string,
): boolean {
  const current = currentVersion.split('.').map(Number);
  const latest = latestVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(current.length, latest.length); i++) {
    const c = current[i] || 0;
    const l = latest[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

/**
 * Hook to check if an app update is available.
 * Uses EXPO_PUBLIC_LATEST_VERSION env var to determine the latest version.
 */
export function useAppUpdate() {
  const [state, setState] = useState<AppUpdateState>({
    isUpdateAvailable: false,
    currentVersion: Application.nativeApplicationVersion || '1.0.0',
    latestVersion: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkForUpdate = () => {
      const latestVersion = process.env.EXPO_PUBLIC_LATEST_VERSION;
      const currentVersion = Application.nativeApplicationVersion || '1.0.0';

      if (latestVersion && isNewerVersion(currentVersion, latestVersion)) {
        setState({
          isUpdateAvailable: true,
          currentVersion,
          latestVersion,
          isLoading: false,
        });
      } else {
        setState({
          isUpdateAvailable: false,
          currentVersion,
          latestVersion: latestVersion || null,
          isLoading: false,
        });
      }
    };

    checkForUpdate();
  }, []);

  const openUpdateLink = useCallback(() => {
    const extra = Constants.expoConfig?.extra;
    const androidDownloadUrl = extra?.downloadLinks?.android;

    // Try the configured download URL first, then fall back to Play Store
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${Application.applicationId}`;
    const url = androidDownloadUrl || playStoreUrl;

    Linking.openURL(url).catch((err) => {
      console.error('Failed to open update URL:', err);
    });
  }, []);

  return {
    ...state,
    openUpdateLink,
  };
}
