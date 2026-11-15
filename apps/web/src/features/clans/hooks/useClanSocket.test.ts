import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClanSocket } from './useClanSocket';
import { useClansStore } from '../store/clansStore';
import type { ClanWar } from '../model/types';

const registeredHandlers: Record<string, (payload: unknown) => void> = {};

vi.mock('@/shared/lib/socket', () => ({
  useClansSocket: vi.fn(
    (event: string, handler: (payload: unknown) => void) => {
      registeredHandlers[event] = handler;
    },
  ),
  useFriendsSocket: vi.fn(
    (event: string, handler: (payload: unknown) => void) => {
      registeredHandlers[`friends:${event}`] = handler;
    },
  ),
  getClansSocketRef: vi.fn(() => ({
    emit: vi.fn(),
  })),
}));

describe('useClanSocket', () => {
  beforeEach(() => {
    useClansStore.setState({
      myClan: {
        id: 'clan-abc',
        name: 'Alpha Clan',
        tag: 'ALP',
        description: 'Alpha squad',
        avatarUrl: null,
        leaderId: 'leader-1',
        memberCount: 4,
        visibility: 'public',
        inviteCode: null,
        totalWins: 5,
        totalGames: 8,
        createdAt: new Date().toISOString(),
      },
      clanWars: [],
      activeMatchWar: null,
    });
  });

  it('updates clan war in store when clan:war-updated socket event is triggered', () => {
    const updateClanWarSpy = vi.fn();
    useClansStore.setState({ updateClanWar: updateClanWarSpy });

    renderHook(() => useClanSocket());

    expect(registeredHandlers['clan:war-updated']).toBeDefined();

    const mockWar: ClanWar = {
      id: 'war-socket-1',
      initiatorClanId: 'clan-abc',
      initiatorClanName: 'Alpha Clan',
      initiatorClanTag: 'ALP',
      initiatorScore: 3,
      targetClanId: 'clan-xyz',
      targetClanName: 'Omega Clan',
      targetClanTag: 'OMG',
      targetClanScore: 1,
      targetScore: 5,
      gameId: 'all',
      status: 'active',
      winnerClanId: null,
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      matchLogs: [],
    };

    act(() => {
      registeredHandlers['clan:war-updated']?.(mockWar);
    });

    expect(updateClanWarSpy).toHaveBeenCalledWith(mockWar);
  });
});
