'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gameFactory } from '@/features/games/lib/gameFactory';
import type { BaseGameWidgetProps } from '@/features/games/types/base';
import type { GameRoomSummary } from '@/shared/types/games';
import { setOfflineGameRouter } from '@/shared/lib/socket';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  handleOfflineGameEvent,
  attachSession,
  disposeSession,
} from '@/features/offline/lib/offline-dispatcher';
import { OFFLINE_GAMES } from '@/features/offline/lib/offline-registry';
import { OfflineSession } from '@/features/offline/lib/offline-session';
import { createOfflineRoomId } from '@/features/offline/lib/offline-room';

interface OfflineGameViewProps {
  slug: string;
}

/** Reverse lookup: route slug → engine id (e.g. 'chess' → 'chess_v1'). */
function engineIdForSlug(slug: string): string | null {
  for (const [engineId, entry] of Object.entries(OFFLINE_GAMES)) {
    if (entry.slug === slug) return engineId;
  }
  // Tolerate 'tic_tac_toe' style slugs.
  const dashed = slug.replaceAll('_', '-');
  for (const [engineId, entry] of Object.entries(OFFLINE_GAMES)) {
    if (entry.slug === dashed) return engineId;
  }
  return null;
}

type WidgetComponent = React.ComponentType<BaseGameWidgetProps>;

export default function OfflineGameView({ slug }: OfflineGameViewProps) {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const userId = snapshot.userId ?? null;
  const engineId = useMemo(() => engineIdForSlug(slug), [slug]);
  const roomId = useMemo(() => createOfflineRoomId(slug), [slug]);
  const [widget, setWidget] = useState<WidgetComponent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Lazily create + auto-start the local session (render-time external init;
  // bot progress is streamed through the offline bus, not component state).
  const [session, setSession] = useState<OfflineSession | null>(null);
  useEffect(() => {
    if (!engineId || !userId) return;
    let cancelled = false;
    const entry = OFFLINE_GAMES[engineId];
    const difficulty = loadDifficulty();
    entry.createEngine().then((engine) => {
      if (cancelled) return;
      const s = new OfflineSession({
        roomId,
        engineId,
        engine,
        humanId: userId,
      });
      attachSession(s);
      s.start([userId, 'bot-1'], {
        options: { aiDifficulty: difficulty },
        aiDifficulty: difficulty,
      });
      setSession(s);
    });
    return () => {
      cancelled = true;
    };
  }, [engineId, roomId, userId]);

  useEffect(() => {
    setOfflineGameRouter(handleOfflineGameEvent);
    return () => {
      setOfflineGameRouter(null);
      disposeSession(roomId);
    };
  }, [roomId]);

  useEffect(() => {
    if (!engineId) return;
    let cancelled = false;
    gameFactory
      .loadGame(engineId as Parameters<typeof gameFactory.loadGame>[0])
      .then((mod) => {
        const Comp = mod as unknown as WidgetComponent;
        if (!cancelled) setWidget(() => Comp);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [engineId]);

  const props = useMemo<BaseGameWidgetProps | null>(() => {
    if (!userId || !session) return null;
    const room: GameRoomSummary = {
      id: roomId,
      gameId: slug,
      name: t('pwa.offlineGame.title'),
      hostId: userId,
      visibility: 'private',
      playerCount: 2,
      maxPlayers: null,
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      members: [
        { id: userId, displayName: 'You', isHost: true },
        { id: 'bot-1', displayName: 'Bot', isHost: false },
      ],
    };
    return {
      roomId,
      room,
      session: session.toSummary(),
      currentUserId: userId,
      isHost: true,
      accessToken: null,
      showRulesOpen: false,
      onShowRulesClose: () => undefined,
      isFullscreen: false,
      toggleFullscreen: () => undefined,
    };
  }, [roomId, session, slug, userId, t]);

  if (!engineId || loadFailed) {
    return (
      <OfflineNotice
        message={t('pwa.offlineGame.unsupported')}
        linkLabel={t('pwa.offlineGame.backToGames')}
      />
    );
  }
  if (!props || !widget) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--textSecondary)]">
        …
      </div>
    );
  }
  const Widget = widget;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <Widget
        roomId={props.roomId}
        room={props.room}
        session={props.session}
        currentUserId={props.currentUserId}
        isHost={props.isHost}
        accessToken={props.accessToken}
        showRulesOpen={props.showRulesOpen}
        onShowRulesClose={props.onShowRulesClose}
        isFullscreen={props.isFullscreen}
        toggleFullscreen={props.toggleFullscreen}
      />
    </div>
  );
}

function OfflineNotice({
  message,
  linkLabel,
}: {
  message: string;
  linkLabel: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-lg font-semibold text-[var(--textPrimary)]">
        {message}
      </p>
      <a
        className="text-sm text-[var(--primary)] underline-offset-4 hover:underline"
        href="../games"
      >
        {linkLabel}
      </a>
    </div>
  );
}

function loadDifficulty(): 'easy' | 'medium' | 'hard' | 'expert' {
  try {
    const raw = localStorage.getItem('aicoapp_web_settings_v1');
    if (!raw) return 'medium';
    const parsed = JSON.parse(raw) as { aiDifficulty?: string };
    if (
      parsed.aiDifficulty === 'easy' ||
      parsed.aiDifficulty === 'medium' ||
      parsed.aiDifficulty === 'hard' ||
      parsed.aiDifficulty === 'expert'
    ) {
      return parsed.aiDifficulty;
    }
  } catch {
    /* fall through to default */
  }
  return 'medium';
}
