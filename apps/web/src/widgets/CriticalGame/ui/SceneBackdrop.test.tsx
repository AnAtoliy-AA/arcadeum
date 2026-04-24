import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '../../../shared/config/tamagui.config';
import { SceneBackdrop } from './SceneBackdrop';
import { ScenePaletteProvider } from './ScenePaletteContext';
import { getVariantStyles } from './styles/variants';

const palette = getVariantStyles('cyberpunk').scene;

function renderWithPalette() {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ScenePaletteProvider palette={palette}>
        <SceneBackdrop />
      </ScenePaletteProvider>
    </TamaguiProvider>,
  );
}

describe('SceneBackdrop', () => {
  it('renders six backdrop layers', () => {
    renderWithPalette();
    expect(screen.getByTestId('scene-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('scene-grid-floor')).toBeInTheDocument();
    expect(screen.getByTestId('scene-horizon')).toBeInTheDocument();
    expect(screen.getByTestId('scene-backlight')).toBeInTheDocument();
    expect(screen.getByTestId('scene-scanlines')).toBeInTheDocument();
    expect(screen.getByTestId('scene-vignette')).toBeInTheDocument();
    expect(screen.getByTestId('scene-particles')).toBeInTheDocument();
  });

  it('applies palette values to inline styles', () => {
    renderWithPalette();
    const horizon = screen.getByTestId('scene-horizon');
    expect(horizon.getAttribute('style')).toContain(
      palette.horizonGradient.split(',')[0],
    );
  });

  it('renders N particles where N === palette.particleColors.length × 2', () => {
    renderWithPalette();
    const particles = screen.getByTestId('scene-particles');
    expect(particles.children.length).toBeGreaterThanOrEqual(5);
    expect(particles.children.length).toBeLessThanOrEqual(8);
  });
});
