import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render as rtlRender,
  cleanup,
  fireEvent,
  screen,
  act,
} from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import { config } from '@/shared/config/tamagui.config';
import { GameMusic } from './GameMusic';
import { trackForGame, trackIndexForGame, TRACKS } from './GameMusicUtils';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

// Controllable mock of the music setting.
let musicEnabled = false;
vi.mock('@/shared/hooks/useMusicSetting', () => ({
  useMusicSetting: () => ({ musicEnabled, setMusicEnabled: vi.fn() }),
}));

// Translation is keyed straight through so we can assert on the label keys.
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const created: FakeAudio[] = [];

class FakeAudio {
  loop = false;
  volume = 1;
  preload = 'none';
  currentTime = 0;
  paused = true;
  src: string;
  private listeners: Record<string, Array<() => void>> = {};
  play = vi.fn(() => {
    this.paused = false;
    this.emit('play');
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
    this.emit('pause');
  });
  constructor(src: string) {
    this.src = src;
    created.push(this);
  }
  addEventListener(type: string, cb: () => void) {
    (this.listeners[type] ??= []).push(cb);
  }
  removeEventListener(type: string, cb: () => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((c) => c !== cb);
  }
  emit(type: string) {
    (this.listeners[type] ?? []).forEach((cb) => cb());
  }
}

const lastAudioEl = () => created[created.length - 1];

beforeEach(() => {
  musicEnabled = false;
  created.length = 0;
  vi.stubGlobal('Audio', FakeAudio);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('GameMusic', () => {
  it('renders nothing and creates no audio while music is disabled', () => {
    musicEnabled = false;
    render(<GameMusic gameId="sea_battle_v1" />);
    expect(created).toHaveLength(0);
    expect(screen.queryByTestId('game-music-player')).toBeNull();
  });

  it('shows the player and auto-plays a looping track when enabled', () => {
    musicEnabled = true;
    render(<GameMusic gameId="cascade_v1" />);
    expect(screen.getByTestId('game-music-player')).toBeTruthy();
    expect(lastAudioEl().loop).toBe(true);
    expect(lastAudioEl().volume).toBeGreaterThan(0);
    expect(lastAudioEl().volume).toBeLessThanOrEqual(1);
    expect(lastAudioEl().src).toContain('/music/');
    expect(lastAudioEl().play).toHaveBeenCalledTimes(1);
  });

  it('starts at the default volume and applies slider changes to the audio', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    const audio = lastAudioEl();
    expect(audio.volume).toBeCloseTo(0.3);

    fireEvent.change(screen.getByTestId('game-music-volume'), {
      target: { value: '60' },
    });
    expect(audio.volume).toBeCloseTo(0.6);
  });

  it('pauses and resumes via the play/pause control', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    const audio = lastAudioEl();
    // Autoplay leaves it playing.
    expect(audio.paused).toBe(false);

    fireEvent.click(screen.getByTestId('game-music-playpause'));
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.paused).toBe(true);

    fireEvent.click(screen.getByTestId('game-music-playpause'));
    expect(audio.paused).toBe(false);
  });

  it('stops playback and rewinds to the start', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    const audio = lastAudioEl();
    audio.currentTime = 42;
    fireEvent.click(screen.getByTestId('game-music-stop'));
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it('skips to a different track with next', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    const before = lastAudioEl().src;
    fireEvent.click(screen.getByTestId('game-music-next'));
    const after = lastAudioEl().src;
    expect(after).not.toBe(before);
    expect(after).toContain('/music/');
  });

  it('goes back to a different track with prev', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    const before = lastAudioEl().src;
    fireEvent.click(screen.getByTestId('game-music-prev'));
    expect(lastAudioEl().src).not.toBe(before);
  });

  it('registers media-key handlers so F7/F9 (prev/next) change the track', () => {
    musicEnabled = true;
    const handlers: Record<string, MediaSessionActionHandler | null> = {};
    const mediaSession = {
      metadata: null,
      playbackState: 'none',
      setActionHandler: vi.fn(
        (action: string, cb: MediaSessionActionHandler | null) => {
          handlers[action] = cb;
        },
      ),
    };
    vi.stubGlobal('navigator', { ...globalThis.navigator, mediaSession });
    vi.stubGlobal(
      'MediaMetadata',
      class {
        constructor(public init: unknown) {}
      },
    );

    render(<GameMusic gameId="sea_battle_v1" />);

    expect(mediaSession.setActionHandler).toHaveBeenCalledWith(
      'nexttrack',
      expect.any(Function),
    );
    expect(mediaSession.setActionHandler).toHaveBeenCalledWith(
      'previoustrack',
      expect.any(Function),
    );

    const before = lastAudioEl().src;
    act(() => handlers.nexttrack?.(undefined as never));
    expect(lastAudioEl().src).not.toBe(before);
  });

  it('stops and releases the track on unmount', () => {
    musicEnabled = true;
    const { unmount } = render(<GameMusic gameId="tic_tac_toe_v1" />);
    const audio = lastAudioEl();
    unmount();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.src).toBe('');
  });

  it('trackIndexForGame / trackForGame are deterministic with a safe fallback', () => {
    expect(trackForGame().src).toContain('battleship-grid.mp3');
    expect(trackIndexForGame()).toBe(0);
    expect(trackIndexForGame('sea_battle_v1')).toBe(
      trackIndexForGame('sea_battle_v1'),
    );
    expect(trackForGame('sea_battle_v1').src).toContain('/music/');
    expect(trackForGame('sea_battle_v1').title).toBeTruthy();
  });

  it('all track titles are unique', () => {
    const titles = TRACKS.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
