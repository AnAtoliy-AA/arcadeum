import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render as rtlRender,
  cleanup,
  fireEvent,
  screen,
  act,
} from '@testing-library/react';
import { GameMusic } from './GameMusic';
import { trackIndexForGame, FALLBACK_TRACKS } from './GameMusicUtils';
import {
  loadStoredSettings,
  saveStoredSettings,
} from '@/shared/lib/settings-storage';

vi.mock('./GameMusicUtils', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./GameMusicUtils')>();
  return {
    ...mod,
    fetchTracks: vi.fn().mockResolvedValue(mod.FALLBACK_TRACKS),
  };
});

const render = (ui: React.ReactElement) => rtlRender(ui);

// Controllable mock of the music setting.
let musicEnabled = false;
export const setMusicEnabledMock = vi.fn();
vi.mock('@/shared/hooks/useMusicSetting', () => ({
  useMusicSetting: () => ({
    musicEnabled,
    setMusicEnabled: setMusicEnabledMock,
  }),
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
  removeAttribute(name: string) {
    if (name === 'src') this.src = '';
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
  return created[created.length - 1] ?? created[0];
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
  setMusicEnabledMock.mockClear();
  window.localStorage.clear();
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

const showPlayer = async () => {
  await flushPromises();
  flushAct();
};

const flushAct = () => {
  act(() => {
    flushRaf();
  });
};

const flushPromises = () => act(() => Promise.resolve());

describe('GameMusic', () => {
  it('renders nothing and creates no audio while music is disabled', () => {
    musicEnabled = false;
    render(<GameMusic gameId="sea_battle_v1" />);
    expect(created).toHaveLength(0);
    expect(screen.queryByTestId('game-music-player')).toBeNull();
  });

  it('shows the player and loads a track when enabled', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="cascade_v1" />);
    await showPlayer();
    expect(screen.getByTestId('game-music-player')).toBeTruthy();
    expect(mainAudioEl().volume).toBeGreaterThan(0);
    expect(mainAudioEl().volume).toBeLessThanOrEqual(1);
    expect(mainAudioEl().src).toContain('/music/');
  });

  it('disables music when the player is closed', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    expect(screen.getByTestId('game-music-player')).toBeTruthy();
    fireEvent.click(screen.getByTestId('game-music-close'));
    expect(setMusicEnabledMock).toHaveBeenCalledWith(false);
  });

  it('restores the last played track from persisted state', async () => {
    saveStoredSettings({ musicLastPlayedIndex: 2 });
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    expect(mainAudioEl().src).toContain(FALLBACK_TRACKS[2].src);
  });

  it('persists the last played track index when changing tracks', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    fireEvent.click(screen.getByTestId('game-music-next'));
    flushAct();
    const saved = loadStoredSettings().musicLastPlayedIndex;
    expect(typeof saved).toBe('number');
    expect(FALLBACK_TRACKS[saved!]?.src).toBe(mainAudioEl().src);
  });

  it('restores unchecked tracks after a reload', async () => {
    saveStoredSettings({
      musicEnabledTracks: FALLBACK_TRACKS.map((_, i) => i).filter(
        (i) => i !== 4,
      ),
    });
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    fireEvent.click(screen.getByTestId('game-music-playlist-toggle'));
    const unchecked = screen.getByTestId(
      'game-music-track-toggle-4',
    ) as HTMLInputElement;
    expect(unchecked.checked).toBe(false);
    const checked = screen.getByTestId(
      'game-music-track-toggle-0',
    ) as HTMLInputElement;
    expect(checked.checked).toBe(true);
  });

  it('starts at the default volume and applies slider changes to the audio', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    const audio = mainAudioEl();
    expect(audio.volume).toBeCloseTo(0.3);

    fireEvent.change(screen.getByTestId('game-music-volume'), {
      target: { value: '60' },
    });
    expect(audio.volume).toBeCloseTo(0.6);
  });

  it('pauses and resumes via the play/pause control', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    const audio = mainAudioEl();
    // Music does not auto-play on mount — starts paused.
    expect(audio.paused).toBe(true);

    fireEvent.click(screen.getByTestId('game-music-playpause'));
    expect(audio.play).toHaveBeenCalled();
    expect(audio.paused).toBe(false);

    fireEvent.click(screen.getByTestId('game-music-playpause'));
    expect(audio.paused).toBe(true);
  });

  it('stops playback and rewinds to the start', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    const audio = mainAudioEl();
    audio.currentTime = 42;
    fireEvent.click(screen.getByTestId('game-music-stop'));
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it('skips to a different track with next', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    const before = mainAudioEl().src;
    fireEvent.click(screen.getByTestId('game-music-next'));
    flushAct();
    const after = mainAudioEl().src;
    expect(after).not.toBe(before);
    expect(after).toContain('.mp3');
  });

  it('goes back to a different track with prev', async () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    await showPlayer();
    const before = mainAudioEl().src;
    fireEvent.click(screen.getByTestId('game-music-prev'));
    flushAct();
    expect(mainAudioEl().src).not.toBe(before);
  });

  it('registers media-key handlers so F7/F9 (prev/next) change the track', async () => {
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
    await showPlayer();

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

  it('stops and releases the track on unmount', async () => {
    musicEnabled = true;
    const { unmount } = render(<GameMusic gameId="tic_tac_toe_v1" />);
    await showPlayer();
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
