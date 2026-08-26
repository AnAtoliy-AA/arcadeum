import { useEffect } from 'react';
import { maybeDecrypt, isSocketEncryptionEnabled } from './socket-encryption';
import {
  getChatsSocket,
  getFriendsSock,
  getGamesSocket,
  getLeaderboardsSocket,
} from './socket';

type SocketEventHandler = (payload: unknown) => void;

export function useSocket(event: string, handler: SocketEventHandler): void {
  useEffect(() => {
    const listener = async (payload: unknown) => {
      if (isSocketEncryptionEnabled()) {
        const decrypted = await maybeDecrypt(payload);
        handler(decrypted);
        return;
      }
      handler(payload);
    };

    const s = getGamesSocket();
    s.on(event, listener);

    return () => {
      s.off(event, listener);
    };
  }, [event, handler]);
}

export function useChatSocket(
  event: string,
  handler: SocketEventHandler,
): void {
  useEffect(() => {
    const listener = async (payload: unknown) => {
      if (isSocketEncryptionEnabled()) {
        const decrypted = await maybeDecrypt(payload);
        handler(decrypted);
        return;
      }
      handler(payload);
    };

    const s = getChatsSocket();
    s.on(event, listener);

    return () => {
      s.off(event, listener);
    };
  }, [event, handler]);
}

export function useLeaderboardSocket(
  event: string,
  handler: SocketEventHandler,
): void {
  useEffect(() => {
    const s = getLeaderboardsSocket();
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
  }, [event, handler]);
}

export function useFriendsSocket(
  event: string,
  handler: SocketEventHandler,
): void {
  useEffect(() => {
    const s = getFriendsSock();
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
  }, [event, handler]);
}
