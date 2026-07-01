'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useSocket, emitEncrypted, gameSocket } from '@/shared/lib/socket';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useGameChatStore } from '@/widgets/GameChat/store/gameChatStore';
import { EMOTES, type EmoteId } from '@/widgets/GameChat/ui/EmotePicker';

const BUBBLE_DURATION_MS = 3000;
const RATE_LIMIT_MS = 2000;

interface ActiveEmote {
  key: string;
  userId: string;
  emoteId: EmoteId;
}

interface UseEmotesReturn {
  activeEmotes: ActiveEmote[];
  sendEmote: (emoteId: EmoteId) => void;
}

function findEmoji(emoteId: EmoteId): string {
  return EMOTES.find((e) => e.id === emoteId)?.emoji ?? '❓';
}

export function useEmotes(): UseEmotesReturn {
  const [activeEmotes, setActiveEmotes] = useState<ActiveEmote[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const lastSentRef = useRef(0);

  const roomId = useGameStore((s: GameState) => s.room?.id);
  const { snapshot } = useSessionTokens();
  const userId = snapshot.userId;

  useSocket(
    'games.session.emote',
    useCallback((data: unknown) => {
      const d = data as { userId?: string; emoteId?: EmoteId; ts?: number };
      if (!d?.userId || !d?.emoteId) return;

      const entryKey = `${d.userId}-${d.ts ?? Date.now()}`;

      setActiveEmotes((prev) => [
        ...prev.filter((e) => e.userId !== d.userId),
        { key: entryKey, userId: d.userId!, emoteId: d.emoteId! },
      ]);

      const existing = timersRef.current.get(d.userId);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        setActiveEmotes((prev) => prev.filter((e) => e.userId !== d.userId));
        timersRef.current.delete(d.userId!);
      }, BUBBLE_DURATION_MS);

      timersRef.current.set(d.userId, timer);

      // Add emote to chat log
      const addLog = useGameChatStore.getState().addLog;
      if (addLog) {
        addLog({
          id: `emote-${d.userId}-${d.ts ?? Date.now()}`,
          type: 'action',
          kind: 'system',
          message: `${findEmoji(d.emoteId)} ${d.emoteId.replace(/_/g, ' ')}`,
          createdAt: new Date(d.ts ?? Date.now()).toISOString(),
          senderId: d.userId,
        });
      }
    }, []),
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const sendEmote = useCallback(
    (emoteId: EmoteId) => {
      if (!roomId || !userId) return;

      const now = Date.now();
      if (now - lastSentRef.current < RATE_LIMIT_MS) return;
      lastSentRef.current = now;

      emitEncrypted(gameSocket, 'games.session.emote', {
        roomId,
        userId,
        emoteId,
      });
    },
    [roomId, userId],
  );

  return { activeEmotes, sendEmote };
}
