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
  ValidateNested,
} from 'class-validator';
import type {
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
export const MAX_PRESENTS = 200;
const MAX_CURRENCY = 1_000_000_000;

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

export class PetPresentDto {
  @IsString() @IsNotEmpty() @MaxLength(80) id: string;
  @IsString() @MaxLength(80) senderId: string;
  @IsString() @MaxLength(80) senderName: string;
  @IsIn(VALID_SPECIES) species: PetSpecies;
  @IsString() @IsNotEmpty() @MaxLength(40) theme: string;
  @IsString() @IsNotEmpty() @MaxLength(40) petName: string;
  @IsOptional() @IsString() @MaxLength(300) message?: string;
  @IsNumber() @Min(0) createdAt: number;
  @IsBoolean() isOpened: boolean;
}

export class SyncCollectionDto {
  @IsInt() @Min(0) baseRevision: number;

  @IsArray()
  @ArrayMaxSize(MAX_PETS)
  @ValidateNested({ each: true })
  @Type(() => CollectionPetDto)
  pets: CollectionPetDto[];

  @IsOptional() @IsString() @MaxLength(64) activePetId: string | null;

  @IsInt() @Min(0) @Max(MAX_CURRENCY) gemBalance: number;
  @IsInt() @Min(0) @Max(MAX_CURRENCY) coinBalance: number;
  @IsInt() @Min(0) @Max(1000) adoptionCount: number;
  @IsInt() @Min(1) @Max(MAX_PETS) homeCapacity: number;
  @IsOptional() @IsString() @MaxLength(40) queuedThemeForNextPet: string | null;

  @IsArray()
  @ArrayMaxSize(MAX_PRESENTS)
  @ValidateNested({ each: true })
  @Type(() => PetPresentDto)
  presents: PetPresentDto[];

  @IsBoolean() hasConfirmedCare: boolean;
  @IsBoolean() isAtHome: boolean;
}
