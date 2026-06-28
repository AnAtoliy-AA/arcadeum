'use client';

import { Text, XStack, YStack } from 'tamagui';
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

export function GameMusic({ gameId }: { gameId?: string | null }) {
  const { musicEnabled } = useMusicSetting();
  const { t } = useTranslation();
  const player = useAudioPlayer(gameId);
  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDraggable({
    x: 16,
    y: typeof window !== 'undefined' ? window.innerHeight - 200 : 600,
  });

  if (!musicEnabled || !player.visible) return null;

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
      <YStack
        className={`game-music-player${player.isPlaying ? ' is-playing' : ''}`}
        testID="game-music-player"
        position="fixed"
        zIndex={1000}
        width={player.miniMode ? 160 : 320}
        gap={0}
        paddingVertical="$3"
        paddingHorizontal="$3"
        borderRadius={28}
        backgroundColor="rgba(255,255,255,0.18)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.5)"
        style={{
          backdropFilter: 'blur(50px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(50px) saturate(1.6)',
          boxShadow:
            '0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.1), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
          background: (() => {
            const hue = (player.index * 47) % 360;
            return `linear-gradient(180deg, hsla(${hue},40%,70%,0.2) 0%, rgba(255,255,255,0.1) 35%, hsla(${hue},30%,60%,0.15) 100%)`;
          })(),
          left: pos.x,
          top: pos.y,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <XStack
          data-drag-handle
          alignItems="center"
          gap="$3"
          cursor="grab"
          paddingVertical="$1"
          paddingHorizontal="$1"
          style={{ touchAction: 'none' }}
        >
          <XStack
            width={40}
            height={40}
            borderRadius={10}
            backgroundColor="rgba(255,255,255,0.25)"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            style={{
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.6), 0 0 12px rgba(255,255,255,0.08)',
            }}
          >
            <EqualizerVisualization
              isPlaying={player.isPlaying}
              audioRef={player.audioRef}
            />
          </XStack>
          <YStack flex={1} overflow="hidden" gap={1}>
            <Text
              className="game-music-title"
              fontSize={13}
              fontWeight="600"
              color="rgba(255,255,255,0.95)"
              numberOfLines={1}
            >
              {player.track?.title}
            </Text>
            <Text
              fontSize={10}
              fontWeight="400"
              color="rgba(255,255,255,0.55)"
              numberOfLines={1}
            >
              Arcadeum
            </Text>
          </YStack>
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
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
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
        </XStack>

        {player.error && (
          <Text
            fontSize={11}
            color="#f87171"
            paddingHorizontal="$2"
            marginTop="$1"
          >
            {player.error}
          </Text>
        )}

        {!player.miniMode && (
          <YStack gap="$3" marginTop="$2">
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
          </YStack>
        )}

        {player.miniMode && (
          <YStack gap="$2" alignItems="center">
            <Text
              className="game-music-title"
              fontSize={10}
              fontWeight="500"
              color="rgba(255,255,255,0.7)"
              numberOfLines={1}
              maxWidth={140}
            >
              {player.track?.title}
            </Text>
            <MiniControls
              isPlaying={player.isPlaying}
              onTogglePlay={player.togglePlay}
              onPrev={player.prev}
              onNext={player.next}
              onStop={player.stop}
              onToggleMiniMode={() => player.setMiniMode(false)}
              labels={labels}
            />
          </YStack>
        )}
      </YStack>
    </>
  );
}
