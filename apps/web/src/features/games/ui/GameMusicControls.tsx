'use client';

import { Text, XStack, YStack } from 'tamagui';
import {
  IconButton,
  PlayIcon,
  PauseIcon,
  StopIcon,
  SkipBackIcon,
  SkipForwardIcon,
  ShuffleIcon,
  RepeatIcon,
  RepeatOneIcon,
} from '@arcadeum/ui';
import type { RepeatMode } from './GameMusicUtils';
import { PlaylistIcon, MinimizeIcon, MaximizeIcon } from './GameMusicVisuals';

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

const btnHover = { scale: 1.1 } as const;

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
    <YStack gap="$2.5" marginBottom="$1">
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
        <XStack alignItems="center" gap={8}>
          <IconButton
            circular
            size="md"
            className="game-music-btn"
            onClick={onToggleShuffle}
            testId="game-music-shuffle"
            aria-label={shuffle ? labels.shuffleOn : labels.shuffleOff}
            hoverStyle={btnHover}
            color={shuffle ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            <ShuffleIcon size={15} />
          </IconButton>
          <IconButton
            circular
            size="md"
            className="game-music-btn"
            onClick={onPrev}
            testId="game-music-prev"
            aria-label={labels.prev}
            hoverStyle={btnHover}
            color="rgba(255,255,255,0.8)"
          >
            <SkipBackIcon size={16} />
          </IconButton>
          <IconButton
            circular
            size="lg"
            className="game-music-btn game-music-play-btn"
            onClick={onTogglePlay}
            testId="game-music-playpause"
            aria-label={isPlaying ? labels.pause : labels.play}
            hoverStyle={btnHover}
            color="#ffffff"
            backgroundColor="rgba(129,140,248,0.25)"
            borderWidth={1}
            borderColor="rgba(129,140,248,0.3)"
          >
            {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </IconButton>
          <IconButton
            circular
            size="md"
            className="game-music-btn"
            onClick={onStop}
            testId="game-music-stop"
            aria-label={labels.stop}
            hoverStyle={btnHover}
            color="rgba(255,255,255,0.8)"
          >
            <StopIcon size={14} />
          </IconButton>
          <IconButton
            circular
            size="md"
            className="game-music-btn"
            onClick={onNext}
            testId="game-music-next"
            aria-label={labels.next}
            hoverStyle={btnHover}
            color="rgba(255,255,255,0.8)"
          >
            <SkipForwardIcon size={16} />
          </IconButton>
          <IconButton
            circular
            size="md"
            className="game-music-btn"
            onClick={onCycleRepeat}
            testId="game-music-repeat"
            aria-label={
              repeat === 'off'
                ? labels.repeatOff
                : repeat === 'all'
                  ? labels.repeatAll
                  : labels.repeatOne
            }
            hoverStyle={btnHover}
            color={repeat !== 'off' ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            {repeat === 'one' ? (
              <RepeatOneIcon size={15} />
            ) : (
              <RepeatIcon size={15} />
            )}
          </IconButton>
          <IconButton
            circular
            size="md"
            className="game-music-btn"
            onClick={onTogglePlaylist}
            testId="game-music-playlist-toggle"
            aria-label={
              playlistOpen ? labels.playlistHide : labels.playlistShow
            }
            hoverStyle={btnHover}
            color={playlistOpen ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            <PlaylistIcon size={15} />
          </IconButton>
        </XStack>

        <IconButton
          circular
          size="md"
          className="game-music-btn"
          onClick={onToggleMiniMode}
          testId="game-music-minimize"
          aria-label={labels.minimize}
          hoverStyle={btnHover}
          color="rgba(255,255,255,0.3)"
        >
          <MinimizeIcon size={14} />
        </IconButton>
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
      <IconButton
        circular
        size="lg"
        className="game-music-btn game-music-play-btn"
        onClick={onTogglePlay}
        testId="game-music-playpause"
        aria-label={isPlaying ? labels.pause : labels.play}
        hoverStyle={btnHover}
        color="#ffffff"
        backgroundColor="rgba(129,140,248,0.25)"
        borderWidth={1}
        borderColor="rgba(129,140,248,0.3)"
      >
        {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </IconButton>
      <IconButton
        circular
        size="md"
        className="game-music-btn"
        onClick={onToggleMiniMode}
        testId="game-music-maximize"
        aria-label={labels.maximize}
        hoverStyle={btnHover}
        color="rgba(255,255,255,0.4)"
      >
        <MaximizeIcon size={14} />
      </IconButton>
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
    <XStack width="100%" alignItems="center" gap="$2" paddingHorizontal={4}>
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
