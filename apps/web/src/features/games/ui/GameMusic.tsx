'use client';

import { Typography } from '@arcadeum/ui';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useAudioPlayer } from './useAudioPlayer';
import {
  TransportControls,
  MiniControls,
  ProgressBar,
} from './GameMusicControls';
import { Playlist } from './GameMusicPlaylist';
import { EqualizerVisualization } from './GameMusicVisuals';
import { useDraggable } from './useDraggable';
import { playerStyles } from './GameMusicStyles';
import { SPRITE_URL, SPRITE_SIZE, SPRITE_COLS } from './GameMusicUtils';

export function GameMusic({ gameId }: { gameId?: string | null }) {
  const { musicEnabled } = useMusicSetting();
  const { t } = useTranslation();
  const player = useAudioPlayer(gameId);
  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDraggable({
    x: 16,
    y: typeof window !== 'undefined' ? window.innerHeight - 200 : 600,
  });

  if (!musicEnabled) return null;

  if (player.loading) {
    return (
      <div
        className="fixed bottom-4 left-4 z-[1000] w-[200px] rounded-[28px] border border-white/20 px-3 py-3 shadow-2xl"
        style={{
          backgroundColor: '#0f172a',
        }}
      >
        <Typography uiSize="xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Loading music…
        </Typography>
      </div>
    );
  }

  const labels = {
    play: t('musicPlayer.play'),
    pause: t('musicPlayer.pause'),
    stop: t('musicPlayer.stop'),
    prev: t('musicPlayer.prev'),
    next: t('musicPlayer.next'),
    shuffleOn: t('musicPlayer.shuffleOn'),
    shuffleOff: t('musicPlayer.shuffleOff'),
    repeatOff: t('musicPlayer.repeatOff'),
    repeatAll: t('musicPlayer.repeatAll'),
    repeatOne: t('musicPlayer.repeatOne'),
    playlistShow: t('musicPlayer.playlistShow'),
    playlistHide: t('musicPlayer.playlistHide'),
    minimize: t('musicPlayer.minimize'),
    maximize: t('musicPlayer.maximize'),
    volume: t('musicPlayer.volume'),
    seek: t('musicPlayer.progress'),
    skipForward: t('musicPlayer.skipForward'),
    skipBack: t('musicPlayer.skipBack'),
  };

  return (
    <>
      <style>{playerStyles}</style>
      <div
        className={`game-music-player fixed z-[1000] rounded-[28px] border border-white/20 px-3 py-3 ${player.isPlaying ? 'is-playing' : ''}`}
        data-testid="game-music-player"
        style={{
          width: player.miniMode ? 200 : 320,
          background: (() => {
            const hue = (player.index * 47) % 360;
            return `linear-gradient(180deg, hsla(${hue}, 40%, 18%, 1) 0%, #0f172a 40%, #080c18 100%)`;
          })(),
          boxShadow:
            '0 20px 50px -10px rgba(0, 0, 0, 0.85), 0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
          left: pos.x,
          top: pos.y,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          data-drag-handle
          className="flex cursor-grab items-center gap-3 px-1 py-1"
          style={{ touchAction: 'none' }}
        >
          <div
            className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.3)',
              backgroundImage:
                player.track?.spriteIndex != null
                  ? `url(${SPRITE_URL})`
                  : undefined,
              backgroundPosition:
                player.track?.spriteIndex != null
                  ? `-${(player.track.spriteIndex % SPRITE_COLS) * SPRITE_SIZE}px -${Math.floor(player.track.spriteIndex / SPRITE_COLS) * SPRITE_SIZE}px`
                  : undefined,
              backgroundSize:
                player.track?.spriteIndex != null ? 'auto' : undefined,
            }}
          >
            {player.track?.spriteIndex == null && (
              <EqualizerVisualization
                isPlaying={player.isPlaying}
                audioRef={player.audioRef}
              />
            )}
            {player.isPlaying && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5">
              <Typography className="block text-[9px] font-semibold uppercase tracking-widest text-indigo-300">
                Arcadeum
              </Typography>
              <span className="text-[8px] text-white/30">•</span>
              <Typography className="block text-[9px] text-white/50">
                Track {String(player.index + 1).padStart(2, '0')}
              </Typography>
            </div>
            <Typography className="game-music-title block truncate text-[13px] font-bold text-white tracking-tight">
              {player.track?.title}
            </Typography>
          </div>
          <button
            onClick={player.closePlayer}
            data-testid="game-music-close"
            aria-label="Close player"
            title="Close player"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)',
              transition: 'color 150ms ease, background-color 150ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {player.error && (
          <Typography
            className="mt-1 px-2"
            uiSize="xs"
            style={{ color: '#f87171' }}
          >
            {player.error}
          </Typography>
        )}

        {!player.miniMode && (
          <div className="mt-2 flex flex-col gap-3">
            {player.playlistOpen && (
              <Playlist
                tracks={player.tracks}
                index={player.index}
                isPlaying={player.isPlaying}
                enabledTracks={player.enabledTracks}
                trackDurations={player.trackDurations}
                onToggleTrack={player.toggleTrack}
                onReorder={player.reorderTracks}
                onPlay={player.playIndex}
              />
            )}
            <ProgressBar
              currentTime={player.currentTime}
              duration={player.duration}
              onSeek={player.onSeek}
              label={labels.seek}
            />
            <TransportControls
              isPlaying={player.isPlaying}
              shuffle={player.shuffle}
              repeat={player.repeat}
              playlistOpen={player.playlistOpen}
              volume={player.volume}
              onTogglePlay={player.togglePlay}
              onStop={player.stop}
              onNext={player.next}
              onPrev={player.prev}
              onToggleShuffle={player.toggleShuffle}
              onCycleRepeat={player.cycleRepeat}
              onTogglePlaylist={() => player.setPlaylistOpen((o) => !o)}
              onToggleMiniMode={() => player.setMiniMode(true)}
              onVolumeChange={player.onVolumeChange}
              onSkipForward={player.skipForward}
              onSkipBack={player.skipBack}
              labels={labels}
            />
          </div>
        )}

        {player.miniMode && (
          <div className="flex flex-col items-center gap-2">
            <Typography
              className="game-music-title max-w-[140px] truncate text-[10px] font-medium"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {player.track?.title}
            </Typography>
            <MiniControls
              isPlaying={player.isPlaying}
              onTogglePlay={player.togglePlay}
              onPrev={player.prev}
              onNext={player.next}
              onStop={player.stop}
              onToggleMiniMode={() => player.setMiniMode(false)}
              labels={labels}
            />
          </div>
        )}
      </div>
    </>
  );
}
