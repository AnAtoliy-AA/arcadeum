import type { CatId } from '../types';

export interface CatBreedProfile {
  id: CatId;
  name: string;
  breedTitle: string;
  coatBase: string;
  coatShade: string;
  coatHighlight: string;
  earOuter: string;
  earInner: string;
  earTuft: string;
  eyePrimary: string;
  eyeSecondary: string;
  eyePupil: string;
  noseColor: string;
  muzzleColor: string;
  chinColor: string;
  whiskerColor: string;
  whiskerDotColor: string;
  accentGlow: string;
}

export const CAT_PROFILES: Record<CatId, CatBreedProfile> = {
  neon: {
    id: 'neon',
    name: 'Neon',
    breedTitle: 'Cyber Bengal',
    coatBase: '#7c3aed',
    coatShade: '#4c1d95',
    coatHighlight: '#a855f7',
    earOuter: '#5b21b6',
    earInner: '#c084fc',
    earTuft: '#e9d5ff',
    eyePrimary: '#06b6d4',
    eyeSecondary: '#22d3ee',
    eyePupil: '#083344',
    noseColor: '#f43f5e',
    muzzleColor: '#3b0764',
    chinColor: '#581c87',
    whiskerColor: '#67e8f9',
    whiskerDotColor: '#22d3ee',
    accentGlow: '#06b6d4',
  },
  whiskers: {
    id: 'whiskers',
    name: 'Whiskers',
    breedTitle: 'Ginger Tabby',
    coatBase: '#d97706',
    coatShade: '#b45309',
    coatHighlight: '#f59e0b',
    earOuter: '#92400e',
    earInner: '#fde68a',
    earTuft: '#fef3c7',
    eyePrimary: '#10b981',
    eyeSecondary: '#34d399',
    eyePupil: '#064e3b',
    noseColor: '#fb7185',
    muzzleColor: '#fef3c7',
    chinColor: '#ffffff',
    whiskerColor: '#f8fafc',
    whiskerDotColor: '#b45309',
    accentGlow: '#f59e0b',
  },
  stardust: {
    id: 'stardust',
    name: 'Stardust',
    breedTitle: 'Russian Blue',
    coatBase: '#3b82f6',
    coatShade: '#1d4ed8',
    coatHighlight: '#60a5fa',
    earOuter: '#1e40af',
    earInner: '#bfdbfe',
    earTuft: '#dbeafe',
    eyePrimary: '#d946ef',
    eyeSecondary: '#f472b6',
    eyePupil: '#4a044e',
    noseColor: '#93c5fd',
    muzzleColor: '#dbeafe',
    chinColor: '#eff6ff',
    whiskerColor: '#e0e7ff',
    whiskerDotColor: '#1d4ed8',
    accentGlow: '#60a5fa',
  },
  felix: {
    id: 'felix',
    name: 'Felix',
    breedTitle: 'Tuxedo Cat',
    coatBase: '#1e293b',
    coatShade: '#0f172a',
    coatHighlight: '#334155',
    earOuter: '#020617',
    earInner: '#fecdd3',
    earTuft: '#ffffff',
    eyePrimary: '#f59e0b',
    eyeSecondary: '#fbbf24',
    eyePupil: '#451a03',
    noseColor: '#f43f5e',
    muzzleColor: '#ffffff',
    chinColor: '#ffffff',
    whiskerColor: '#ffffff',
    whiskerDotColor: '#64748b',
    accentGlow: '#4ade80',
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    breedTitle: 'Midnight Bombay',
    coatBase: '#18181b',
    coatShade: '#09090b',
    coatHighlight: '#27272a',
    earOuter: '#000000',
    earInner: '#71717a',
    earTuft: '#a1a1aa',
    eyePrimary: '#ef4444',
    eyeSecondary: '#f97316',
    eyePupil: '#450a0a',
    noseColor: '#27272a',
    muzzleColor: '#18181b',
    chinColor: '#27272a',
    whiskerColor: '#a1a1aa',
    whiskerDotColor: '#3f3f46',
    accentGlow: '#f43f5e',
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    breedTitle: 'Seal Siamese',
    coatBase: '#e2e8f0',
    coatShade: '#cbd5e1',
    coatHighlight: '#f8fafc',
    earOuter: '#475569',
    earInner: '#fbcfe8',
    earTuft: '#ffffff',
    eyePrimary: '#2563eb',
    eyeSecondary: '#38bdf8',
    eyePupil: '#0c4a6e',
    noseColor: '#fda4af',
    muzzleColor: '#64748b',
    chinColor: '#f1f5f9',
    whiskerColor: '#f8fafc',
    whiskerDotColor: '#475569',
    accentGlow: '#ec4899',
  },
};
