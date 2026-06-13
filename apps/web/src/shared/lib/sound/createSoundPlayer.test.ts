import { describe, it, expect, vi } from 'vitest';
import { createSoundPlayer, type AudioLike } from './createSoundPlayer';

function makeFakeAudio(): AudioLike & { play: ReturnType<typeof vi.fn> } {
  return {
    currentTime: 5,
    preload: 'none',
    play: vi.fn(() => Promise.resolve()),
    load: vi.fn(),
  };
}

describe('createSoundPlayer', () => {
  it('plays a sound when enabled', () => {
    const audio = makeFakeAudio();
    const player = createSoundPlayer(() => audio);

    player.play('win', true);

    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(audio.currentTime).toBe(0); // rewound before playing
  });

  it('no-ops when sound is disabled', () => {
    const audio = makeFakeAudio();
    const factory = vi.fn(() => audio);
    const player = createSoundPlayer(factory);

    player.play('win', false);

    expect(audio.play).not.toHaveBeenCalled();
    expect(factory).not.toHaveBeenCalled(); // no audio even created
  });

  it('reuses one cached audio element per sound id', () => {
    const factory = vi.fn(() => makeFakeAudio());
    const player = createSoundPlayer(factory);

    player.play('click', true);
    player.play('click', true);
    player.play('coin', true);

    // click created once, coin created once → two unique elements total
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('swallows playback rejections', () => {
    const audio: AudioLike = {
      currentTime: 0,
      play: () => Promise.reject(new Error('autoplay blocked')),
    };
    const player = createSoundPlayer(() => audio);

    expect(() => player.play('win', true)).not.toThrow();
  });

  it('preloadAll warms every registered sound', () => {
    const factory = vi.fn(() => makeFakeAudio());
    const player = createSoundPlayer(factory);

    player.preloadAll();

    // one element per entry in the manifest (win, lose, click, coin)
    expect(factory).toHaveBeenCalledTimes(4);
  });
});
