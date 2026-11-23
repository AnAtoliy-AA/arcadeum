import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GamesEmpty } from './GamesEmpty';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('GamesEmpty', () => {
  it('offers a create room call to action', () => {
    render(<GamesEmpty createRoomHref="/en/games/create" />);
    expect(
      screen.getByRole('link', { name: /roomsBrowser.createRoom/ }),
    ).toHaveAttribute('href', '/en/games/create');
  });
});
