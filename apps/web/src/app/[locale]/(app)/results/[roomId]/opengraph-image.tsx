import { ImageResponse } from 'next/og';
import { resolveApiUrl } from '@/shared/lib/api-base';

export const OG_SIZE = { width: 1200, height: 630 };

const GAME_ACCENTS: Record<string, string> = {
  chess_v1: '#f59e0b',
  checkers_v1: '#ef4444',
  backgammon_v1: '#10b981',
  go_v1: '#6366f1',
  hearts_v1: '#ec4899',
  spades_v1: '#3b82f6',
  sea_battle_v1: '#06b6d4',
  critical_v1: '#f97316',
  tic_tac_toe_v1: '#8b5cf6',
  minesweeper_v1: '#22c55e',
  game_2048_v1: '#eab308',
  solitaire_v1: '#dc2626',
  sudoku_v1: '#2563eb',
  cascade_v1: '#14b8a6',
  glimworm_v1: '#a855f7',
  cat_dash_v1: '#f43f5e',
  pachisi_v1: '#d946ef',
};

export default async function ResultOgImage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  let data: {
    gameName: string;
    participants: Array<{ displayName: string; isWinner: boolean }>;
    isDraw: boolean;
    gameId: string;
  } | null = null;

  try {
    const res = await fetch(resolveApiUrl(`/games/rooms/${roomId}/result`), {
      next: { revalidate: 30 },
    });
    if (res.ok) data = await res.json();
  } catch {
    // fallback
  }

  const gameName = data?.gameName ?? 'Game';
  const isDraw = data?.isDraw ?? false;
  const gameId = data?.gameId ?? '';
  const accent = GAME_ACCENTS[gameId] ?? '#f59e0b';
  const winner = data?.participants.find((p) => p.isWinner);
  const loser = data?.participants.find((p) => !p.isWinner);

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: 1200,
        height: 630,
        backgroundImage:
          'linear-gradient(135deg, #070b14 0%, #030712 50%, #0f172a 100%)',
        padding: '52px 64px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.85,
        }}
      />

      {/* Accent glow */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          right: -80,
          top: -80,
          width: 560,
          height: 560,
          borderRadius: 280,
          background: `radial-gradient(circle, ${accent}30 0%, ${accent}08 45%, transparent 70%)`,
          filter: 'blur(45px)',
        }}
      />

      {/* Border */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          inset: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
        }}
      />

      {/* Corner accents */}
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 20,
          left: 20,
          width: 20,
          height: 20,
          borderTop: `3px solid ${accent}`,
          borderLeft: `3px solid ${accent}`,
          borderTopLeftRadius: 10,
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: 20,
          right: 20,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${accent}`,
          borderRight: `3px solid ${accent}`,
          borderBottomRightRadius: 10,
        }}
      />

      {/* Left content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 640,
          height: '100%',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 14px ${accent}`,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '3px',
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
              }}
            >
              ARCADEUM GAMES
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: 8,
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
              alignSelf: 'flex-start',
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: accent,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              GAME RESULT
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span
            style={{
              fontSize: gameName.length > 12 ? 52 : 64,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-2px',
              color: '#ffffff',
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}
          >
            {gameName}
          </span>

          {winner && !isDraw && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {winner.displayName}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#22c55e',
                    textTransform: 'uppercase',
                  }}
                >
                  WINNER
                </span>
              </div>
              {loser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>🥈</span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {loser.displayName}
                  </span>
                </div>
              )}
            </div>
          )}

          {isDraw && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 22 }}>🤝</span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                Draw
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '1.5px',
            }}
          >
            arcadeum.games
          </span>
        </div>
      </div>

      {/* Right: visual */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 420,
          height: 420,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 28,
            boxShadow: `0 24px 70px rgba(0, 0, 0, 0.6), 0 0 40px ${accent}15`,
          }}
        >
          <span style={{ fontSize: 140 }}>{isDraw ? '🤝' : '🏆'}</span>
        </div>
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
