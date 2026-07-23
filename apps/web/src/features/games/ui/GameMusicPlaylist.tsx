'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Text, XStack, YStack } from 'tamagui';
import {
  type MusicTrack,
  formatTime,
  SPRITE_URL,
  SPRITE_SIZE,
  SPRITE_COLS,
} from './GameMusicUtils';
import { PlayingBars } from './GameMusicVisuals';

interface SortableTrackItemProps {
  track: MusicTrack;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  isEnabled: boolean;
  duration: number;
  onToggleTrack: (trackIndex: number) => void;
  onPlay: (trackIndex: number) => void;
}

function SortableTrackItem({
  track,
  index,
  isActive,
  isPlaying,
  isEnabled,
  duration,
  onToggleTrack,
  onPlay,
}: SortableTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.src });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <XStack
        className={`game-music-track${isActive ? ' active' : ''}`}
        alignItems="center"
        gap="$2"
        opacity={isEnabled ? 1 : 0.35}
        onDoubleClick={() => onPlay(index)}
      >
        <div
          className="game-music-drag-handle"
          {...attributes}
          {...listeners}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            padding: '8px 6px',
            margin: '-8px -6px',
            touchAction: 'none',
            minWidth: '32px',
            minHeight: '32px',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2" cy="2" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="6" cy="2" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="10" cy="2" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="2" cy="6" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="6" cy="6" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="10" cy="6" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="2" cy="10" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="6" cy="10" r="1.2" fill="rgba(255,255,255,0.5)" />
            <circle cx="10" cy="10" r="1.2" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>
        <input
          className="game-music-checkbox"
          type="checkbox"
          checked={isEnabled}
          disabled={isActive && isEnabled}
          onChange={() => onToggleTrack(index)}
          aria-label={`Toggle ${track.title}`}
          data-testid={`game-music-track-toggle-${index}`}
        />
        {track.spriteIndex != null ? (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              flexShrink: 0,
              backgroundImage: `url(${SPRITE_URL})`,
              backgroundPosition: `-${(track.spriteIndex % SPRITE_COLS) * SPRITE_SIZE}px -${Math.floor(track.spriteIndex / SPRITE_COLS) * SPRITE_SIZE}px`,
              backgroundSize: 'auto',
            }}
          />
        ) : (
          <Text
            fontSize={10}
            color={
              isActive ? 'rgba(165,180,252,0.9)' : 'rgba(255,255,255,0.45)'
            }
            minWidth={16}
            fontWeight="500"
          >
            {String(index + 1).padStart(2, '0')}
          </Text>
        )}
        <Text
          flex={1}
          fontSize={12}
          color={
            isActive
              ? '#c4d0fc'
              : isEnabled
                ? 'rgba(255,255,255,0.85)'
                : 'rgba(255,255,255,0.5)'
          }
          fontWeight={isActive ? '600' : '400'}
          numberOfLines={1}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {track.title}
        </Text>
        {duration > 0 && (
          <Text
            fontSize={10}
            color="rgba(255,255,255,0.35)"
            minWidth={32}
            textAlign="right"
            flexShrink={0}
          >
            {formatTime(duration)}
          </Text>
        )}
        {isActive && isPlaying ? (
          <PlayingBars />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(index);
            }}
            data-testid={`game-music-track-play-${index}`}
            aria-label={`Play ${track.title}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              flexShrink: 0,
              padding: 0,
              transition: 'background-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4.5v15a1 1 0 0 0 1.54.84l11.5-7.5a1 1 0 0 0 0-1.68L8.54 3.66A1 1 0 0 0 7 4.5Z" />
            </svg>
          </button>
        )}
      </XStack>
    </div>
  );
}

interface PlaylistProps {
  tracks: readonly MusicTrack[];
  index: number;
  isPlaying: boolean;
  enabledTracks: Set<number>;
  trackDurations: Record<string, number>;
  onToggleTrack: (trackIndex: number) => void;
  onReorder: (newTracks: readonly MusicTrack[]) => void;
  onPlay: (trackIndex: number) => void;
}

type SortMode =
  | 'default'
  | 'title-asc'
  | 'title-desc'
  | 'duration-asc'
  | 'duration-desc';

export function Playlist({
  tracks,
  index,
  isPlaying,
  enabledTracks,
  trackDurations,
  onToggleTrack,
  onReorder,
  onPlay,
}: PlaylistProps) {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const filteredTracks = useMemo(() => {
    let result = [...tracks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    if (sortMode !== 'default') {
      result.sort((a, b) => {
        switch (sortMode) {
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'duration-asc':
            return (a.duration ?? 0) - (b.duration ?? 0);
          case 'duration-desc':
            return (b.duration ?? 0) - (a.duration ?? 0);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [tracks, search, sortMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tracks.findIndex((t) => t.src === active.id);
      const newIndex = tracks.findIndex((t) => t.src === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTracks = arrayMove([...tracks], oldIndex, newIndex);
        onReorder(newTracks);
      }
    },
    [tracks, onReorder],
  );

  return (
    <YStack
      testID="game-music-playlist"
      className="game-music-playlist"
      gap={4}
      paddingBottom="$1.5"
      marginBottom="$1"
      borderBottomWidth={1}
      borderBottomColor="rgba(255,255,255,0.08)"
    >
      <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
        <Text
          fontSize={10}
          fontWeight="600"
          color="rgba(255,255,255,0.6)"
          letterSpacing={0.5}
          textTransform="uppercase"
        >
          Playlist
        </Text>
        <Text fontSize={10} color="rgba(255,255,255,0.35)">
          {filteredTracks.length}/{tracks.length}
        </Text>
      </XStack>
      <XStack gap="$2" paddingHorizontal="$1">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            fontSize: 11,
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)',
            outline: 'none',
          }}
        />
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          style={{
            fontSize: 11,
            padding: '4px 6px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="default">Default</option>
          <option value="title-asc">Title A→Z</option>
          <option value="title-desc">Title Z→A</option>
          <option value="duration-asc">Duration ↑</option>
          <option value="duration-desc">Duration ↓</option>
        </select>
      </XStack>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTracks.map((t) => t.src)}
          strategy={verticalListSortingStrategy}
        >
          {filteredTracks.map((track) => {
            const realIndex = tracks.findIndex((t) => t.src === track.src);
            const isActive = realIndex === index;
            const isEnabled = enabledTracks.has(realIndex);

            return (
              <SortableTrackItem
                key={track.src}
                track={track}
                index={realIndex}
                isActive={isActive}
                isPlaying={isPlaying}
                isEnabled={isEnabled}
                duration={trackDurations[track.src] ?? track.duration ?? 0}
                onToggleTrack={onToggleTrack}
                onPlay={onPlay}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </YStack>
  );
}
