import { describe, it, expect } from 'vitest';
import { HttpStatus } from './http-status';

describe('HttpStatus constants', () => {
  it('contains correct status codes', () => {
    expect(HttpStatus.OK).toBe(200);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
  });
});
