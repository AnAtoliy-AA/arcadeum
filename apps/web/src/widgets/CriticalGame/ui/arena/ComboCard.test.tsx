import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { ComboCard, type ComboKind } from './ComboCard';
import type { CriticalCard } from '../../types';

function renderCard(
  props: React.ComponentProps<typeof ComboCard>,
): ReturnType<typeof render> {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ComboCard {...props} />
    </TamaguiProvider>,
  );
}

describe('ComboCard', () => {
  it('falls back to the placeholder label and `none` kind when no combo is provided', () => {
    renderCard({
      hand: ['strike'] as CriticalCard[],
      allowActionCardCombos: false,
    });
    const card = screen.getByTestId('combo-card');
    expect(card).toHaveAttribute('data-kind', 'none');
    expect(screen.getByTestId('combo-card-label')).toHaveTextContent(
      'games.table.hud.combo.placeholder',
    );
  });

  it('renders the contextual label when a combo is detected', () => {
    renderCard({
      hand: [] as CriticalCard[],
      allowActionCardCombos: false,
      combo: { kind: 'pair', label: 'Play 2× Strike · steal' },
    });
    expect(screen.getByTestId('combo-card-label')).toHaveTextContent(
      'Play 2× Strike · steal',
    );
    expect(screen.getByTestId('combo-card')).toHaveAttribute(
      'data-kind',
      'pair',
    );
  });

  it.each<ComboKind>(['single', 'pair', 'triple', 'five', 'invalid'])(
    'exposes data-kind="%s" on the wrapper for downstream tints',
    (kind) => {
      renderCard({
        hand: [] as CriticalCard[],
        allowActionCardCombos: false,
        combo: { kind, label: kind },
      });
      expect(screen.getByTestId('combo-card')).toHaveAttribute(
        'data-kind',
        kind,
      );
    },
  );

  it('hides ComboHints at idle (kind="none") so the placeholder reads clean', () => {
    renderCard({
      hand: ['strike'] as CriticalCard[],
      allowActionCardCombos: false,
    });
    expect(screen.queryByTestId('combo-hints')).not.toBeInTheDocument();
  });

  it('embeds ComboHints once a combo is detected', () => {
    renderCard({
      hand: ['strike', 'strike'] as CriticalCard[],
      allowActionCardCombos: true,
      combo: { kind: 'pair', label: 'pair' },
    });
    expect(screen.getByTestId('combo-hints')).toBeInTheDocument();
  });
});
