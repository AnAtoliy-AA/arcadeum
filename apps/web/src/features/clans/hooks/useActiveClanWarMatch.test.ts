import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useActiveClanWarMatch } from './useActiveClanWarMatch';
import { useClansStore } from '../store/clansStore';
import type { ClanWar, Clan } from '../model/types';

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({
    snapshot: {
      userId: 'user-player-1',
      accessToken: 'test-token',
    },
  }),
}));

vi.mock('./useClanSocket', () => ({
  useClanSocket: vi.fn(),
}));

describe('useActiveClanWarMatch', () => {
  const mockWar: ClanWar = {
    id: 'war-match-1',
    initiatorClanId: 'clan-1',
    initiatorClanName: 'Knights',
    initiatorClanTag: 'KNG',
    initiatorScore: 1,
    targetClanId: 'clan-2',
    targetClanName: 'Shadows',
    targetClanTag: 'SHD',
    targetClanScore: 0,
    targetScore: 5,
    gameId: 'sea-battle',
    status: 'active',
    winnerClanId: null,
    expiresAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    matchLogs: [],
  };

  const mockClan: Clan = {
    id: 'clan-1',
    name: 'Knights',
    tag: 'KNG',
    description: 'Brave knights',
    avatarUrl: null,
    leaderId: 'user-player-1',
    memberCount: 5,
    visibility: 'public',
    inviteCode: null,
    totalWins: 10,
    totalGames: 12,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useClansStore.setState({
      myClan: mockClan,
      activeMatchWar: null,
      fetchActiveMatchWar: vi.fn().mockResolvedValue(mockWar),
    });
  });

  it('fetches active match war when opponent user id is valid and distinct', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(mockWar);
    useClansStore.setState({ fetchActiveMatchWar: fetchSpy });

    const { result } = renderHook(() =>
      useActiveClanWarMatch('user-opponent-2', 'sea-battle'),
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      'user-player-1',
      'user-opponent-2',
      'sea-battle',
      'test-token',
    );

    act(() => {
      useClansStore.setState({ activeMatchWar: mockWar });
    });

    expect(result.current.isClanWarMatch).toBe(true);
    expect(result.current.activeWar?.id).toBe('war-match-1');
  });

  it('resets match war when opponent is missing or matches current user', () => {
    const setActiveMatchWarSpy = vi.fn();
    useClansStore.setState({ setActiveMatchWar: setActiveMatchWarSpy });

    renderHook(() => useActiveClanWarMatch(undefined));

    expect(setActiveMatchWarSpy).toHaveBeenCalledWith(null);
  });

  it('resets match war and skips API call when opponent is a bot', () => {
    const fetchSpy = vi.fn();
    const setActiveMatchWarSpy = vi.fn();
    useClansStore.setState({
      fetchActiveMatchWar: fetchSpy,
      setActiveMatchWar: setActiveMatchWarSpy,
    });

    renderHook(() => useActiveClanWarMatch('bot-d9547e0d9a', 'tic_tac_toe_v1'));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setActiveMatchWarSpy).toHaveBeenCalledWith(null);
  });

  it('resets match war and skips API call when opponent is anonymous', () => {
    const fetchSpy = vi.fn();
    const setActiveMatchWarSpy = vi.fn();
    useClansStore.setState({
      fetchActiveMatchWar: fetchSpy,
      setActiveMatchWar: setActiveMatchWarSpy,
    });

    renderHook(() =>
      useActiveClanWarMatch('anon_8fff7a0ae8053b4b', 'tic_tac_toe_v1'),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setActiveMatchWarSpy).toHaveBeenCalledWith(null);
  });
});
