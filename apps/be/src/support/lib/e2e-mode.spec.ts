import { isE2EMode } from './e2e-mode';

describe('isE2EMode', () => {
  const ORIGINAL = process.env.E2E;

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.E2E;
    else process.env.E2E = ORIGINAL;
  });

  it('returns true only when E2E is the literal string "true"', () => {
    process.env.E2E = 'true';
    expect(isE2EMode()).toBe(true);
  });

  it('returns false for unset / other values', () => {
    delete process.env.E2E;
    expect(isE2EMode()).toBe(false);
    process.env.E2E = 'false';
    expect(isE2EMode()).toBe(false);
    process.env.E2E = '1';
    expect(isE2EMode()).toBe(false);
  });
});
