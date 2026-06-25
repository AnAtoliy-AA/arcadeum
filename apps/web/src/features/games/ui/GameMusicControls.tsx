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

const btnHover = { scale: 1.08 } as const;

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
    <YStack gap="$2">
      <XStack alignItems="center" gap="$2">
        <Text
          fontSize={10}
          color="rgba(255,255,255,0.35)"
          minWidth={16}
          textAlign="center"
        >
          🔈
        </Text>
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
          style={{ flex: 1 }}
        />
      </XStack>

      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap={2}>
          <IconButton
            circular
            size="sm"
            className="game-music-btn"
            onClick={onToggleShuffle}
            testId="game-music-shuffle"
            aria-label={shuffle ? labels.shuffleOn : labels.shuffleOff}
            hoverStyle={btnHover}
            color={shuffle ? '#818cf8' : 'rgba(255,255,255,0.5)'}
          >
            <ShuffleIcon size={13} />
          </IconButton>
          <IconButton
            circular
            size="sm"
            className="game-music-btn"
            onClick={onPrev}
            testId="game-music-prev"
            aria-label={labels.prev}
            hoverStyle={btnHover}
            color="rgba(255,255,255,0.85)"
          >
            <SkipBackIcon size={14} />
          </IconButton>
          <IconButton
            circular
            size="sm"
            className="game-music-btn"
            onClick={onTogglePlay}
            testId="game-music-playpause"
            aria-label={isPlaying ? labels.pause : labels.play}
            hoverStyle={btnHover}
            color="#ffffff"
            backgroundColor="rgba(255,255,255,0.1)"
          >
            {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          </IconButton>
          <IconButton
            circular
            size="sm"
            className="game-music-btn"
            onClick={onStop}
            testId="game-music-stop"
            aria-label={labels.stop}
            hoverStyle={btnHover}
            color="rgba(255,255,255,0.85)"
          >
            <StopIcon size={12} />
          </IconButton>
          <IconButton
            circular
            size="sm"
            className="game-music-btn"
            onClick={onNext}
            testId="game-music-next"
            aria-label={labels.next}
            hoverStyle={btnHover}
            color="rgba(255,255,255,0.85)"
          >
            <SkipForwardIcon size={14} />
          </IconButton>
          <IconButton
            circular
            size="sm"
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
            color={repeat !== 'off' ? '#818cf8' : 'rgba(255,255,255,0.5)'}
          >
            {repeat === 'one' ? (
              <RepeatOneIcon size={13} />
            ) : (
              <RepeatIcon size={13} />
            )}
          </IconButton>
          <IconButton
            circular
            size="sm"
            className="game-music-btn"
            onClick={onTogglePlaylist}
            testId="game-music-playlist-toggle"
            aria-label={
              playlistOpen ? labels.playlistHide : labels.playlistShow
            }
            hoverStyle={btnHover}
            color={playlistOpen ? '#818cf8' : 'rgba(255,255,255,0.5)'}
          >
            <PlaylistIcon size={13} />
          </IconButton>
        </XStack>

        <IconButton
          circular
          size="sm"
          className="game-music-btn"
          onClick={onToggleMiniMode}
          testId="game-music-minimize"
          aria-label={labels.minimize}
          hoverStyle={btnHover}
          color="rgba(255,255,255,0.4)"
        >
          <MinimizeIcon size={12} />
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
    <XStack alignItems="center" justifyContent="center" gap={6}>
      <IconButton
        circular
        size="sm"
        className="game-music-btn"
        onClick={onTogglePlay}
        testId="game-music-playpause"
        aria-label={isPlaying ? labels.pause : labels.play}
        hoverStyle={btnHover}
        color="#ffffff"
        backgroundColor="rgba(255,255,255,0.1)"
      >
        {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
      </IconButton>
      <IconButton
        circular
        size="sm"
        className="game-music-btn"
        onClick={onToggleMiniMode}
        testId="game-music-maximize"
        aria-label={labels.maximize}
        hoverStyle={btnHover}
        color="rgba(255,255,255,0.5)"
      >
        <MaximizeIcon size={12} />
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
    <XStack width="100%" alignItems="center" gap="$1.5" paddingHorizontal={2}>
      <Text
        fontSize={9}
        color="rgba(255,255,255,0.4)"
        minWidth={28}
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
          background: `linear-gradient(to right, #818cf8 ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
        }}
      />
      <Text
        fontSize={9}
        color="rgba(255,255,255,0.4)"
        minWidth={28}
        fontWeight="500"
        textAlign="right"
      >
        {formatTime(duration)}
      </Text>
    </XStack>
  );
}
