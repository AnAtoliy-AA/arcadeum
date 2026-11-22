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
import {
  ALL_SPECIES,
  ARCADE_PET_ECONOMY_ACTION_TYPES,
  GAME_THEME_IDS,
  PET_MOODS,
  PET_STAGES,
  type ArcadePetEconomyActionType,
  type GameTreatId,
  type PetMood,
  type PetSpecies,
  type PetStage,
  type PetStats,
  type PetTimestamps,
  type SyncArcadePetCollectionRequest,
} from '@arcadeum/games-core';

export const MAX_PETS = 20;
const MAX_PROGRESS = 1_000_000;

export class PetStatsDto implements PetStats {
  @IsNumber() @Min(0) @Max(100) hunger: number;
  @IsNumber() @Min(0) @Max(100) happiness: number;
  @IsNumber() @Min(0) @Max(100) energy: number;
  @IsNumber() @Min(0) @Max(100) hygiene: number;
  @IsNumber() @Min(0) @Max(100) discipline: number;
  @IsNumber() @Min(0) @Max(100) health: number;
  @IsNumber() @Min(0) @Max(1000) weight: number;
  @IsInt() @Min(1) @Max(1000) level: number;
  @IsNumber() @Min(0) @Max(MAX_PROGRESS) xp: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PROGRESS)
  growthHours?: number;
}

/** Timestamps are clamped to the server clock when merged (see mergeClientPet). */
export class PetTimestampsDto implements PetTimestamps {
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
  @IsIn(ALL_SPECIES) species: PetSpecies;
  @IsIn(PET_STAGES) stage: PetStage;
  @IsIn(GAME_THEME_IDS) theme: string;

  @ValidateNested() @Type(() => PetStatsDto) stats: PetStatsDto;
  @ValidateNested()
  @Type(() => PetTimestampsDto)
  timestamps: PetTimestampsDto;

  @IsBoolean() isSleeping: boolean;
  @IsInt() @Min(0) @Max(4) poopCount: number;
  @IsBoolean() isSick: boolean;
  // Only known treat ids are read, and counts are clamped, when merged.
  @IsObject() inventory: Record<GameTreatId, number>;
  @IsInt() @Min(0) @Max(1000) careMistakes: number;
  @IsIn(PET_MOODS) mood: PetMood;
}

export class SyncCollectionDto implements Omit<
  SyncArcadePetCollectionRequest,
  'pets' | 'activePetId'
> {
  @IsInt() @Min(0) baseRevision: number;

  @IsArray()
  @ArrayMaxSize(MAX_PETS)
  @ValidateNested({ each: true })
  @Type(() => CollectionPetDto)
  pets: CollectionPetDto[];

  @IsOptional() @IsString() @MaxLength(64) activePetId: string | null;

  @IsBoolean() isAtHome: boolean;
}

/**
 * Flat DTO for every economy action; per-type required fields are enforced
 * with ValidateIf so unrelated fields stay optional.
 */
export class EconomyActionDto {
  @IsIn(ARCADE_PET_ECONOMY_ACTION_TYPES) type: ArcadePetEconomyActionType;

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
  @IsIn(ALL_SPECIES)
  species?: PetSpecies;

  @ValidateIf((o: EconomyActionDto) =>
    ['adopt_random', 'adopt_selected', 'send_gift'].includes(o.type),
  )
  @IsIn(GAME_THEME_IDS)
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
  @IsIn(GAME_THEME_IDS)
  themeId?: string;
}
