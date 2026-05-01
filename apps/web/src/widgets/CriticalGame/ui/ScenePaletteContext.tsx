import { createContext, useContext, type ReactNode } from 'react';
import type { VariantScenePalette } from './styles/variants/types';

const ScenePaletteContext = createContext<VariantScenePalette | null>(null);

export function ScenePaletteProvider({
  palette,
  children,
}: {
  palette: VariantScenePalette;
  children: ReactNode;
}) {
  return (
    <ScenePaletteContext.Provider value={palette}>
      {children}
    </ScenePaletteContext.Provider>
  );
}

export function useScenePalette(): VariantScenePalette {
  const ctx = useContext(ScenePaletteContext);
  if (!ctx) {
    throw new Error(
      'useScenePalette must be used inside a ScenePaletteProvider',
    );
  }
  return ctx;
}
