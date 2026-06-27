'use client';

import { Text, XStack, YStack } from 'tamagui';
import type { RepeatMode } from './GameMusicUtils';
import { PlaylistIcon, MinimizeIcon, MaximizeIcon } from './GameMusicVisuals';

const VolumeIcon = ({ level }: { level: number }) => {
  if (level === 0) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  if (level < 0.5) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
};

const MusicBtn = ({
  onClick,
  testId,
  ariaLabel,
  color = 'rgba(255,255,255,0.6)',
  children,
  active,
  className = '',
}: {
  onClick: () => void;
  testId: string;
  ariaLabel: string;
  color?: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel}
    className={`game-music-btn ${active ? 'game-music-btn-active' : ''} ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: 'none',
      background: 'transparent',
      color,
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    {children}
  </button>
);

const PlayBtn = ({
  onClick,
  testId,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  testId: string;
  ariaLabel: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid={testId}
    aria-label={ariaLabel}
    className="game-music-btn game-music-play-btn"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      border: '1px solid rgba(129,140,248,0.3)',
      background: 'rgba(129,140,248,0.25)',
      color: '#ffffff',
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    {children}
  </button>
);

interface TransportControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  playlistOpen: boolean;
  volume: number;
  onTogglePlay: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onTogglePlaylist: () => void;
  onToggleMiniMode: () => void;
  onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  labels: {
    play: string;
    pause: string;
    stop: string;
    prev: string;
    next: string;
    shuffleOn: string;
    shuffleOff: string;
    repeatOff: string;
    repeatAll: string;
    repeatOne: string;
    playlistShow: string;
    playlistHide: string;
    minimize: string;
    maximize: string;
    volume: string;
  };
}

export function TransportControls({
  isPlaying,
  shuffle,
  repeat,
  playlistOpen,
  volume,
  onTogglePlay,
  onStop,
  onNext,
  onPrev,
  onToggleShuffle,
  onCycleRepeat,
  onTogglePlaylist,
  onToggleMiniMode,
  onVolumeChange,
  labels,
}: TransportControlsProps) {
  return (
    <YStack gap={12}>
      <XStack alignItems="center" gap="$2" paddingHorizontal={2}>
        <XStack className="game-music-volume-icon" flexShrink={0} style={{ color: 'rgba(255,255,255,0.4)' }}>
          <VolumeIcon level={volume} />
        </XStack>
        <input
          className="game-music-volume"
          data-testid="game-music-volume"
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(volume * 100)}
          onChange={onVolumeChange}
          aria-label={labels.volume}
          style={{
            flex: 1,
            background: `linear-gradient(to right, rgba(129,140,248,0.8) 0%, rgba(129,140,248,0.8) ${Math.round(volume * 100)}%, rgba(255,255,255,0.12) ${Math.round(volume * 100)}%, rgba(255,255,255,0.12) 100%)`,
          }}
        />
      </XStack>

      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap={4}>
          <MusicBtn
            onClick={onToggleShuffle}
            testId="game-music-shuffle"
            ariaLabel={shuffle ? labels.shuffleOn : labels.shuffleOff}
            color={shuffle ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
          </MusicBtn>
          <MusicBtn
            onClick={onPrev}
            testId="game-music-prev"
            ariaLabel={labels.prev}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </MusicBtn>
          <PlayBtn
            onClick={onTogglePlay}
            testId="game-music-playpause"
            ariaLabel={isPlaying ? labels.pause : labels.play}
          >
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.54.84l11.5-7.5a1 1 0 0 0 0-1.68L8.54 3.66A1 1 0 0 0 7 4.5Z"/></svg>
            )}
          </PlayBtn>
          <MusicBtn
            onClick={onStop}
            testId="game-music-stop"
            ariaLabel={labels.stop}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          </MusicBtn>
          <MusicBtn
            onClick={onNext}
            testId="game-music-next"
            ariaLabel={labels.next}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z"/></svg>
          </MusicBtn>
          <MusicBtn
            onClick={onCycleRepeat}
            testId="game-music-repeat"
            ariaLabel={
              repeat === 'off'
                ? labels.repeatOff
                : repeat === 'all'
                  ? labels.repeatAll
                  : labels.repeatOne
            }
            color={repeat !== 'off' ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            {repeat === 'one' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><text x="12" y="15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="bold">1</text></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
            )}
          </MusicBtn>
          <MusicBtn
            onClick={onTogglePlaylist}
            testId="game-music-playlist-toggle"
            ariaLabel={
              playlistOpen ? labels.playlistHide : labels.playlistShow
            }
            color={playlistOpen ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            <PlaylistIcon size={18} />
          </MusicBtn>
        </XStack>

        <MusicBtn
          onClick={onToggleMiniMode}
          testId="game-music-minimize"
          ariaLabel={labels.minimize}
          color="rgba(255,255,255,0.3)"
        >
          <MinimizeIcon size={16} />
        </MusicBtn>
      </XStack>
    </YStack>
  );
}

interface MiniControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onToggleMiniMode: () => void;
  labels: {
    play: string;
    pause: string;
    maximize: string;
  };
}

export function MiniControls({
  isPlaying,
  onTogglePlay,
  onToggleMiniMode,
  labels,
}: MiniControlsProps) {
  return (
    <XStack alignItems="center" justifyContent="center" gap={10}>
      <PlayBtn
        onClick={onTogglePlay}
        testId="game-music-playpause"
        ariaLabel={isPlaying ? labels.pause : labels.play}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.54.84l11.5-7.5a1 1 0 0 0 0-1.68L8.54 3.66A1 1 0 0 0 7 4.5Z"/></svg>
        )}
      </PlayBtn>
      <MusicBtn
        onClick={onToggleMiniMode}
        testId="game-music-maximize"
        ariaLabel={labels.maximize}
        color="rgba(255,255,255,0.4)"
      >
        <MaximizeIcon size={16} />
      </MusicBtn>
    </XStack>
  );
}

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  label,
}: ProgressBarProps) {
  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <XStack width="100%" alignItems="center" gap="$2" paddingHorizontal={12}>
      <Text
        fontSize={10}
        className="game-music-time"
        color="rgba(255,255,255,0.4)"
        minWidth={32}
        fontWeight="500"
      >
        {formatTime(currentTime)}
      </Text>
      <input
        className="game-music-progress"
        data-testid="game-music-progress"
        type="range"
        min={0}
        max={duration || 0}
        step={1}
        value={currentTime}
        onChange={onSeek}
        aria-label={label}
        style={{
          flex: 1,
          background: `linear-gradient(to right, #818cf8 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      />
      <Text
        fontSize={10}
        className="game-music-time"
        color="rgba(255,255,255,0.4)"
        minWidth={32}
        fontWeight="500"
        textAlign="right"
      >
        {formatTime(duration)}
      </Text>
    </XStack>
  );
}
