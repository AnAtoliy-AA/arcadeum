import React from 'react';
import axe from 'axe-core';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArcadePetAdoptionModal } from './ArcadePetAdoptionModal';
import { ArcadePetCommitmentModal } from './ArcadePetCommitmentModal';
import { ArcadePetGiftsModal } from './ArcadePetGiftsModal';
import { ArcadePetStatusPanel } from './ArcadePetStatusPanel';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { mockUseTranslation } from '../test/mock-translation';
import { createInitialPet } from '@arcadeum/games-core';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const MODALS = [
  {
    name: 'adoption',
    testId: 'arcade-pet-adoption-modal',
    ui: (onClose: () => void) => (
      <ArcadePetAdoptionModal open onClose={onClose} />
    ),
  },
  {
    name: 'gifts',
    testId: 'arcade-pet-gifts-modal',
    ui: (onClose: () => void) => <ArcadePetGiftsModal open onClose={onClose} />,
  },
  {
    name: 'commitment',
    testId: 'arcade-pet-commitment-modal',
    ui: (onClose: () => void) => (
      <ArcadePetCommitmentModal open onClose={onClose} onConfirm={vi.fn()} />
    ),
  },
];

// jsdom cannot compute layout or colors, so contrast is covered by token
// choice and the Playwright axe audit instead.
const AXE_OPTIONS: axe.RunOptions = {
  rules: { 'color-contrast': { enabled: false } },
};

describe('ArcadePet modals accessibility', () => {
  beforeEach(() => {
    useArcadePetStore.setState({
      gemBalance: 100,
      pets: [],
      activePetId: null,
      presents: [],
    });
  });

  describe.each(MODALS)('$name modal', ({ testId, ui }) => {
    it('is a labelled modal dialog', () => {
      render(ui(vi.fn()));
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName();
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('closes on Escape', () => {
      const onClose = vi.fn();
      render(ui(onClose));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('has a translated close button', () => {
      render(ui(vi.fn()));
      expect(
        screen.getByRole('button', { name: 'Close', exact: true }),
      ).toBeInTheDocument();
    });

    it('keeps Tab focus inside the dialog', () => {
      render(ui(vi.fn()));
      const dialog = screen.getByRole('dialog');
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex="0"]',
      );
      const last = focusable[focusable.length - 1];
      last.focus();
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(dialog.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).not.toBe(last);
    });

    it('has no axe violations', async () => {
      render(ui(vi.fn()));
      const results = await axe.run(screen.getByRole('dialog'), AXE_OPTIONS);
      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  });
});

describe('ArcadePetStatusPanel accessibility', () => {
  it('labels both progress bars', () => {
    const pet = createInitialPet({ id: 'a', name: 'A' });
    render(<ArcadePetStatusPanel pet={pet} isAtHome={false} />);
    expect(
      screen.getByRole('progressbar', { name: 'Hunger' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Happiness' }),
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const pet = createInitialPet({ id: 'a', name: 'A' });
    const { container } = render(
      <ArcadePetStatusPanel pet={pet} isAtHome={false} />,
    );
    const results = await axe.run(container, AXE_OPTIONS);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
