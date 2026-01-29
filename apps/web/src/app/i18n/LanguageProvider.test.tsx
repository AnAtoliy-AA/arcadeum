import { render, screen, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageProvider';
import { useLanguageStore, LanguageState } from './store/languageStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_LOCALE, Locale, TranslationBundle } from '@/shared/i18n';

// Mock the language store
vi.mock('./store/languageStore', () => ({
  useLanguageStore: vi.fn(),
}));

// Mock getMessages from @/shared/i18n
vi.mock('@/shared/i18n', async () => {
  const actual =
    await vi.importActual<typeof import('@/shared/i18n')>('@/shared/i18n');
  return {
    ...actual,
    getMessages: vi.fn(
      (locale: Locale): TranslationBundle => ({
        common: { labels: { email: `messages for ${locale}` } },
      }),
    ),
  };
});

const Consumer = () => {
  const { locale, setLocale, isReady, messages } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="ready">{isReady.toString()}</span>
      <span data-testid="message">{messages.common?.labels?.email}</span>
      <button onClick={() => setLocale('en')}>Change Locale</button>
    </div>
  );
};

describe('LanguageProvider', () => {
  const mockSetLocale = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguageStore).mockReturnValue({
      locale: DEFAULT_LOCALE,
      setLocale: mockSetLocale,
    } as LanguageState);
  });

  it('renders children and provides context', async () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent(DEFAULT_LOCALE);

    // Wait for isReady to become true
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('ready')).toHaveTextContent('true');
    expect(screen.getByTestId('message')).toHaveTextContent(
      `messages for ${DEFAULT_LOCALE}`,
    );
  });

  it('updates document lang attribute when locale changes', () => {
    const { rerender } = render(
      <LanguageProvider>
        <div />
      </LanguageProvider>,
    );

    expect(document.documentElement.getAttribute('lang')).toBe(DEFAULT_LOCALE);

    vi.mocked(useLanguageStore).mockReturnValue({
      locale: 'ru' as Locale,
      setLocale: mockSetLocale,
    } as LanguageState);

    rerender(
      <LanguageProvider>
        <div />
      </LanguageProvider>,
    );

    expect(document.documentElement.getAttribute('lang')).toBe('ru');
  });

  it('calls setLocale from store', () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );

    screen.getByText('Change Locale').click();
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('throws error when useLanguage is used outside provider', () => {
    // Suppress console.error for this test as React will log an error when a component throws
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Consumer />)).toThrow(
      'useLanguage must be used within LanguageProvider',
    );

    consoleSpy.mockRestore();
  });
});
