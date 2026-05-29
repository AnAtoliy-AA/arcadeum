import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { GameMusic, trackForGame } from './GameMusic';

// Controllable mock of the music setting.
let musicEnabled = false;
vi.mock('@/shared/hooks/useMusicSetting', () => ({
  useMusicSetting: () => ({ musicEnabled, setMusicEnabled: vi.fn() }),
}));

const created: FakeAudio[] = [];

class FakeAudio {
  loop = false;
  volume = 1;
  preload = 'none';
  src: string;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  constructor(src: string) {
    this.src = src;
    created.push(this);
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

  it('stops and releases the track on unmount', () => {
    musicEnabled = true;
    const { unmount } = render(<GameMusic gameId="tic_tac_toe_v1" />);
    unmount();
    expect(lastAudioEl().pause).toHaveBeenCalled();
    expect(lastAudioEl().src).toBe('');
  });

  it('trackForGame is deterministic and falls back to the first track', () => {
    expect(trackForGame()).toBe('/sounds/fleet-at-dawn-1.mp3');
    expect(trackForGame('sea_battle_v1')).toBe(trackForGame('sea_battle_v1'));
    expect(trackForGame('sea_battle_v1')).toMatch(/fleet-at-dawn-[12]\.mp3$/);
  });
});
