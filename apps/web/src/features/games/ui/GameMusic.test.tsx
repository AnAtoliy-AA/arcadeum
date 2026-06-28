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
import { trackIndexForGame, FALLBACK_TRACKS } from './GameMusicUtils';

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
  duration = 180;
  paused = true;
  src = '';
  _isPreloader = false;
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
  constructor(src?: string) {
    if (src) this.src = src;
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

const mainAudioEl = () => {
  for (let i = created.length - 1; i >= 0; i--) {
    if (created[i].src && !created[i].paused) return created[i];
  }
  for (let i = created.length - 1; i >= 0; i--) {
    if (created[i].src) return created[i];
  }
  return created[0];
};

const rafQueue: Array<{ id: number; cb: FrameRequestCallback }> = [];
let rafId = 0;
let rafTime = 0;

function flushRaf(maxFrames = 20) {
  for (let i = 0; i < maxFrames && rafQueue.length > 0; i++) {
    const batch = [...rafQueue];
    rafQueue.length = 0;
    for (const { cb } of batch) {
      rafTime += 100;
      cb(rafTime);
    }
  }
}

beforeEach(() => {
  musicEnabled = false;
  created.length = 0;
  rafQueue.length = 0;
  rafId = 0;
  rafTime = 0;
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = ++rafId;
    rafQueue.push({ id, cb });
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    const idx = rafQueue.findIndex((r) => r.id === id);
    if (idx !== -1) rafQueue.splice(idx, 1);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const showPlayer = () => {
  act(() => {
    window.dispatchEvent(new CustomEvent('arcadeum:toggle-music'));
  });
  flushAct();
};

const flushAct = () => {
  act(() => {
    flushRaf();
  });
};

describe('GameMusic', () => {
  it('renders nothing and creates no audio while music is disabled', () => {
    musicEnabled = false;
    render(<GameMusic gameId="sea_battle_v1" />);
    expect(created).toHaveLength(0);
    expect(screen.queryByTestId('game-music-player')).toBeNull();
  });

  it('shows the player and auto-plays a track when enabled', () => {
    musicEnabled = true;
    render(<GameMusic gameId="cascade_v1" />);
    showPlayer();
    expect(screen.getByTestId('game-music-player')).toBeTruthy();
    expect(mainAudioEl().volume).toBeGreaterThan(0);
    expect(mainAudioEl().volume).toBeLessThanOrEqual(1);
    expect(mainAudioEl().src).toContain('/music/');
    expect(mainAudioEl().play).toHaveBeenCalledTimes(1);
  });

  it('starts at the default volume and applies slider changes to the audio', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    showPlayer();
    const audio = mainAudioEl();
    expect(audio.volume).toBeCloseTo(0.3);

    fireEvent.change(screen.getByTestId('game-music-volume'), {
      target: { value: '60' },
    });
    expect(audio.volume).toBeCloseTo(0.6);
  });

  it('pauses and resumes via the play/pause control', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    showPlayer();
    const audio = mainAudioEl();
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
    showPlayer();
    const audio = mainAudioEl();
    audio.currentTime = 42;
    fireEvent.click(screen.getByTestId('game-music-stop'));
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it('skips to a different track with next', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    showPlayer();
    const before = mainAudioEl().src;
    fireEvent.click(screen.getByTestId('game-music-next'));
    flushAct();
    const after = mainAudioEl().src;
    expect(after).not.toBe(before);
    expect(after).toContain('.mp3');
  });

  it('goes back to a different track with prev', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    showPlayer();
    const before = mainAudioEl().src;
    fireEvent.click(screen.getByTestId('game-music-prev'));
    flushAct();
    expect(mainAudioEl().src).not.toBe(before);
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
    showPlayer();

    expect(mediaSession.setActionHandler).toHaveBeenCalledWith(
      'nexttrack',
      expect.any(Function),
    );
    expect(mediaSession.setActionHandler).toHaveBeenCalledWith(
      'previoustrack',
      expect.any(Function),
    );

    const before = mainAudioEl().src;
    act(() => handlers.nexttrack?.(undefined as never));
    flushAct();
    expect(mainAudioEl().src).not.toBe(before);
  });

  it('stops and releases the track on unmount', () => {
    musicEnabled = true;
    const { unmount } = render(<GameMusic gameId="tic_tac_toe_v1" />);
    showPlayer();
    const audio = mainAudioEl();
    unmount();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.src).toBe('');
  });

  it('trackIndexForGame is deterministic with a safe fallback', () => {
    const trackCount = FALLBACK_TRACKS.length;
    expect(trackIndexForGame(null, trackCount)).toBe(0);
    expect(trackIndexForGame('sea_battle_v1', trackCount)).toBe(
      trackIndexForGame('sea_battle_v1', trackCount),
    );
    expect(
      FALLBACK_TRACKS[trackIndexForGame('sea_battle_v1', trackCount)].src,
    ).toContain('/music/');
  });

  it('all track titles are unique', () => {
    const titles = FALLBACK_TRACKS.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
