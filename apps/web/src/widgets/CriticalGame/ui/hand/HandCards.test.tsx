import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../../shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { HandCards } from './HandCards';
import { handWithUids } from '../../lib/combo';
import type { CriticalCard } from '../../types';

function renderCards(
  props: Partial<React.ComponentProps<typeof HandCards>> = {},
) {
  const merged: React.ComponentProps<typeof HandCards> = {
    cards: handWithUids(['strike', 'strike', 'evade'] as CriticalCard[]),
    selectedUids: [],
    onToggleSelect: vi.fn(),
    ...props,
  };
  return {
    ...render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <HandCards {...merged} />
      </TamaguiProvider>,
    ),
    props: merged,
  };
}

describe('HandCards', () => {
  it('renders one tile per hand instance, even for duplicate card types', () => {
    renderCards();
    expect(screen.getByTestId('hand-card-strike-0')).toBeInTheDocument();
    expect(screen.getByTestId('hand-card-strike-1')).toBeInTheDocument();
    expect(screen.getByTestId('hand-card-evade-2')).toBeInTheDocument();
  });

  it('flags the selected card via data-selected', () => {
    renderCards({ selectedUids: ['strike-1'] });
    expect(screen.getByTestId('hand-card-strike-0')).toHaveAttribute(
      'data-selected',
      'false',
    );
    expect(screen.getByTestId('hand-card-strike-1')).toHaveAttribute(
      'data-selected',
      'true',
    );
  });

  it('fires onToggleSelect when a card is clicked', () => {
    const onToggleSelect = vi.fn();
    renderCards({ onToggleSelect });
    fireEvent.click(screen.getByTestId('hand-card-evade-2'));
    expect(onToggleSelect).toHaveBeenCalledWith('evade-2');
  });

  it('does not call onToggleSelect when disabled', () => {
    const onToggleSelect = vi.fn();
    renderCards({ onToggleSelect, disabled: true });
    fireEvent.click(screen.getByTestId('hand-card-evade-2'));
    expect(onToggleSelect).not.toHaveBeenCalled();
  });

  it('tags each card tile with the role its border colour is derived from', () => {
    // One representative card per role. The HandCard cell exposes
    // `data-role` so visual regressions (wrong color, wrong icon) are
    // catchable without a snapshot diff that flakes on layout.
    renderCards({
      cards: handWithUids([
        'strike',
        'neutralizer',
        'evade',
        'cancel',
        'trade',
        'insight',
        'wildcard',
        'critical_event',
      ] as CriticalCard[]),
    });
    expect(screen.getByTestId('hand-card-strike-0')).toHaveAttribute(
      'data-role',
      'attack',
    );
    expect(screen.getByTestId('hand-card-neutralizer-1')).toHaveAttribute(
      'data-role',
      'defuse',
    );
    expect(screen.getByTestId('hand-card-evade-2')).toHaveAttribute(
      'data-role',
      'skip',
    );
    expect(screen.getByTestId('hand-card-cancel-3')).toHaveAttribute(
      'data-role',
      'nope',
    );
    expect(screen.getByTestId('hand-card-trade-4')).toHaveAttribute(
      'data-role',
      'favor',
    );
    expect(screen.getByTestId('hand-card-insight-5')).toHaveAttribute(
      'data-role',
      'see',
    );
    expect(screen.getByTestId('hand-card-wildcard-6')).toHaveAttribute(
      'data-role',
      'combo',
    );
    expect(screen.getByTestId('hand-card-critical_event-7')).toHaveAttribute(
      'data-role',
      'special',
    );
  });

  it('keeps cell dimensions stable across selection so the fan does not shift', () => {
    // Regression for PR #658 review §1.2 — the selected-state size delta
    // (132×184 vs 124×172) pushed neighbours sideways because the row
    // uses `gap`, not absolute positioning. Lift/glow/border swap now
    // signal selection without disturbing layout.
    const { rerender, props } = renderCards();
    const before = screen.getByTestId('hand-card-strike-0');
    expect(before.className).toMatch(/_w-124px/);
    expect(before.className).toMatch(/_h-172px/);
    rerender(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <HandCards {...props} selectedUids={['strike-0']} />
      </TamaguiProvider>,
    );
    const after = screen.getByTestId('hand-card-strike-0');
    expect(after).toHaveAttribute('data-selected', 'true');
    expect(after.className).toMatch(/_w-124px/);
    expect(after.className).toMatch(/_h-172px/);
  });

  it('renders the role fallback glyph when the variant has no sprite art', () => {
    // Regression for PR #658 review §1.1 — the glyph used to render
    // beneath the sprite and bleed through. With no sprite for the
    // default variant we should still see the role-keyed icon.
    renderCards({
      cards: handWithUids(['strike'] as CriticalCard[]),
    });
    const card = screen.getByTestId('hand-card-strike-0');
    // strike → attack role → ⚔ glyph
    expect(card.textContent).toContain('⚔');
  });

  it('omits the fallback glyph when the variant ships sprite art for the card', () => {
    // Regression for PR #658 review §1.1 — the glyph must NOT stack with
    // the sprite. Crime variant has a sprite sheet; strike is mapped.
    renderCards({
      cards: handWithUids(['strike'] as CriticalCard[]),
      cardVariant: 'crime',
    });
    const card = screen.getByTestId('hand-card-strike-0');
    expect(card.textContent).not.toContain('⚔');
  });

  it('links the card description via aria-describedby so screen readers hear it', () => {
    // §3.1 — aria-label only carries the card name; the description
    // (rules text) lives in a separate element. Connecting them via
    // aria-describedby is what makes the description audible.
    renderCards({
      cards: handWithUids(['strike'] as CriticalCard[]),
    });
    const card = screen.getByTestId('hand-card-strike-0');
    const describedBy = card.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const description = document.getElementById(describedBy!);
    expect(description).not.toBeNull();
    expect(description!.textContent).toBeTruthy();
  });

  it('shows a duplicate-count badge only for cards with copies in hand', () => {
    renderCards({
      cards: handWithUids(['strike', 'strike', 'evade'] as CriticalCard[]),
    });
    // strike has 2 copies — badges on both cells, reading "×2".
    expect(screen.getByTestId('hand-card-count-strike-0')).toHaveTextContent(
      '×2',
    );
    expect(screen.getByTestId('hand-card-count-strike-1')).toHaveTextContent(
      '×2',
    );
    // evade is solo — no badge.
    expect(
      screen.queryByTestId('hand-card-count-evade-2'),
    ).not.toBeInTheDocument();
  });
});
