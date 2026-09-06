'use client';

import { useState, useEffect } from 'react';
import { GlassCard, Typography, Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface Club {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  avatar: string;
  visibility: 'public' | 'private';
}

interface ClubListProps {
  onClubSelect?: (clubId: string) => void;
}

export function ClubList({ onClubSelect }: ClubListProps) {
  const { t } = useTranslation();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch(
          `/api/chess/clubs/search?q=${encodeURIComponent(search)}&limit=20`,
        );
        if (res.ok) {
          setClubs(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, [search]);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('games.chess_v1.clubs.search')}
        className="rounded-lg border border-[var(--glassBorder)] bg-[var(--glassBg)] px-4 py-2 text-[var(--color)] placeholder-[var(--textMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[var(--glassBg)]" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <GlassCard className="p-4">
          <Typography variant="body" uiSize="sm">
            {t('games.chess_v1.clubs.noClubs')}
          </Typography>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-2">
          {clubs.map((club) => (
            <GlassCard
              key={club._id}
              className="cursor-pointer p-4 transition-colors hover:bg-[var(--glassBgHover)]"
              onClick={() => onClubSelect?.(club._id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body" uiSize="sm">
                    {club.name}
                  </Typography>
                  {club.description && (
                    <Typography variant="caption" uiSize="xs" className="text-[var(--textMuted)]">
                      {club.description}
                    </Typography>
                  )}
                </div>
                <Typography variant="caption" uiSize="xs">
                  {club.memberCount} {t('games.chess_v1.clubs.members')}
                </Typography>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
