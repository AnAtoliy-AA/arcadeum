import { extractVariantFromOptions } from './game-options';

describe('extractVariantFromOptions', () => {
  it('returns undefined for missing options', () => {
    expect(extractVariantFromOptions(undefined)).toBeUndefined();
  });

  it('returns undefined when options is not an object', () => {
    // The DTO types gameOptions as Record<string, unknown> | undefined,
    // but defensively guard against non-object runtime values.
    expect(
      extractVariantFromOptions(null as unknown as undefined),
    ).toBeUndefined();
  });

  it('reads opts.variant when present (Glimworm/Sea Battle convention)', () => {
    expect(extractVariantFromOptions({ variant: 'time_attack' })).toBe(
      'time_attack',
    );
  });

  it('falls back to opts.cardVariant when variant is missing (Critical convention)', () => {
    expect(extractVariantFromOptions({ cardVariant: 'crime' })).toBe('crime');
  });

  it('prefers opts.variant when both keys are present', () => {
    expect(
      extractVariantFromOptions({ variant: 'classic', cardVariant: 'crime' }),
    ).toBe('classic');
  });

  it('returns undefined when neither key is a string', () => {
    expect(extractVariantFromOptions({})).toBeUndefined();
    expect(
      extractVariantFromOptions({ variant: 42 } as Record<string, unknown>),
    ).toBeUndefined();
    expect(
      extractVariantFromOptions({ cardVariant: null } as Record<
        string,
        unknown
      >),
    ).toBeUndefined();
  });
});
