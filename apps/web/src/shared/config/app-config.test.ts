import { describe, it, expect } from 'vitest';

describe('app-config helpers', () => {
  it('trim should handle various inputs', async () => {
    const { trim } = await import('./app-config');
    expect(trim('')).toBeUndefined();
    expect(trim('  ')).toBeUndefined();
    expect(trim(null as unknown as string)).toBeUndefined();
    expect(trim('  text  ')).toBe('text');
  });

  it('parseYouTubeVideoId should handle various formats', async () => {
    const { parseYouTubeVideoId } = await import('./app-config');
    expect(parseYouTubeVideoId('')).toBeUndefined();
    expect(parseYouTubeVideoId('  ')).toBeUndefined();
    expect(
      parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
    expect(parseYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeVideoId('too-short')).toBe('too-short'); // fallback
  });
});
