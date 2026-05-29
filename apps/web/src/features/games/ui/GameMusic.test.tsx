import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render as rtlRender,
  cleanup,
  act,
  screen,
} from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import { config } from '@/shared/config/tamagui.config';
import { GameMusic, trackForGame } from './GameMusic';

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

// Translation is keyed straight through so we can assert on the label key.
vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const created: FakeAudio[] = [];

class FakeAudio {
  loop = false;
  volume = 1;
  preload = 'none';
  src: string;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  private listeners: Record<string, Array<() => void>> = {};
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
  /** Simulate the browser firing the `playing` event. */
  emitPlaying() {
    (this.listeners.playing ?? []).forEach((cb) => cb());
  }
}

const lastAudioEl = () => created[created.length - 1];

beforeEach(() => {
  musicEnabled = false;
  created.length = 0;
  vi.stubGlobal('Audio', FakeAudio);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.unstubAllGlobals();
});

describe('GameMusic', () => {
  it('creates no audio while music is disabled', () => {
    musicEnabled = false;
    render(<GameMusic gameId="sea_battle_v1" />);
    expect(created).toHaveLength(0);
  });

  it('loops a track and plays when music is enabled', () => {
    musicEnabled = true;
    render(<GameMusic gameId="cascade_v1" />);
    expect(lastAudioEl().loop).toBe(true);
    expect(lastAudioEl().volume).toBeGreaterThan(0);
    expect(lastAudioEl().volume).toBeLessThanOrEqual(1);
    expect(lastAudioEl().src).toContain('fleet-at-dawn');
    expect(lastAudioEl().play).toHaveBeenCalledTimes(1);
  });

  it('shows the now-playing chip only once playback actually starts', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    // Nothing shown until the audio element reports it is playing.
    expect(screen.queryByTestId('game-music-now-playing')).toBeNull();

    act(() => lastAudioEl().emitPlaying());
    const chip = screen.getByTestId('game-music-now-playing');
    expect(chip.textContent).toContain('settings.musicNowPlaying');
    expect(chip.textContent).toContain('Fleet at Dawn');
  });

  it('auto-dismisses the chip after a few seconds', () => {
    musicEnabled = true;
    render(<GameMusic gameId="sea_battle_v1" />);
    act(() => lastAudioEl().emitPlaying());
    expect(screen.queryByTestId('game-music-now-playing')).not.toBeNull();
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByTestId('game-music-now-playing')).toBeNull();
  });

  it('stops and releases the track on unmount', () => {
    musicEnabled = true;
    const { unmount } = render(<GameMusic gameId="tic_tac_toe_v1" />);
    unmount();
    expect(lastAudioEl().pause).toHaveBeenCalled();
    expect(lastAudioEl().src).toBe('');
  });

  it('trackForGame is deterministic and falls back to the first track', () => {
    expect(trackForGame().src).toBe('/sounds/fleet-at-dawn-1.mp3');
    expect(trackForGame('sea_battle_v1').src).toBe(
      trackForGame('sea_battle_v1').src,
    );
    expect(trackForGame('sea_battle_v1').src).toMatch(/fleet-at-dawn-[12]\.mp3$/);
    expect(trackForGame('sea_battle_v1').title).toBeTruthy();
  });
});
