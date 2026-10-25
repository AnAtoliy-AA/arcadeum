import { useEffect } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useClansStore } from '../store/clansStore';
import { useClanSocket } from './useClanSocket';
import type { ClanWar, Clan } from '../model/types';

interface UseActiveClanWarMatchReturn {
  activeWar: ClanWar | null;
  isClanWarMatch: boolean;
  myClan: Clan | null;
}

export function useActiveClanWarMatch(
  opponentUserId?: string,
  gameId?: string,
): UseActiveClanWarMatchReturn {
  useClanSocket();

  const { snapshot } = useSessionTokens();
  const myClan = useClansStore((s) => s.myClan);
  const activeMatchWar = useClansStore((s) => s.activeMatchWar);
  const fetchActiveMatchWar = useClansStore((s) => s.fetchActiveMatchWar);
  const setActiveMatchWar = useClansStore((s) => s.setActiveMatchWar);

  useEffect(() => {
    if (
      !opponentUserId ||
      !snapshot.userId ||
      opponentUserId === snapshot.userId ||
      !snapshot.accessToken ||
      snapshot.userId.startsWith('anon_') ||
      opponentUserId.startsWith('anon_') ||
      opponentUserId.startsWith('bot-')
    ) {
      setActiveMatchWar(null);
      return;
    }

    let isMounted = true;
    fetchActiveMatchWar(
      snapshot.userId,
      opponentUserId,
      gameId,
      snapshot.accessToken ?? undefined,
    ).then((war) => {
      if (!isMounted) return;
      if (!war) {
        setActiveMatchWar(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    opponentUserId,
    gameId,
    snapshot.userId,
    snapshot.accessToken,
    fetchActiveMatchWar,
    setActiveMatchWar,
  ]);

  return {
    activeWar: activeMatchWar,
    isClanWarMatch: !!activeMatchWar && activeMatchWar.status === 'active',
    myClan,
  };
}
