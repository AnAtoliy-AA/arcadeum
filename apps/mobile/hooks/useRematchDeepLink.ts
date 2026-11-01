import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export interface RematchDeepLinkPayload {
  roomId: string;
  isRematchAccepted: boolean;
}

export function parseRematchDeepLink(
  url: string | null | undefined,
): RematchDeepLinkPayload | null {
  if (!url) return null;
  try {
    let roomId: string | undefined;

    const queryMatch = url.match(/[?&]roomId=([^&#]+)/);
    if (queryMatch) {
      roomId = decodeURIComponent(queryMatch[1]);
    }

    if (!roomId) {
      const pathMatch =
        url.match(/(?:games\/)?rooms\/([^/?#]+)/) ||
        url.match(/rematch\/([^/?#]+)/);
      if (pathMatch) {
        roomId = decodeURIComponent(pathMatch[1]);
      }
    }

    if (!roomId) return null;

    const isRematchAccepted =
      url.includes('rematch_accepted') ||
      url.includes('action=rematch_accepted') ||
      url.includes('type=rematch_accepted') ||
      url.includes('/rematch') ||
      url.includes('://rematch');

    return {
      roomId,
      isRematchAccepted,
    };
  } catch {
    return null;
  }
}

export function useRematchDeepLink(
  onRematchAccepted?: (payload: RematchDeepLinkPayload) => void,
): void {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (url: string | null | undefined) => {
      const payload = parseRematchDeepLink(url);
      if (payload?.roomId) {
        if (payload.isRematchAccepted && Platform.OS !== 'web') {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => {});
        }
        router.push({
          pathname: '/games/rooms/[id]',
          params: { id: payload.roomId },
        });
        onRematchAccepted?.(payload);
      }
    };

    void Linking.getInitialURL().then(handleUrl);

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router, onRematchAccepted]);
}
