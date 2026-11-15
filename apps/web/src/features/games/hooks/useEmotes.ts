'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useSocket, emitEncrypted, gameSocket } from '@/shared/lib/socket';
import { useGameStore, type GameState } from '@/features/games/store/gameStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useGameChatStore } from '@/widgets/GameChat/store/gameChatStore';
import { EMOTES, type EmoteId } from '@/widgets/GameChat/ui/EmotePicker';

const BUBBLE_DURATION_MS = 2800;
const RATE_LIMIT_MS = 1000;
const MAX_CONCURRENT_EMOTES = 12;

export interface ActiveEmote {
  key: string;
  userId: string;
  emoteId: EmoteId;
  laneIndex: number;
  ts: number;
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
  const nextLaneRef = useRef(0);
  const lastSentRef = useRef(0);

  const roomId = useGameStore((s: GameState) => s.room?.id);
  const { snapshot } = useSessionTokens();
  const userId = snapshot.userId;

  useSocket(
    'games.session.emote',
    useCallback((data: unknown) => {
      const d = data as { userId?: string; emoteId?: EmoteId; ts?: number };
      if (!d?.userId || !d?.emoteId) return;

      const lane = nextLaneRef.current % 6;
      nextLaneRef.current = (nextLaneRef.current + 1) % 6;
      const ts = d.ts ?? Date.now();
      const entryKey = `${d.userId}-${ts}-${Math.random().toString(36).slice(2, 7)}`;

      setActiveEmotes((prev) => {
        const nextList = [
          ...prev,
          {
            key: entryKey,
            userId: d.userId!,
            emoteId: d.emoteId!,
            laneIndex: lane,
            ts,
          },
        ];
        return nextList.slice(-MAX_CONCURRENT_EMOTES);
      });

      const timer = setTimeout(() => {
        setActiveEmotes((prev) => prev.filter((e) => e.key !== entryKey));
        timersRef.current.delete(entryKey);
      }, BUBBLE_DURATION_MS);

      timersRef.current.set(entryKey, timer);
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

      const sendMessage = useGameChatStore.getState().sendMessage;
      if (sendMessage) {
        sendMessage(
          `${findEmoji(emoteId)} ${emoteId.replace(/_/g, ' ')}`,
          'all',
        );
      }
    },
    [roomId, userId],
  );

  return { activeEmotes, sendEmote };
}
