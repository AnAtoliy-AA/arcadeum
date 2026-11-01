import type { PetSpecies } from '@arcadeum/games-core';

export interface ThemePetPalette {
  id: string;
  title: string;
  emoji: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  belly: string;
  aura: string;
}

export const THEME_PET_PALETTES: Record<string, ThemePetPalette> = {
  cyberpunk: {
    id: 'cyberpunk',
    title: 'Cyberpunk',
    emoji: '🤖',
    primary: '#ec4899',
    secondary: '#a855f7',
    accent: '#06b6d4',
    glow: '#00ffff',
    belly: '#fecdd3',
    aura: 'rgba(236, 72, 153, 0.4)',
  },
  underwater: {
    id: 'underwater',
    title: 'Underwater',
    emoji: '🌊',
    primary: '#06b6d4',
    secondary: '#0284c7',
    accent: '#10b981',
    glow: '#38bdf8',
    belly: '#cffafe',
    aura: 'rgba(6, 182, 212, 0.4)',
  },
  galaxy: {
    id: 'galaxy',
    title: 'Galaxy',
    emoji: '✨',
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#fbbf24',
    glow: '#c084fc',
    belly: '#ede9fe',
    aura: 'rgba(139, 92, 246, 0.45)',
  },
  fantasy: {
    id: 'fantasy',
    title: 'Fantasy',
    emoji: '🔮',
    primary: '#a855f7',
    secondary: '#7c3aed',
    accent: '#f59e0b',
    glow: '#e879f9',
    belly: '#fae8ff',
    aura: 'rgba(168, 85, 247, 0.4)',
  },
  steampunk: {
    id: 'steampunk',
    title: 'Steampunk',
    emoji: '⚙️',
    primary: '#d97706',
    secondary: '#92400e',
    accent: '#f59e0b',
    glow: '#fbbf24',
    belly: '#fef3c7',
    aura: 'rgba(217, 119, 6, 0.4)',
  },
  zen: {
    id: 'zen',
    title: 'Zen Garden',
    emoji: '🎋',
    primary: '#10b981',
    secondary: '#047857',
    accent: '#f472b6',
    glow: '#34d399',
    belly: '#d1fae5',
    aura: 'rgba(16, 185, 129, 0.4)',
  },
  adventure: {
    id: 'adventure',
    title: 'Adventure',
    emoji: '🏔️',
    primary: '#f97316',
    secondary: '#c2410c',
    accent: '#84cc16',
    glow: '#fb923c',
    belly: '#ffedd5',
    aura: 'rgba(249, 115, 22, 0.4)',
  },
  egypt: {
    id: 'egypt',
    title: 'Egypt',
    emoji: '🏺',
    primary: '#eab308',
    secondary: '#ca8a04',
    accent: '#2563eb',
    glow: '#fde047',
    belly: '#fef9c3',
    aura: 'rgba(234, 179, 8, 0.45)',
  },
  western: {
    id: 'western',
    title: 'Western',
    emoji: '🤠',
    primary: '#ea580c',
    secondary: '#9a3412',
    accent: '#dc2626',
    glow: '#f97316',
    belly: '#ffedd5',
    aura: 'rgba(234, 88, 12, 0.4)',
  },
  horror: {
    id: 'horror',
    title: 'Horror',
    emoji: '👁️',
    primary: '#e11d48',
    secondary: '#881337',
    accent: '#7c3aed',
    glow: '#fb7185',
    belly: '#ffe4e6',
    aura: 'rgba(225, 29, 72, 0.4)',
  },
  crime: {
    id: 'crime',
    title: 'Crime Noir',
    emoji: '🕵️',
    primary: '#475569',
    secondary: '#1e293b',
    accent: '#fbbf24',
    glow: '#94a3b8',
    belly: '#f1f5f9',
    aura: 'rgba(71, 85, 105, 0.4)',
  },
  'high-altitude-hike': {
    id: 'high-altitude-hike',
    title: 'High Altitude',
    emoji: '❄️',
    primary: '#38bdf8',
    secondary: '#0284c7',
    accent: '#e0f2fe',
    glow: '#7dd3fc',
    belly: '#f0f9ff',
    aura: 'rgba(56, 189, 248, 0.45)',
  },
  retro: {
    id: 'retro',
    title: 'Retro Arcade',
    emoji: '🕹️',
    primary: '#22c55e',
    secondary: '#15803d',
    accent: '#f59e0b',
    glow: '#4ade80',
    belly: '#dcfce7',
    aura: 'rgba(34, 197, 94, 0.4)',
  },
};

export const ALL_THEME_IDS = Object.keys(THEME_PET_PALETTES);

export const SELECT_PET_COST = 750;

export function getPetAdoptionCost(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 50;
  if (count === 2) return 150;
  if (count === 3) return 300;
  if (count === 4) return 500;
  return 500 + (count - 4) * 250;
}

export const PET_FOOD_COSTS = [1, 5, 20, 50, 100] as const;

export function getPetFoodCost(petIndex: number): number {
  if (petIndex <= 0) return 1;
  if (petIndex === 1) return 5;
  if (petIndex === 2) return 20;
  if (petIndex === 3) return 50;
  if (petIndex === 4) return 100;
  return 100 + (petIndex - 4) * 50;
}

export interface PetGiftPresent {
  id: string;
  senderId: string;
  senderName: string;
  species: PetSpecies;
  theme: string;
  petName: string;
  message?: string;
  createdAt: number;
  isOpened: boolean;
}

import {
  type ThemePetDefinition,
  THEME_PET_ROSTER,
  GAME_THEME_IDS,
  getThemePets,
  getSignaturePet,
  getPetByThemeAndSpecies,
} from './arcade-pet-theme-roster';

export {
  type ThemePetDefinition,
  THEME_PET_ROSTER,
  GAME_THEME_IDS,
  getThemePets,
  getSignaturePet,
  getPetByThemeAndSpecies,
};

export function getRandomPetSpec(queuedTheme?: string | null): {
  species: PetSpecies;
  theme: string;
  name: string;
  tagline?: string;
} {
  const themePool = GAME_THEME_IDS.filter((t) => t !== 'retro');
  const chosenTheme =
    queuedTheme && THEME_PET_ROSTER[queuedTheme]
      ? queuedTheme
      : (themePool[Math.floor(Math.random() * themePool.length)] ??
        'cyberpunk');

  const themePets = getThemePets(chosenTheme);
  const chosenPet =
    themePets[Math.floor(Math.random() * themePets.length)] ??
    getSignaturePet(chosenTheme);

  return {
    species: chosenPet.species,
    theme: chosenTheme,
    name: chosenPet.name,
    tagline: chosenPet.tagline,
  };
}
