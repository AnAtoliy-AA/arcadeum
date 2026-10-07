import { create } from 'zustand';
import type {
  Clan,
  ClanMember,
  ClanTab,
  ClanLeaderboardEntry,
  ClanLeaderboardSort,
  ClanMvpEntry,
  CommunityChallenge,
} from '../model/types';
import { clansApi } from '../api';

interface ClansState {
  myClan: Clan | null;
  myClanMembers: ClanMember[];
  searchResults: Clan[];
  popularClans: Clan[];
  selectedClan: Clan | null;
  selectedClanMembers: ClanMember[];
  activeTab: ClanTab;
  leaderboardEntries: ClanLeaderboardEntry[];
  leaderboardTotal: number;
  leaderboardSort: ClanLeaderboardSort;
  communityChallenges: CommunityChallenge[];
  clanMvps: ClanMvpEntry[];
  loading: boolean;
  error: string | null;

  setActiveTab: (tab: ClanTab) => void;
  setLeaderboardSort: (sort: ClanLeaderboardSort) => void;
  fetchMyClan: (token: string) => Promise<void>;
  fetchClanById: (clanId: string, token: string) => Promise<void>;
  fetchClanMembers: (clanId: string, token: string) => Promise<void>;
  fetchPopularClans: (token?: string) => Promise<void>;
  searchClans: (query: string, token?: string) => Promise<void>;
  fetchLeaderboard: (
    sort?: ClanLeaderboardSort,
    token?: string,
  ) => Promise<void>;
  fetchCommunityChallenges: (token?: string) => Promise<void>;
  fetchClanMvps: (clanId: string, token?: string) => Promise<void>;
  contributeToChallenge: (
    challengeId: string,
    amount?: number,
    token?: string,
  ) => Promise<void>;
  createClan: (
    data: {
      name: string;
      tag: string;
      description?: string;
      visibility?: string;
    },
    token: string,
  ) => Promise<Clan>;
  joinClan: (clanId: string, token: string) => Promise<void>;
  leaveClan: (clanId: string, token: string) => Promise<void>;
  removeMember: (clanId: string, token: string) => Promise<void>;
  addMember: (member: ClanMember) => void;
  removeMemberById: (userId: string) => void;
  setSelectedClan: (clan: Clan | null) => void;
  reset: () => void;
}

export const useClansStore = create<ClansState>((set, get) => ({
  myClan: null,
  myClanMembers: [],
  searchResults: [],
  popularClans: [],
  selectedClan: null,
  selectedClanMembers: [],
  activeTab: 'overview',
  leaderboardEntries: [],
  leaderboardTotal: 0,
  leaderboardSort: 'wins',
  communityChallenges: [],
  clanMvps: [],
  loading: false,
  error: null,

  setActiveTab: (activeTab) => set({ activeTab }),

  setLeaderboardSort: (leaderboardSort) => set({ leaderboardSort }),

  fetchMyClan: async (token) => {
    set({ loading: true, error: null });
    try {
      const clan = await clansApi.getMyClan({ token });
      set({ myClan: clan, loading: false });
      if (clan) {
        const members = await clansApi.getClanMembers(clan.id, { token });
        set({ myClanMembers: members });
        get().fetchClanMvps(clan.id, token);
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchClanById: async (clanId, token) => {
    set({ loading: true, error: null });
    try {
      const clan = await clansApi.getClanById(clanId, { token });
      set({ selectedClan: clan, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchClanMembers: async (clanId, token) => {
    try {
      const members = await clansApi.getClanMembers(clanId, { token });
      set({ selectedClanMembers: members });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchPopularClans: async (token) => {
    set({ loading: true, error: null });
    try {
      const clans = await clansApi.getPopularClans(
        token ? { token } : undefined,
      );
      set({ popularClans: clans, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  searchClans: async (query, token) => {
    set({ loading: true, error: null });
    try {
      const clans = await clansApi.searchClans(
        query,
        token ? { token } : undefined,
      );
      set({ searchResults: clans, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchLeaderboard: async (sort, token) => {
    const currentSort = sort ?? get().leaderboardSort;
    try {
      const res = await clansApi.getLeaderboard(
        { sortBy: currentSort, limit: 25 },
        token ? { token } : undefined,
      );
      set({
        leaderboardEntries: res.entries,
        leaderboardTotal: res.total,
        leaderboardSort: currentSort,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchCommunityChallenges: async (token) => {
    try {
      const challenges = await clansApi.getCommunityChallenges(
        token ? { token } : undefined,
      );
      set({ communityChallenges: challenges });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchClanMvps: async (clanId, token) => {
    try {
      const mvps = await clansApi.getClanMvps(
        clanId,
        10,
        token ? { token } : undefined,
      );
      set({ clanMvps: mvps });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  contributeToChallenge: async (challengeId, amount = 1, token) => {
    try {
      const updated = await clansApi.contributeToChallenge(
        challengeId,
        amount,
        token ? { token } : undefined,
      );
      set((state) => ({
        communityChallenges: state.communityChallenges.map((c) =>
          c.id === updated.id ? updated : c,
        ),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  createClan: async (data, token) => {
    set({ loading: true, error: null });
    try {
      const clan = await clansApi.createClan(data, { token });
      set({ myClan: clan, loading: false });
      return clan;
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  joinClan: async (clanId, token) => {
    set({ loading: true, error: null });
    try {
      await clansApi.joinClan(clanId, { token });
      const clan = await clansApi.getClanById(clanId, { token });
      set({ myClan: clan, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  leaveClan: async (clanId, token) => {
    set({ loading: true, error: null });
    try {
      await clansApi.leaveClan(clanId, { token });
      set({
        myClan: null,
        myClanMembers: [],
        clanMvps: [],
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
      throw err;
    }
  },

  removeMember: async (clanId, token) => {
    void clanId;
    void token;
  },

  addMember: (member) => {
    set((state) => ({
      myClanMembers: [...state.myClanMembers, member],
      myClan: state.myClan
        ? { ...state.myClan, memberCount: state.myClan.memberCount + 1 }
        : null,
    }));
  },

  removeMemberById: (userId) => {
    set((state) => ({
      myClanMembers: state.myClanMembers.filter((m) => m.userId !== userId),
      myClan: state.myClan
        ? {
            ...state.myClan,
            memberCount: Math.max(0, state.myClan.memberCount - 1),
          }
        : null,
    }));
  },

  setSelectedClan: (clan) => set({ selectedClan: clan }),

  reset: () =>
    set({
      myClan: null,
      myClanMembers: [],
      searchResults: [],
      popularClans: [],
      selectedClan: null,
      selectedClanMembers: [],
      activeTab: 'overview',
      leaderboardEntries: [],
      leaderboardTotal: 0,
      leaderboardSort: 'wins',
      communityChallenges: [],
      clanMvps: [],
      loading: false,
      error: null,
    }),
}));
