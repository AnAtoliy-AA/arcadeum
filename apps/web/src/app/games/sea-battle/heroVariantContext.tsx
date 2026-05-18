'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeroVariantContextValue {
  variant: string;
  setVariant: (variant: string) => void;
}

const HeroVariantContext = createContext<HeroVariantContextValue>({
  variant: 'classic',
  setVariant: () => {},
});

export function HeroVariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<string>('classic');
  return (
    <HeroVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </HeroVariantContext.Provider>
  );
}

export function useHeroVariant() {
  return useContext(HeroVariantContext);
}
