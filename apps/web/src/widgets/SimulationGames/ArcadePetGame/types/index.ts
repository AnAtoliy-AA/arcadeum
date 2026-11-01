import type {
  GameTreatId,
  PetActionType,
  PetMood,
  PetSpecies,
  PetStage,
  PetState,
  PetStats,
} from '@arcadeum/games-core';
import type { BaseGameWidgetProps } from '@/features/games/types';

export type {
  GameTreatId,
  PetActionType,
  PetMood,
  PetSpecies,
  PetStage,
  PetState,
  PetStats,
  BaseGameWidgetProps,
};

export interface ArcadePetGameProps extends Partial<BaseGameWidgetProps> {
  gameOptions?: {
    theme?: string;
    mode?: string;
  };
}

export interface ArcadePetThemeTokens {
  shellBg: string;
  shellBorder: string;
  screenBg: string;
  pixelColor: string;
  pixelDim: string;
  buttonA: string;
  buttonB: string;
  buttonC: string;
  accent: string;
  textColor: string;
  glow: string;
}

export type MinigameGuess = 'higher' | 'lower';
