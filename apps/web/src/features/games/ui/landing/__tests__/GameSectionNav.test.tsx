import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameSectionNav } from '../GameSectionNav';

vi.mock('@/shared/i18n/useTranslation', async () =>
  (await import('./landingMocks')).translationMock(),
);

describe('GameSectionNav', () => {
  it('renders an anchor per section in order', () => {
    render(
      <GameSectionNav
        items={[
          { id: 'play', labelKey: 'games.landing.navPlay' },
          { id: 'rules', labelKey: 'games.landing.navRules' },
          { id: 'faq', labelKey: 'games.landing.navFaq' },
        ]}
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#play',
      '#rules',
      '#faq',
    ]);
    expect(screen.getByRole('navigation')).toHaveAttribute(
      'aria-label',
      'onThisPage',
    );
  });

  it('marks the first section as current initially', () => {
    render(
      <GameSectionNav
        items={[
          { id: 'play', labelKey: 'games.landing.navPlay' },
          { id: 'rules', labelKey: 'games.landing.navRules' },
        ]}
      />,
    );
    expect(screen.getByText('navPlay')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('navRules')).not.toHaveAttribute('aria-current');
  });

  it('renders nothing when there is only one section', () => {
    const { container } = render(
      <GameSectionNav
        items={[{ id: 'play', labelKey: 'games.landing.navPlay' }]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
