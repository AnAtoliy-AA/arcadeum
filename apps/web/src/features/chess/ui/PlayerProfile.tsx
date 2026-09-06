'use client';

import { useState, useEffect } from 'react';
import { GlassCard, Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

interface PlayerProfileData {
  userId: string;
  bio: string;
  country: string;
  title: string;
  perGameStats: Record<
    string,
    {
      games: number;
      wins: number;
      losses: number;
      draws: number;
      elo: number;
      peakElo: number;
    }
  >;
  puzzleRating: number;
  totalPuzzlesSolved: number;
  favoriteOpening: string;
  playStyle: string;
}

interface PlayerProfileProps {
  userId: string;
  isOwnProfile?: boolean;
}

export function PlayerProfile({ userId, isOwnProfile = false }: PlayerProfileProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/chess/profiles/${userId}`);
        if (res.ok) {
          setProfile(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-32 rounded bg-[var(--glassBg)]" />
          <div className="h-4 w-48 rounded bg-[var(--glassBg)]" />
        </div>
      </GlassCard>
    );
  }

  if (!profile) {
    return (
      <GlassCard className="p-6">
        <Typography variant="body">{t('games.chess_v1.profile.notFound')}</Typography>
      </GlassCard>
    );
  }

  const totalGames = Object.values(profile.perGameStats).reduce((a, s) => a + s.games, 0);
  const totalWins = Object.values(profile.perGameStats).reduce((a, s) => a + s.wins, 0);
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Typography variant="heading" uiSize="lg">
              {profile.title && (
                <span className="text-[var(--primary)]">{profile.title} </span>
              )}
              {userId}
            </Typography>
            {profile.country && (
              <span className="text-sm">{profile.country}</span>
            )}
          </div>
          {profile.bio && (
            <Typography variant="body" uiSize="sm" className="mt-1 text-[var(--textMuted)]">
              {profile.bio}
            </Typography>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="text-center">
          <Typography variant="heading" uiSize="md">{totalGames}</Typography>
          <Typography variant="caption">{t('games.chess_v1.profile.games')}</Typography>
        </div>
        <div className="text-center">
          <Typography variant="heading" uiSize="md">{winRate}%</Typography>
          <Typography variant="caption">{t('games.chess_v1.profile.winRate')}</Typography>
        </div>
        <div className="text-center">
          <Typography variant="heading" uiSize="md">{profile.puzzleRating}</Typography>
          <Typography variant="caption">{t('games.chess_v1.profile.puzzleRating')}</Typography>
        </div>
        <div className="text-center">
          <Typography variant="heading" uiSize="md">{profile.totalPuzzlesSolved}</Typography>
          <Typography variant="caption">{t('games.chess_v1.profile.puzzlesSolved')}</Typography>
        </div>
      </div>

      {Object.keys(profile.perGameStats).length > 0 && (
        <div className="mt-4">
          <Typography variant="label" uiSize="sm" className="mb-2">
            {t('games.chess_v1.profile.ratings')}
          </Typography>
          <div className="flex flex-wrap gap-2">
            {Object.entries(profile.perGameStats).map(([gameType, stats]) => (
              <div
                key={gameType}
                className="rounded-lg border border-[var(--glassBorder)] bg-[var(--glassBg)] px-3 py-2 text-center"
              >
                <Typography variant="caption" uiSize="xs" className="capitalize">
                  {gameType}
                </Typography>
                <Typography variant="body" uiSize="sm">
                  {stats.elo}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.playStyle && (
        <div className="mt-4">
          <Typography variant="label" uiSize="sm">
            {t('games.chess_v1.profile.style')}: {profile.playStyle}
          </Typography>
        </div>
      )}
    </GlassCard>
  );
}
