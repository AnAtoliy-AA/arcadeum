import { useMemo } from 'react';
import type { GameSessionSummary } from '../../../api/gamesApi';
import type {
  ExplodingCatsSnapshot,
  ProcessedPlayer,
  SessionPlayerProfile,
} from '../types';
import { TABLE_DIAMETER, PLAYER_SEAT_SIZE } from '../constants';

export function useGameState(
  session: GameSessionSummary | null,
  currentUserId: string | null,
) {
  const snapshot = useMemo<ExplodingCatsSnapshot | null>(() => {
    const raw = session?.state;
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return raw as ExplodingCatsSnapshot;
  }, [session]);

  const players = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    const rawPlayers = Array.isArray((session as any)?.state?.players)
      ? ((session as any).state.players as SessionPlayerProfile[])
      : [];
    const lookup = new Map(rawPlayers.map((player) => [player.id, player]));

    return snapshot.playerOrder.map((playerId, index) => {
      const base = snapshot.players.find(
        (player) => player.playerId === playerId,
      );
      const userProfile = lookup.get(playerId);
      return {
        playerId,
        displayName: userProfile?.username || userProfile?.email || playerId,
        hand: base?.hand ?? [],
        alive: base?.alive ?? false,
        isCurrentTurn: index === snapshot.currentTurnIndex,
        handSize: base?.hand?.length ?? 0,
        isSelf: currentUserId ? playerId === currentUserId : false,
        orderIndex: index,
      };
    });
  }, [snapshot, currentUserId, session]);

  const otherPlayers = useMemo(
    () => players.filter((player) => !player.isSelf),
    [players],
  );

  const selfPlayer = useMemo(
    () => players.find((player) => player.isSelf) ?? null,
    [players],
  );

  const playerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    players.forEach((player) => {
      map.set(player.playerId, player.displayName);
    });
    return map;
  }, [players]);

  const tableSeats = useMemo(() => {
    if (!otherPlayers.length) {
      return [];
    }

    const total = otherPlayers.length;
    const center = TABLE_DIAMETER / 2;
    const radius = Math.max(center + PLAYER_SEAT_SIZE / 2 - 12, 0);

    return otherPlayers.map((player, index) => {
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      const left = Math.round(
        center + radius * Math.cos(angle) - PLAYER_SEAT_SIZE / 2,
      );
      const top = Math.round(
        center + radius * Math.sin(angle) - PLAYER_SEAT_SIZE / 2,
      );

      return {
        player,
        position: {
          left,
          top,
        },
      };
    });
  }, [otherPlayers]);

  const deckCount = snapshot?.deck?.length ?? 0;
  const discardTop =
    snapshot?.discardPile?.[snapshot.discardPile.length - 1] ?? null;
  const pendingDraws = snapshot?.pendingDraws ?? 0;
  const currentTurnPlayerId =
    snapshot?.playerOrder?.[snapshot.currentTurnIndex] ?? null;
  const isMyTurn = Boolean(
    currentUserId && currentTurnPlayerId === currentUserId,
  );

  return {
    snapshot,
    players,
    otherPlayers,
    selfPlayer,
    playerNameMap,
    tableSeats,
    deckCount,
    discardTop,
    pendingDraws,
    currentTurnPlayerId,
    isMyTurn,
  };
}
