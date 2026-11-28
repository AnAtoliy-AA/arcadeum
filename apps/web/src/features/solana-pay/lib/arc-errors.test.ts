import { describe, expect, it } from 'vitest';
import { arcErrorKey, isRetryableArcError } from './arc-errors';

describe('arcErrorKey', () => {
  it.each([
    ['gems.rpcUnavailable', 'rpcUnavailable'],
    ['shop.transactionNotConfirmed', 'transactionNotConfirmed'],
    ['gems.paymentTooLow', 'paymentTooLow'],
    ['arc.notConfigured', 'notConfigured'],
    ['arc.signatureAlreadyUsed', 'signatureAlreadyUsed'],
    ['gems.arcPriceUnavailable', 'arcPriceUnavailable'],
  ])('maps %s', (msg, key) => {
    expect(arcErrorKey(new Error(msg))).toBe(key);
  });

  it('returns null for unknown or non-error input', () => {
    expect(arcErrorKey(new Error('boom'))).toBeNull();
    expect(arcErrorKey(undefined)).toBeNull();
  });

  it('only rpc/unconfirmed errors are retryable with the same signature', () => {
    expect(isRetryableArcError('rpcUnavailable')).toBe(true);
    expect(isRetryableArcError('transactionNotConfirmed')).toBe(true);
    expect(isRetryableArcError('paymentTooLow')).toBe(false);
    expect(isRetryableArcError('signatureAlreadyUsed')).toBe(false);
  });
});
