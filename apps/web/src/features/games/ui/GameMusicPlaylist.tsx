'use client';

import { useCallback } from 'react';
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
import { type MusicTrack } from './GameMusicUtils';
import { PlayingBars } from './GameMusicVisuals';

interface SortableTrackItemProps {
  track: MusicTrack;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  isEnabled: boolean;
  onToggleTrack: (trackIndex: number) => void;
  onPlay: (trackIndex: number) => void;
}

function SortableTrackItem({
  track,
  index,
  isActive,
  isPlaying,
  isEnabled,
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
        <Text
          fontSize={10}
          color={isActive ? 'rgba(165,180,252,0.9)' : 'rgba(255,255,255,0.45)'}
          minWidth={16}
          fontWeight="500"
        >
          {String(index + 1).padStart(2, '0')}
        </Text>
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
  onToggleTrack: (trackIndex: number) => void;
  onReorder: (newTracks: readonly MusicTrack[]) => void;
  onPlay: (trackIndex: number) => void;
}

export function Playlist({
  tracks,
  index,
  isPlaying,
  enabledTracks,
  onToggleTrack,
  onReorder,
  onPlay,
}: PlaylistProps) {
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
      <Text
        fontSize={10}
        fontWeight="600"
        color="rgba(255,255,255,0.6)"
        letterSpacing={0.5}
        textTransform="uppercase"
        paddingHorizontal="$1"
        marginBottom={2}
      >
        Playlist
      </Text>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tracks.map((t) => t.src)}
          strategy={verticalListSortingStrategy}
        >
          {tracks.map((track, i) => {
            const isActive = i === index;
            const isEnabled = enabledTracks.has(i);

            return (
              <SortableTrackItem
                key={track.src}
                track={track}
                index={i}
                isActive={isActive}
                isPlaying={isPlaying}
                isEnabled={isEnabled}
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
