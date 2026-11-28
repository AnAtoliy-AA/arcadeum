import {
  ARCADEUM_DECIMALS,
  fromRawAmount,
  toRawAmount,
} from './arcadeum-token';
import { isValidSolanaAddress } from './base58';

describe('ARC token constants at the real decimals', () => {
  it('uses 6 decimals (pump.fun mint 7aRVHP...jpump, verified on GeckoTerminal)', () => {
    expect(ARCADEUM_DECIMALS).toBe(6);
  });

  it('converts whole and fractional amounts exactly', () => {
    expect(toRawAmount(1)).toBe(BigInt(1_000_000));
    expect(toRawAmount(12.5)).toBe(BigInt(12_500_000));
    expect(toRawAmount(0.000001)).toBe(BigInt(1));
    expect(fromRawAmount(BigInt(12_500_000))).toBe(12.5);
  });

  it('does not drift on float sums (0.1 + 0.2)', () => {
    expect(toRawAmount(0.1 + 0.2)).toBe(BigInt(300_000));
  });

  it('handles large payments without losing precision', () => {
    expect(toRawAmount(123_456_789)).toBe(BigInt('123456789000000'));
  });

  it.each([-1, NaN, Infinity])('rejects invalid amount %p', (n) => {
    expect(() => toRawAmount(n)).toThrow(RangeError);
  });
});

describe('isValidSolanaAddress', () => {
  it('accepts the real ARC mint and pool', () => {
    expect(
      isValidSolanaAddress('7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump'),
    ).toBe(true);
    expect(
      isValidSolanaAddress('BHYF1uFfwujrZyLrAQw3vZJQFQ6XEkRk4TNxHo8kTTXj'),
    ).toBe(true);
  });

  it('accepts the System Program id (32 bytes of zero)', () => {
    expect(isValidSolanaAddress('11111111111111111111111111111111')).toBe(true);
  });

  it.each([
    '',
    'your_token_mint_address_here',
    '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCt', // 32 chars decode to about 23 bytes
    '0OIl' + 'a'.repeat(40), // invalid base58 chars
    undefined,
    42,
  ])('rejects %p', (v) => {
    expect(isValidSolanaAddress(v)).toBe(false);
  });
});
