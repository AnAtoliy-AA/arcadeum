'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Input } from '@arcadeum/ui';
import { useClansStore } from '../store/clansStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { ClanCard } from './ClanCard';

interface JoinClanModalProps {
  open: boolean;
  onClose: () => void;
}

export function JoinClanModal({ open, onClose }: JoinClanModalProps) {
  const { snapshot } = useSessionTokens();
  const { searchClans, joinClan, searchResults, loading } = useClansStore();
  const [query, setQuery] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'code'>('search');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    await searchClans(query.trim(), snapshot.accessToken ?? undefined);
  }, [query, snapshot.accessToken, searchClans]);

  const handleJoinByCode = useCallback(async () => {
    if (!inviteCode.trim() || !snapshot.accessToken) return;
    setError(null);
    try {
      await joinClan(inviteCode.trim(), snapshot.accessToken);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  }, [inviteCode, snapshot.accessToken, joinClan, onClose]);

  const handleJoinClan = useCallback(
    async (clanId: string) => {
      if (!snapshot.accessToken) return;
      setError(null);
      try {
        await joinClan(clanId, snapshot.accessToken);
        onClose();
      } catch (err) {
        setError((err as Error).message);
      }
    },
    [snapshot.accessToken, joinClan, onClose],
  );

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-bold">Join Clan</h2>

        <div className="flex gap-2">
          <Button
            variant={activeTab === 'search' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('search')}
          >
            Search
          </Button>
          <Button
            variant={activeTab === 'code' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('code')}
          >
            Invite Code
          </Button>
        </div>

        {activeTab === 'search' && (
          <>
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clans..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {searchResults.map((clan) => (
                <ClanCard
                  key={clan.id}
                  clan={clan}
                  onJoin={handleJoinClan}
                  showJoin
                />
              ))}
              {searchResults.length === 0 && query && !loading && (
                <p className="text-center text-sm text-[var(--foreground)]/50">
                  No clans found
                </p>
              )}
            </div>
          </>
        )}

        {activeTab === 'code' && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Enter invite code</label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Paste invite code here"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleJoinByCode}
              disabled={!inviteCode.trim() || loading}
            >
              Join
            </Button>
          </>
        )}

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
