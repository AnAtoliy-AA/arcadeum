import { describe, it, expect } from 'vitest';
import ChessOpengraphImage from './opengraph-image';

describe('ChessOpengraphImage', () => {
  it('renders ImageResponse', async () => {
    const res = await ChessOpengraphImage({
      params: Promise.resolve({ locale: 'en' }),
    });
    expect(res).toBeDefined();
  });
});
