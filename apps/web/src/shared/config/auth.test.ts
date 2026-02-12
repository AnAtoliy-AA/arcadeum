import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveAuthRedirectUri, authConfig } from './auth';

describe('resolveAuthRedirectUri', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns authConfig.redirectUri when window is undefined', () => {
    vi.stubGlobal('window', undefined);
    expect(resolveAuthRedirectUri()).toBe(authConfig.redirectUri);
  });

  it('returns dynamic URI based on window.location.href when window is defined', () => {
    vi.stubGlobal('window', {
      location: {
        href: 'https://arcadeum-dev.vercel.app/auth',
      },
    });

    expect(resolveAuthRedirectUri()).toBe(
      'https://arcadeum-dev.vercel.app/auth/callback',
    );
  });

  it('strips query params and hashes from the dynamic URI', () => {
    vi.stubGlobal('window', {
      location: {
        href: 'https://arcadeum-dev.vercel.app/auth?foo=bar#baz',
      },
    });

    expect(resolveAuthRedirectUri()).toBe(
      'https://arcadeum-dev.vercel.app/auth/callback',
    );
  });
});
