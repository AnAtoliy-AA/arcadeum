import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../shared/config/tamagui.config';
import { MobileActionSheet } from './MobileActionSheet';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

const palette = getVariantStyles(undefined).scene;

const opponents = [
  { playerId: 'a', alive: true },
  { playerId: 'b', alive: true },
  { playerId: 'c', alive: false },
];

function setup(overrides: Record<string, unknown> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ScenePaletteProvider palette={palette}>
        <MobileActionSheet
          isOpen
          title="Attack"
          description="Play Attack on which player?"
          opponents={opponents}
          resolveDisplayName={(id) => id.toUpperCase()}
          onConfirm={onConfirm}
          onCancel={onCancel}
          {...overrides}
        />
      </ScenePaletteProvider>
    </TamaguiProvider>,
  );
  return { onConfirm, onCancel };
}

describe('MobileActionSheet', () => {
  it('lists live opponents only', () => {
    setup();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('fires onConfirm with the chosen target', () => {
    const { onConfirm } = setup();
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByRole('button', { name: /^play$/i }));
    expect(onConfirm).toHaveBeenCalledWith('a');
  });

  it('fires onCancel on Cancel', () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    setup({ isOpen: false });
    expect(
      screen.queryByTestId('mobile-action-sheet'),
    ).not.toBeInTheDocument();
  });
});
