import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  ScenePaletteProvider,
  useScenePalette,
} from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

const palette = getVariantStyles('cyberpunk').scene;

function Consumer() {
  const p = useScenePalette();
  return <span data-testid="bg">{p.sceneBgGradient}</span>;
}

describe('ScenePaletteContext', () => {
  it('exposes the provided palette to descendants', () => {
    render(
      <ScenePaletteProvider palette={palette}>
        <Consumer />
      </ScenePaletteProvider>,
    );
    expect(screen.getByTestId('bg').textContent).toEqual(palette.sceneBgGradient);
  });

  it('throws when used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      /ScenePaletteProvider/,
    );
    spy.mockRestore();
  });
});
