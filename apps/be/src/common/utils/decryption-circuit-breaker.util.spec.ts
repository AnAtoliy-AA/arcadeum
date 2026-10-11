import { ForbiddenException } from '@nestjs/common';
import { DecryptionCircuitBreaker } from './decryption-circuit-breaker.util';

describe('DecryptionCircuitBreaker', () => {
  let breaker: DecryptionCircuitBreaker;

  beforeEach(() => {
    breaker = new DecryptionCircuitBreaker({
      maxRequestsPerWindow: 3,
      windowMs: 60_000,
    });
  });

  it('allows requests within the configured threshold', () => {
    expect(() => breaker.recordAndCheck('actor-1')).not.toThrow();
    expect(() => breaker.recordAndCheck('actor-1')).not.toThrow();
    expect(() => breaker.recordAndCheck('actor-1')).not.toThrow();
  });

  it('throws ForbiddenException and blocks when threshold is exceeded', () => {
    breaker.recordAndCheck('actor-2');
    breaker.recordAndCheck('actor-2');
    breaker.recordAndCheck('actor-2');

    expect(() => breaker.recordAndCheck('actor-2')).toThrow(ForbiddenException);
    expect(breaker.isActorBlocked('actor-2')).toBe(true);
  });

  it('tracks different actors independently', () => {
    breaker.recordAndCheck('actor-A');
    breaker.recordAndCheck('actor-A');
    breaker.recordAndCheck('actor-A');

    expect(() => breaker.recordAndCheck('actor-A')).toThrow(ForbiddenException);
    expect(() => breaker.recordAndCheck('actor-B')).not.toThrow();
  });

  it('allows resetting actor state', () => {
    breaker.recordAndCheck('actor-reset');
    breaker.recordAndCheck('actor-reset');
    breaker.recordAndCheck('actor-reset');

    expect(breaker.isActorBlocked('actor-reset')).toBe(true);
    breaker.reset('actor-reset');
    expect(breaker.isActorBlocked('actor-reset')).toBe(false);
    expect(() => breaker.recordAndCheck('actor-reset')).not.toThrow();
  });
});
