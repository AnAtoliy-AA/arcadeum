import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Playlist } from '../ui/GameMusicPlaylist';
import { FALLBACK_TRACKS } from '../lib/GameMusicUtils';

vi.mock('@arcadeum/ui', () => ({
  Typography: ({
    children,
    className,
    style,
  }: {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <span className={className} style={style}>
      {children}
    </span>
  ),
}));

const renderPlaylist = (
  overrides: {
    enabledTracks?: Set<number>;
    onToggleTrack?: (trackIndex: number) => void;
  } = {},
) => {
  const {
    enabledTracks = new Set(FALLBACK_TRACKS.map((_, i) => i)),
    onToggleTrack = vi.fn(),
  } = overrides;
  return render(
    <Playlist
      tracks={FALLBACK_TRACKS}
      index={0}
      isPlaying={false}
      enabledTracks={enabledTracks}
      trackDurations={{}}
      onToggleTrack={onToggleTrack}
      onReorder={vi.fn()}
      onPlay={vi.fn()}
    />,
  );
};

describe('Playlist', () => {
  it('shows the enabled track count when all tracks are checked', () => {
    renderPlaylist();
    expect(
      screen.getByText(`${FALLBACK_TRACKS.length}/${FALLBACK_TRACKS.length}`),
    ).toBeTruthy();
  });

  it('shows a reduced count when tracks are unchecked', () => {
    renderPlaylist({
      enabledTracks: new Set([0, 1, 2]),
    });
    expect(screen.getByText(`3/${FALLBACK_TRACKS.length}`)).toBeTruthy();
  });

  it('calls onToggleTrack when a track checkbox changes', () => {
    const onToggleTrack = vi.fn();
    renderPlaylist({ onToggleTrack });
    fireEvent.click(screen.getByTestId('game-music-track-toggle-3'));
    expect(onToggleTrack).toHaveBeenCalledWith(3);
  });
});
