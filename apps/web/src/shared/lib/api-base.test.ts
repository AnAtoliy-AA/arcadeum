import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveApiBase,
  resolveApiUrl,
  resolveApiFallbackBase,
  resolveApiFallbackUrl,
} from './api-base';

describe('api-base', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resolves API base from environment', () => {
    expect(resolveApiBase()).toBe('http://api.example.com');
  });

  it('falls back to default if environment variables are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_WEB_API_BASE_URL', '');
    expect(resolveApiBase()).toBe('http://localhost:4000');
  });

  it('handles whitespace only environment variables', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '   ');
    expect(resolveApiBase()).toBe('http://localhost:4000');
  });

  it('falls back to WEB_API_BASE_URL if API_BASE_URL is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_WEB_API_BASE_URL', 'http://web-api.example.com');
    expect(resolveApiBase()).toBe('http://web-api.example.com');
  });

  it('resolves full URLs correctly', () => {
    expect(resolveApiUrl('/users')).toBe('http://api.example.com/users');
    expect(resolveApiUrl('users')).toBe('http://api.example.com/users');
  });

  it('returns the path if it is already an absolute URL', () => {
    expect(resolveApiUrl('https://other.com/api')).toBe(
      'https://other.com/api',
    );
    expect(resolveApiUrl('http://other.com/api')).toBe('http://other.com/api');
  });

  it('handles empty path', () => {
    expect(resolveApiUrl('')).toBe('http://api.example.com');
  });

  describe('resolveApiFallbackBase', () => {
    it('returns null when NEXT_PUBLIC_API_FALLBACK_URL is not set', () => {
      vi.stubEnv('NEXT_PUBLIC_API_FALLBACK_URL', '');
      expect(resolveApiFallbackBase()).toBeNull();
    });

    it('resolves fallback base from environment', () => {
      vi.stubEnv(
        'NEXT_PUBLIC_API_FALLBACK_URL',
        'https://api-reserve.example.com',
      );
      expect(resolveApiFallbackBase()).toBe('https://api-reserve.example.com');
    });

    it('strips trailing slash from fallback URL', () => {
      vi.stubEnv(
        'NEXT_PUBLIC_API_FALLBACK_URL',
        'https://api-reserve.example.com/',
      );
      expect(resolveApiFallbackBase()).toBe('https://api-reserve.example.com');
    });
  });

  describe('resolveApiFallbackUrl', () => {
    it('returns null when no fallback is configured', () => {
      vi.stubEnv('NEXT_PUBLIC_API_FALLBACK_URL', '');
      expect(resolveApiFallbackUrl('/users')).toBeNull();
    });

    it('resolves fallback URL with path', () => {
      vi.stubEnv(
        'NEXT_PUBLIC_API_FALLBACK_URL',
        'https://api-reserve.example.com',
      );
      expect(resolveApiFallbackUrl('/users')).toBe(
        'https://api-reserve.example.com/users',
      );
    });

    it('returns fallback base for empty path', () => {
      vi.stubEnv(
        'NEXT_PUBLIC_API_FALLBACK_URL',
        'https://api-reserve.example.com',
      );
      expect(resolveApiFallbackUrl('')).toBe('https://api-reserve.example.com');
    });

    it('returns absolute URL as-is', () => {
      vi.stubEnv(
        'NEXT_PUBLIC_API_FALLBACK_URL',
        'https://api-reserve.example.com',
      );
      expect(resolveApiFallbackUrl('https://other.com/api')).toBe(
        'https://other.com/api',
      );
    });
  });
});
