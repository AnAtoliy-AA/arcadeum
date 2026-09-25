import type { CatId } from '../types';

export interface CatBreedProfile {
  id: CatId;
  name: string;
  breedTitle: string;
  tagline: string;
  quote: string;
  signatureTrait: string;
  stats: {
    speed: number;
    agility: number;
    acceleration: number;
    luck: number;
  };
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
  imageSrc: string;
}

export interface TacticalAbility {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
}

export const RACER_TACTICAL_ABILITIES: Record<CatId, TacticalAbility[]> = {
  neon: [
    {
      id: 'neon_boost',
      name: 'Digital Dash',
      icon: '⚡',
      description: '+3 speed on your next dice roll',
      cost: 1,
    },
    {
      id: 'neon_shield',
      name: 'Neon Shield',
      icon: '🛡️',
      description: 'Block the next obstacle hazard or bump',
      cost: 1,
    },
  ],
  whiskers: [
    {
      id: 'whiskers_slingshot',
      name: 'Aero Slingshot',
      icon: '🚀',
      description: 'Leap 2 spaces ahead of closest rival',
      cost: 1,
    },
    {
      id: 'whiskers_reroll',
      name: 'Lucky Paws',
      icon: '🎲',
      description: 'Earn an immediate extra roll this turn',
      cost: 1,
    },
  ],
  stardust: [
    {
      id: 'stardust_warp',
      name: 'Warp Jump',
      icon: '🌌',
      description: 'Teleport directly to nearest forward bonus tile',
      cost: 1,
    },
    {
      id: 'stardust_shield',
      name: 'Star Shield',
      icon: '🛡️',
      description: 'Block the next obstacle hazard or bump',
      cost: 1,
    },
  ],
  felix: [
    {
      id: 'felix_precision',
      name: 'Apex Precision',
      icon: '🎯',
      description: 'Locks dice roll to exact 4 without RNG',
      cost: 1,
    },
    {
      id: 'felix_boost',
      name: 'Wild Charge',
      icon: '⚡',
      description: '+3 speed on your next dice roll',
      cost: 1,
    },
  ],
  shadow: [
    {
      id: 'shadow_snare',
      name: 'Shadow Snare',
      icon: '🕸️',
      description: 'Drop a snare on current space (-2 spaces for rivals)',
      cost: 1,
    },
    {
      id: 'shadow_leap',
      name: 'Phantom Pounce',
      icon: '🐾',
      description: 'Leap forward 2 spaces silently',
      cost: 1,
    },
  ],
  luna: [
    {
      id: 'luna_boost',
      name: 'Lunar Surge',
      icon: '🌙',
      description: '+3 speed on your next dice roll',
      cost: 1,
    },
    {
      id: 'luna_ward',
      name: 'Moon Aegis',
      icon: '🛡️',
      description: 'Block the next obstacle hazard or bump',
      cost: 1,
    },
  ],
};

export const CAT_PROFILES: Record<CatId, CatBreedProfile> = {
  neon: {
    id: 'neon',
    name: 'Neon',
    breedTitle: 'Cyber Bengal',
    tagline: 'High-octane cybernetic speedster',
    quote: 'Faster than light, smoother than silk.',
    signatureTrait:
      'Hyper-drive Nitrous: Surges through straightaways with electric overdrive.',
    stats: { speed: 96, agility: 88, acceleration: 92, luck: 74 },
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
    imageSrc: '/images/cats/neon.jpg',
  },
  whiskers: {
    id: 'whiskers',
    name: 'Whiskers',
    breedTitle: 'Ginger Tabby',
    tagline: 'Daredevil sky-runner and aerial ace',
    quote: 'Clear skies, full throttle, no brakes!',
    signatureTrait:
      'Slipstream Soar: Catches aerodynamic tailwinds to slingshot ahead.',
    stats: { speed: 89, agility: 94, acceleration: 85, luck: 82 },
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
    imageSrc: '/images/cats/whiskers.jpg',
  },
  stardust: {
    id: 'stardust',
    name: 'Stardust',
    breedTitle: 'Russian Blue',
    tagline: 'Interstellar navigator guided by the stars',
    quote: 'Constellations chart the quickest course to victory.',
    signatureTrait:
      'Nebula Warp: Distorts track friction using zero-gravity celestial fields.',
    stats: { speed: 91, agility: 90, acceleration: 87, luck: 95 },
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
    imageSrc: '/images/cats/stardust.jpg',
  },
  felix: {
    id: 'felix',
    name: 'Felix',
    breedTitle: 'Tuxedo Cat',
    tagline: 'Tactical grandmaster of high-speed racing',
    quote: 'Precision engineering beats raw speed every single time.',
    signatureTrait:
      'Apex Cornering: Carves razor-sharp lines through every hairpin turn.',
    stats: { speed: 88, agility: 96, acceleration: 90, luck: 78 },
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
    imageSrc: '/images/cats/felix.jpg',
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow',
    breedTitle: 'Midnight Bombay',
    tagline: 'Stealth phantom who haunts the asphalt',
    quote: 'You cannot catch what you cannot see.',
    signatureTrait:
      'Eclipse Dash: Blends into track shadows to execute sudden overtaking leaps.',
    stats: { speed: 94, agility: 92, acceleration: 95, luck: 80 },
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
    imageSrc: '/images/cats/shadow.jpg',
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    breedTitle: 'Seal Siamese',
    tagline: 'Royal monarch of the Grand Prix circuit',
    quote: 'First place is not an ambition; it is my natural habitat.',
    signatureTrait:
      'Moonlight Radiance: Inspires unstoppable momentum with royal composure.',
    stats: { speed: 93, agility: 89, acceleration: 91, luck: 88 },
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
    imageSrc: '/images/cats/luna.jpg',
  },
};
