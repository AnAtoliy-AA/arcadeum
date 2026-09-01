import { extractThemeFromOptions } from './game-options';

describe('extractThemeFromOptions', () => {
  it('returns undefined for missing options', () => {
    expect(extractThemeFromOptions(undefined)).toBeUndefined();
  });

  it('returns undefined when options is not an object', () => {
    // The DTO types gameOptions as Record<string, unknown> | undefined,
    // but defensively guard against non-object runtime values.
    expect(
      extractThemeFromOptions(null as unknown as undefined),
    ).toBeUndefined();
  });

  it('reads opts.theme when present (canonical field)', () => {
    expect(extractThemeFromOptions({ theme: 'cyberpunk' })).toBe('cyberpunk');
  });

  it('falls back to opts.variant when theme is missing (legacy)', () => {
    expect(extractThemeFromOptions({ variant: 'time_attack' })).toBe(
      'time_attack',
    );
  });

  it('falls back to opts.cardVariant when theme and variant are missing (Critical convention)', () => {
    expect(extractThemeFromOptions({ cardVariant: 'crime' })).toBe('crime');
  });

  it('prefers opts.theme when multiple keys are present', () => {
    expect(
      extractThemeFromOptions({
        theme: 'adventure',
        variant: 'classic',
        cardVariant: 'crime',
      }),
    ).toBe('adventure');
  });

  it('returns undefined when no key is a string', () => {
    expect(extractThemeFromOptions({})).toBeUndefined();
    expect(extractThemeFromOptions({ theme: 42 })).toBeUndefined();
    expect(extractThemeFromOptions({ variant: 42 })).toBeUndefined();
    expect(extractThemeFromOptions({ cardVariant: null })).toBeUndefined();
  });
});
