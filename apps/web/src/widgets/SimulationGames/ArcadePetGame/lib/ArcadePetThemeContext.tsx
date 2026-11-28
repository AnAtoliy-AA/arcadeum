'use client';

import type { CSSProperties, ReactNode } from 'react';
import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getArcadePetTheme, type ArcadePetThemeTokens } from './theme';

const { Provider: ThemeValueProvider, useTheme: useArcadePetTheme } =
  createGameThemeContext<ArcadePetThemeTokens>(getArcadePetTheme, 'retro');

export { useArcadePetTheme };

/** The `--arcade-*` custom properties for one resolved device skin. */
export function arcadePetThemeVars(theme: ArcadePetThemeTokens): CSSProperties {
  return {
    '--arcade-shell-bg': theme.shellBg,
    '--arcade-shell-border': theme.shellBorder,
    '--arcade-screen-bg': theme.screenBg,
    '--arcade-pixel-color': theme.pixelColor,
    '--arcade-pixel-dim': theme.pixelDim,
    '--arcade-btn-a': theme.buttonA,
    '--arcade-btn-b': theme.buttonB,
    '--arcade-btn-c': theme.buttonC,
    '--arcade-accent': theme.accent,
    '--arcade-text': theme.textColor,
    '--arcade-glow': theme.glow,
  } as CSSProperties; // custom properties are not in CSSProperties
}

function ThemeVarsScope({ children }: { children: ReactNode }) {
  const theme = useArcadePetTheme();
  // `display: contents` keeps the wrapper out of layout while descendants
  // still inherit the custom properties.
  return (
    <div className="contents" style={arcadePetThemeVars(theme)}>
      {children}
    </div>
  );
}

/**
 * Resolves the device skin (with the color-vision setting applied) and always
 * mints the full `--arcade-*` variable set for every descendant.
 */
export function ArcadePetThemeProvider({
  variant,
  children,
}: {
  variant?: string;
  children: ReactNode;
}) {
  return (
    <ThemeValueProvider variant={variant}>
      <ThemeVarsScope>{children}</ThemeVarsScope>
    </ThemeValueProvider>
  );
}
