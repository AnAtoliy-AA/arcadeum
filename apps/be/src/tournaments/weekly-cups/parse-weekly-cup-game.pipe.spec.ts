import { BadRequestException } from '@nestjs/common';
import { ParseWeeklyCupGamePipe } from './parse-weekly-cup-game.pipe';

describe('ParseWeeklyCupGamePipe', () => {
  const pipe = new ParseWeeklyCupGamePipe();

  it('accepts supported games', () => {
    expect(pipe.transform('sea-battle')).toBe('sea-battle');
    expect(pipe.transform('checkers')).toBe('checkers');
  });

  it('rejects unsupported games', () => {
    expect(() => pipe.transform('chess')).toThrow(BadRequestException);
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });
});
