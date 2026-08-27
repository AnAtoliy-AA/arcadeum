import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GuestTermsNotice } from './GuestTermsNotice';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'games.guestDisclaimer.playingAsGuest': 'Playing as Guest',
        'games.guestDisclaimer.agreementPrefix':
          'By playing you agree to Arcadeum’s ',
        'games.guestDisclaimer.termsLink': 'Terms of Service',
        'games.guestDisclaimer.agreementSuffix': ' and certify you are 18+.',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('GuestTermsNotice', () => {
  it('renders guest terms and 18+ certification disclaimer', () => {
    render(<GuestTermsNotice />);
    expect(screen.getByTestId('guest-terms-notice')).toBeInTheDocument();
    expect(screen.getByText('Playing as Guest')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Terms of Service/i }),
    ).toHaveAttribute('href', '/terms');
  });
});
