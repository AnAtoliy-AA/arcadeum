import { render, screen, waitFor, act } from '@testing-library/react';
import { LanguageProvider } from './LanguageProvider';
import { useLanguage } from '@/shared/i18n/context';
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
      <button onClick={() => setLocale('en')}>Change Locale</button>
    </div>
  );
};

describe('LanguageProvider', () => {
  const mockSetLocale = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguageStore).mockImplementation(
      (selector: (state: LanguageState) => unknown) => {
        const state = {
          locale: DEFAULT_LOCALE,
          setLocale: mockSetLocale,
        } as LanguageState;
        return selector ? selector(state) : state;
      },
    );
  });

  it('renders children and provides context', async () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );

    expect(screen.getByTestId('locale')).toHaveTextContent(DEFAULT_LOCALE);

    // Wait for isReady to become true
    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('message')).toHaveTextContent(
      `messages for ${DEFAULT_LOCALE}`,
    );
  });

  it('updates document lang attribute when locale changes', async () => {
    const { rerender } = render(
      <LanguageProvider>
        <div />
      </LanguageProvider>,
    );

    expect(document.documentElement.getAttribute('lang')).toBe(DEFAULT_LOCALE);

    vi.mocked(useLanguageStore).mockImplementation(
      (selector: (state: LanguageState) => unknown) => {
        const state = {
          locale: 'ru' as Locale,
          setLocale: mockSetLocale,
        } as LanguageState;
        return selector ? selector(state) : state;
      },
    );

    rerender(
      <LanguageProvider>
        <div />
      </LanguageProvider>,
    );

    // Wait for the async effect that updates loadedMessages,
    // even though we are only checking the 'lang' attribute.
    await waitFor(() => {
      expect(document.documentElement.getAttribute('lang')).toBe('ru');
    });
  });

  it('calls setLocale from store', async () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });

    act(() => {
      screen.getByText('Change Locale').click();
    });

    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('falls back to default locale when useLanguage is used outside provider', () => {
    render(<Consumer />);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('ready')).toHaveTextContent('false');
  });
});
