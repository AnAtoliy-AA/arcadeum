import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type {
  GameTreatId,
  PetActionType,
  PetSpecies,
} from '@arcadeum/games-core';

export const VALID_ACTIONS: readonly PetActionType[] = [
  'hatch',
  'feed_meal',
  'feed_snack',
  'feed_treat',
  'play',
  'clean',
  'sleep',
  'wake',
  'heal',
  'train',
  'praise',
  'scold',
] as const;

export const VALID_SPECIES: readonly PetSpecies[] = [
  'slime',
  'dragon',
  'cyber_cat',
  'dino',
  'blob',
] as const;

export const VALID_TREATS: readonly GameTreatId[] = [
  'chess_cookie',
  'sea_battle_fish',
  'hearts_candy',
  'critical_pepper',
  'pachisi_spice',
] as const;

export class HatchPetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(24)
  name: string;

  @IsString()
  @IsIn(VALID_SPECIES)
  species: PetSpecies;

  @IsString()
  @IsOptional()
  theme?: string;
}

export class PetActionDto {
  @IsString()
  @IsIn(VALID_ACTIONS)
  action: PetActionType;

  @IsString()
  @IsOptional()
  @IsIn(VALID_TREATS)
  treatId?: GameTreatId;

  @IsString()
  @IsOptional()
  theme?: string;
}
