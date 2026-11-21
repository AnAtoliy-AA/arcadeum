import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import type {
  ArcadePetEconomyActionType,
  GameTreatId,
  PetMood,
  PetSpecies,
  PetStage,
} from '@arcadeum/games-core';
import { VALID_SPECIES } from './arcade-pet.dto';

export const VALID_STAGES: readonly PetStage[] = [
  'egg',
  'baby',
  'child',
  'teen',
  'adult',
  'senior',
];
export const VALID_MOODS: readonly PetMood[] = [
  'happy',
  'neutral',
  'sad',
  'sleeping',
  'sick',
  'hungry',
];
export const MAX_PETS = 20;

export class PetStatsDto {
  @IsNumber() @Min(0) @Max(100) hunger: number;
  @IsNumber() @Min(0) @Max(100) happiness: number;
  @IsNumber() @Min(0) @Max(100) energy: number;
  @IsNumber() @Min(0) @Max(100) hygiene: number;
  @IsNumber() @Min(0) @Max(100) discipline: number;
  @IsNumber() @Min(0) @Max(100) health: number;
  @IsNumber() @Min(0) @Max(1000) weight: number;
  @IsInt() @Min(1) @Max(1000) level: number;
  @IsNumber() @Min(0) xp: number;
  @IsOptional() @IsNumber() @Min(0) growthHours?: number;
}

export class PetTimestampsDto {
  @IsNumber() @Min(0) bornAt: number;
  @IsNumber() @Min(0) lastInteractedAt: number;
  @IsNumber() @Min(0) lastFedAt: number;
  @IsNumber() @Min(0) lastSleptAt: number;
  @IsNumber() @Min(0) lastCleanedAt: number;
  @IsNumber() @Min(0) lastTrainedAt: number;
}

export class CollectionPetDto {
  @IsString() @IsNotEmpty() @MaxLength(64) id: string;
  @IsString() @IsNotEmpty() @MaxLength(40) name: string;
  @IsIn(VALID_SPECIES) species: PetSpecies;
  @IsIn(VALID_STAGES) stage: PetStage;
  @IsString() @IsNotEmpty() @MaxLength(40) theme: string;

  @ValidateNested() @Type(() => PetStatsDto) stats: PetStatsDto;
  @ValidateNested()
  @Type(() => PetTimestampsDto)
  timestamps: PetTimestampsDto;

  @IsBoolean() isSleeping: boolean;
  @IsInt() @Min(0) @Max(4) poopCount: number;
  @IsBoolean() isSick: boolean;
  @IsObject() inventory: Record<GameTreatId, number>;
  @IsInt() @Min(0) careMistakes: number;
  @IsIn(VALID_MOODS) mood: PetMood;
}

export class SyncCollectionDto {
  @IsInt() @Min(0) baseRevision: number;

  @IsArray()
  @ArrayMaxSize(MAX_PETS)
  @ValidateNested({ each: true })
  @Type(() => CollectionPetDto)
  pets: CollectionPetDto[];

  @IsOptional() @IsString() @MaxLength(64) activePetId: string | null;

  @IsBoolean() isAtHome: boolean;
}

export const ECONOMY_ACTION_TYPES: readonly ArcadePetEconomyActionType[] = [
  'adopt_random',
  'adopt_selected',
  'upgrade_home',
  'feed_snack',
  'claim_present',
  'send_gift',
  'claim_daily',
  'claim_milestones',
  'queue_theme',
];

/**
 * Flat DTO for every economy action; per-type required fields are enforced
 * with ValidateIf so unrelated fields stay optional.
 */
export class EconomyActionDto {
  @IsIn(ECONOMY_ACTION_TYPES) type: ArcadePetEconomyActionType;

  @ValidateIf((o: EconomyActionDto) =>
    ['adopt_random', 'adopt_selected', 'feed_snack', 'claim_present'].includes(
      o.type,
    ),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  petId?: string;

  @ValidateIf((o: EconomyActionDto) =>
    ['adopt_random', 'adopt_selected', 'send_gift'].includes(o.type),
  )
  @IsIn(VALID_SPECIES)
  species?: PetSpecies;

  @ValidateIf((o: EconomyActionDto) =>
    ['adopt_random', 'adopt_selected', 'send_gift'].includes(o.type),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  theme?: string;

  @ValidateIf((o: EconomyActionDto) =>
    ['adopt_random', 'adopt_selected'].includes(o.type),
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name?: string;

  @ValidateIf((o: EconomyActionDto) => o.type === 'upgrade_home')
  @IsIn(['coins', 'gems'])
  currency?: 'coins' | 'gems';

  @ValidateIf((o: EconomyActionDto) => o.type === 'claim_present')
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  presentId?: string;

  @ValidateIf((o: EconomyActionDto) => o.type === 'send_gift')
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  recipientUsername?: string;

  @ValidateIf((o: EconomyActionDto) => o.type === 'send_gift')
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  petName?: string;

  @ValidateIf((o: EconomyActionDto) => o.type === 'send_gift')
  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;

  @ValidateIf((o: EconomyActionDto) => o.type === 'queue_theme')
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  themeId?: string;
}
