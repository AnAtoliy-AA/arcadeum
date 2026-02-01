import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TranslationKey } from './useTranslation';

describe('useTranslation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs(); // Ensure clean env start
  });

  afterEach(() => {
    vi.doUnmock('@/app/i18n/LanguageProvider');
  });

  // Helper to setup mock and import
  async function setup(locale = 'en', messages: Record<string, unknown> = {}) {
    // Mock the dependency BEFORE importing the module under test
    const useLanguageMock = vi.fn().mockReturnValue({ locale, messages });

    vi.doMock('@/app/i18n/LanguageProvider', () => ({
      useLanguage: useLanguageMock,
    }));

    // Import the module under test. validation of doMock is that it must be called before import
    const { useTranslation } = await import('./useTranslation');

    return { useTranslation, useLanguageMock };
  }

  it('returns translated string for a valid key', async () => {
    const { useTranslation } = await setup('en', {
      common: { actions: { login: 'Log In' } },
    });

    const { result } = renderHook(() => useTranslation());
    expect(
      result.current.t('common.actions.login' as unknown as TranslationKey),
    ).toBe('Log In');
  });

  it('interpolates parameters correctly', async () => {
    const { useTranslation } = await setup('en', {
      welcome: 'Hello {{name}}!',
    });

    const { result } = renderHook(() => useTranslation());
    expect(
      result.current.t('welcome' as unknown as TranslationKey, {
        name: 'Alice',
      }),
    ).toBe('Hello Alice!');
  });

  it('returns key if translation is missing', async () => {
    const { useTranslation } = await setup('en', {});

    const { result } = renderHook(() => useTranslation());
    expect(result.current.t('missing.key' as unknown as TranslationKey)).toBe(
      'missing.key',
    );
  });

  describe('development warnings', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });

    it('warns about missing translation in dev', async () => {
      const { useTranslation } = await setup('en', {});
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useTranslation());
      result.current.t('missing.key' as unknown as TranslationKey);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing translation'),
      );
      consoleSpy.mockRestore();
    });

    it('warns about unused parameters', async () => {
      const { useTranslation } = await setup('en', { test: 'Static' });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useTranslation());
      result.current.t('test' as unknown as TranslationKey, {
        unused: 'value',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unused parameters'),
      );
      consoleSpy.mockRestore();
    });

    it('warns about missing parameter values', async () => {
      const { useTranslation } = await setup('en', { test: 'Hello {{name}}' });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useTranslation());
      // Must provide at least one param to trigger interpolation logic
      result.current.t('test' as unknown as TranslationKey, {
        triggers: 'interpolation',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing parameter values'),
      );
      consoleSpy.mockRestore();
    });

    it('returns key and warns if value is not a string', async () => {
      const { useTranslation } = await setup('en', {
        test: { nested: 'object' },
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useTranslation());
      expect(result.current.t('test' as unknown as TranslationKey)).toBe(
        'test',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing translation'),
      );
      consoleSpy.mockRestore();
    });

    it('interpolates correctly without warnings in dev', async () => {
      const { useTranslation } = await setup('en', { test: 'Hello {{name}}' });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useTranslation());
      expect(
        result.current.t('test' as unknown as TranslationKey, {
          name: 'Alice',
        }),
      ).toBe('Hello Alice');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('uses "unknown" locale if locale is missing in warning', async () => {
      const { useTranslation } = await setup('', {});
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useTranslation());
      result.current.t('missing.key' as unknown as TranslationKey);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('in locale "unknown"'),
      );
      consoleSpy.mockRestore();
    });
  });
});
