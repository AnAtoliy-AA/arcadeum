'use client';

import { useEffect, useRef, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import type { RepeatMode } from './GameMusicUtils';
import { PlaylistIcon, MinimizeIcon, MaximizeIcon } from './GameMusicVisuals';
import { VolumeIcon, MusicBtn, PlayBtn } from './GameMusicButtons';

interface TransportRowProps {
  isPlaying: boolean;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onStop?: () => void;
  labels: {
    play: string;
    pause: string;
    prev: string;
    next: string;
    stop: string;
  };
  size?: 'sm' | 'md';
}

function TransportRow({
  isPlaying,
  onPrev,
  onTogglePlay,
  onNext,
  onStop,
  labels,
  size = 'md',
}: TransportRowProps) {
  const iconSize = size === 'sm' ? 14 : 18;
  const playIconSize = size === 'sm' ? 16 : 22;
  const stopIconSize = size === 'sm' ? 12 : 16;
  const gap = size === 'sm' ? 4 : 6;

  return (
    <XStack alignItems="center" justifyContent="center" gap={gap}>
      <MusicBtn
        onClick={onPrev}
        testId="game-music-prev"
        ariaLabel={labels.prev}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
        </svg>
      </MusicBtn>
      <PlayBtn
        onClick={onTogglePlay}
        testId="game-music-playpause"
        ariaLabel={isPlaying ? labels.pause : labels.play}
      >
        {isPlaying ? (
          <svg
            width={playIconSize}
            height={playIconSize}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        ) : (
          <svg
            width={playIconSize}
            height={playIconSize}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 4.5v15a1 1 0 0 0 1.54.84l11.5-7.5a1 1 0 0 0 0-1.68L8.54 3.66A1 1 0 0 0 7 4.5Z" />
          </svg>
        )}
      </PlayBtn>
      <MusicBtn
        onClick={onNext}
        testId="game-music-next"
        ariaLabel={labels.next}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z" />
        </svg>
      </MusicBtn>
      {onStop && (
        <MusicBtn
          onClick={onStop}
          testId="game-music-stop"
          ariaLabel={labels.stop}
        >
          <svg
            width={stopIconSize}
            height={stopIconSize}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </MusicBtn>
      )}
    </XStack>
  );
}

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
  onSkipForward: () => void;
  onSkipBack: () => void;
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
    skipForward: string;
    skipBack: string;
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
  onSkipForward,
  onSkipBack,
  labels,
}: TransportControlsProps) {
  return (
    <YStack gap={10}>
      <XStack alignItems="center" gap="$2" paddingHorizontal={4}>
        <XStack
          className="game-music-volume-icon"
          flexShrink={0}
          minWidth={32}
          justifyContent="flex-start"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
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
        <Text
          fontSize={10}
          className="game-music-time"
          color="rgba(255,255,255,0.55)"
          minWidth={32}
          fontWeight="500"
          textAlign="right"
        >
          {Math.round(volume * 100)}%
        </Text>
      </XStack>

      <TransportRow
        isPlaying={isPlaying}
        onPrev={onPrev}
        onTogglePlay={onTogglePlay}
        onNext={onNext}
        onStop={onStop}
        labels={labels}
      />

      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={2}
      >
        <XStack alignItems="center" gap={4}>
          <MusicBtn
            onClick={onToggleShuffle}
            testId="game-music-shuffle"
            ariaLabel={shuffle ? labels.shuffleOn : labels.shuffleOff}
            color={shuffle ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
              <path d="m18 2 4 4-4 4" />
              <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
              <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
              <path d="m18 14 4 4-4 4" />
            </svg>
          </MusicBtn>
          <MusicBtn
            onClick={onSkipBack}
            testId="game-music-skip-back"
            ariaLabel={labels.skipBack}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 20 9 12l10-8v16zM5 19V5h2v14H5z" />
            </svg>
          </MusicBtn>
          <MusicBtn
            onClick={onSkipForward}
            testId="game-music-skip-forward"
            ariaLabel={labels.skipForward}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 4l10 8-10 8V4zM19 5v14h-2V5h2z" />
            </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m17 2 4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                <text
                  x="12"
                  y="15"
                  textAnchor="middle"
                  fill="currentColor"
                  stroke="none"
                  fontSize="8"
                  fontWeight="bold"
                >
                  1
                </text>
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m17 2 4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
            )}
          </MusicBtn>
        </XStack>
        <XStack alignItems="center" gap={4}>
          <MusicBtn
            onClick={onTogglePlaylist}
            testId="game-music-playlist-toggle"
            ariaLabel={playlistOpen ? labels.playlistHide : labels.playlistShow}
            color={playlistOpen ? '#818cf8' : 'rgba(255,255,255,0.4)'}
          >
            <PlaylistIcon size={16} />
          </MusicBtn>
          <MusicBtn
            onClick={onToggleMiniMode}
            testId="game-music-minimize"
            ariaLabel={labels.minimize}
            color="rgba(255,255,255,0.3)"
          >
            <MinimizeIcon size={14} />
          </MusicBtn>
        </XStack>
      </XStack>
    </YStack>
  );
}
interface MiniControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleMiniMode: () => void;
  labels: {
    play: string;
    pause: string;
    prev: string;
    next: string;
    stop: string;
    maximize: string;
  };
}

export function MiniControls({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onToggleMiniMode,
  labels,
}: MiniControlsProps) {
  return (
    <XStack alignItems="center" gap={4}>
      <TransportRow
        isPlaying={isPlaying}
        onPrev={onPrev}
        onTogglePlay={onTogglePlay}
        onNext={onNext}
        labels={labels}
        size="sm"
      />
      <MusicBtn
        onClick={onToggleMiniMode}
        testId="game-music-maximize"
        ariaLabel={labels.maximize}
        color="rgba(255,255,255,0.4)"
      >
        <MaximizeIcon size={14} />
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
  const [smoothTime, setSmoothTime] = useState(currentTime);
  const lastUpdateRef = useRef(currentTime);
  const rafRef = useRef(0);

  useEffect(() => {
    lastUpdateRef.current = currentTime;
  });

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setSmoothTime((prev) => {
        const target = lastUpdateRef.current;
        if (Math.abs(prev - target) > 0.5) return target;
        if (duration <= 0) return target;
        const next = prev + dt;
        return next > duration ? duration : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);
  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (smoothTime / duration) * 100 : 0;

  return (
    <XStack width="100%" alignItems="center" gap="$2" paddingHorizontal={4}>
      <Text
        fontSize={10}
        className="game-music-time"
        color="rgba(255,255,255,0.55)"
        minWidth={32}
        fontWeight="500"
      >
        {formatTime(smoothTime)}
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
        fontSize={10}
        className="game-music-time"
        color="rgba(255,255,255,0.55)"
        minWidth={32}
        fontWeight="500"
        textAlign="right"
      >
        {formatTime(duration)}
      </Text>
    </XStack>
  );
}
