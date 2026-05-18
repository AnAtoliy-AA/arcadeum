import { render, screen, waitFor, act } from '@testing-library/react';
import { LanguageProvider } from './LanguageProvider';
import { useLanguage } from '@/shared/i18n/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_LOCALE, Locale, TranslationBundle } from '@/shared/i18n';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => `/${DEFAULT_LOCALE}/games`,
  useSearchParams: () => new URLSearchParams(),
}));

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
    loadMessages: vi.fn(
      async (locale: Locale): Promise<TranslationBundle> => ({
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
      <button onClick={() => setLocale('ru')}>Change Locale</button>
    </div>
  );
};

describe('LanguageProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children and provides context', async () => {
    render(
      <LanguageProvider locale={DEFAULT_LOCALE}>
        <Consumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent(DEFAULT_LOCALE);

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('message')).toHaveTextContent(
      `messages for ${DEFAULT_LOCALE}`,
    );
  });

  it('updates document lang attribute when locale prop changes', async () => {
    const { rerender } = render(
      <LanguageProvider locale={DEFAULT_LOCALE}>
        <div />
      </LanguageProvider>,
    );

    expect(document.documentElement.getAttribute('lang')).toBe(DEFAULT_LOCALE);

    rerender(
      <LanguageProvider locale={'ru' as Locale}>
        <div />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('lang')).toBe('ru');
    });
  });

  it('setLocale navigates to the new locale prefix', async () => {
    render(
      <LanguageProvider locale={DEFAULT_LOCALE}>
        <Consumer />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });

    act(() => {
      screen.getByText('Change Locale').click();
    });

    // setLocale should swap both the locale prefix AND the localized
    // first-segment slug — `/en/games` becomes `/ru/igry`.
    expect(mockReplace).toHaveBeenCalledWith('/ru/igry');
  });

  it('falls back to default locale when useLanguage is used outside provider', () => {
    render(<Consumer />);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('ready')).toHaveTextContent('false');
  });
});
