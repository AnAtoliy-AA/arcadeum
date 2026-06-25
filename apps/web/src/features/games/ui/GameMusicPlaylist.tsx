'use client';

import { Text, XStack, YStack } from 'tamagui';
import { TRACKS } from './GameMusicUtils';
import { PlayingBars } from './GameMusicVisuals';

interface PlaylistProps {
  index: number;
  isPlaying: boolean;
  enabledTracks: Set<number>;
  onToggleTrack: (trackIndex: number) => void;
}

export function Playlist({
  index,
  isPlaying,
  enabledTracks,
  onToggleTrack,
}: PlaylistProps) {
  return (
    <YStack
      testID="game-music-playlist"
      className="game-music-playlist"
      gap={2}
      paddingBottom="$1.5"
      marginBottom="$1"
      borderBottomWidth={1}
      borderBottomColor="rgba(255,255,255,0.08)"
    >
      <Text
        fontSize={10}
        fontWeight="600"
        color="rgba(255,255,255,0.45)"
        letterSpacing={0.5}
        textTransform="uppercase"
        paddingHorizontal="$1"
        marginBottom={2}
      >
        Playlist
      </Text>
      {TRACKS.map((track, i) => {
        const isActive = i === index;
        const isEnabled = enabledTracks.has(i);

        return (
          <XStack
            key={track.src}
            className={`game-music-track${isActive ? ' active' : ''}`}
            alignItems="center"
            gap="$2"
            opacity={isEnabled ? 1 : 0.35}
          >
            <input
              className="game-music-checkbox"
              type="checkbox"
              checked={isEnabled}
              disabled={isActive && enabledTracks.size === 1}
              onChange={() => onToggleTrack(i)}
              aria-label={`Toggle ${track.title}`}
              data-testid={`game-music-track-toggle-${i}`}
            />
            <Text
              fontSize={10}
              color={
                isActive ? 'rgba(129,140,248,0.7)' : 'rgba(255,255,255,0.3)'
              }
              minWidth={16}
              fontWeight="500"
            >
              {String(i + 1).padStart(2, '0')}
            </Text>
            <Text
              flex={1}
              fontSize={12}
              color={
                isActive
                  ? '#a5b4fc'
                  : isEnabled
                    ? 'rgba(255,255,255,0.75)'
                    : 'rgba(255,255,255,0.4)'
              }
              fontWeight={isActive ? '600' : '400'}
              numberOfLines={1}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {track.title}
            </Text>
            {isActive && isPlaying && <PlayingBars />}
          </XStack>
        );
      })}
    </YStack>
  );
}
