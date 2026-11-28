import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  BOT_DIFFICULTIES,
  FPS_VALUES,
  LIMITS,
  RESOLUTIONS,
  SCENE_LANGUAGES,
  STREAM_GAME_IDS,
  X264_PRESETS,
} from '../stream-settings.model';

/**
 * Types and enums are validated here (400 on mismatch). Numeric ranges are
 * enforced by clamping in `normalizeSettings`, so an admin typo can never
 * produce a value outside the hard limits.
 */

@ValidatorConstraint({ name: 'streamGamesMap', async: false })
class StreamGamesMapConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const ids = STREAM_GAME_IDS as readonly string[];
    return Object.entries(value as Record<string, unknown>).every(
      ([key, g]) => {
        if (!ids.includes(key) || !g || typeof g !== 'object') return false;
        const e = g as Record<string, unknown>;
        const allowed = ['enabled', 'weight', 'themes', 'maxDurationSec'];
        return (
          Object.keys(e).every((k) => allowed.includes(k)) &&
          (e.enabled === undefined || typeof e.enabled === 'boolean') &&
          (e.weight === undefined || typeof e.weight === 'number') &&
          (e.maxDurationSec === undefined ||
            typeof e.maxDurationSec === 'number') &&
          (e.themes === undefined ||
            (Array.isArray(e.themes) &&
              e.themes.length <= 30 &&
              e.themes.every((t) => typeof t === 'string')))
        );
      },
    );
  }

  defaultMessage(): string {
    return 'games must map known game ids to {enabled, weight, themes, maxDurationSec}';
  }
}

class BotDto {
  @IsOptional()
  @IsIn(BOT_DIFFICULTIES)
  difficulty?: (typeof BOT_DIFFICULTIES)[number];

  @IsOptional()
  @IsNumber()
  moveDelayMs?: number;
}

class OverlayPartsDto {
  @IsOptional() @IsBoolean() players?: boolean;
  @IsOptional() @IsBoolean() status?: boolean;
  @IsOptional() @IsBoolean() cta?: boolean;
  @IsOptional() @IsBoolean() moves?: boolean;
  @IsOptional() @IsBoolean() arc?: boolean;
}

class OverlayDto {
  @IsOptional()
  @IsString()
  @MaxLength(LIMITS.joinUrlLength)
  joinUrl?: string;

  @IsOptional()
  @IsBoolean()
  showQr?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => OverlayPartsDto)
  parts?: OverlayPartsDto;

  @IsOptional()
  @IsString()
  @MaxLength(LIMITS.bannerLength)
  bannerText?: string;
}

class MusicDto {
  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(LIMITS.maxTracks)
  @IsString({ each: true })
  @MaxLength(LIMITS.trackNameLength, { each: true })
  tracks?: string[];
}

class VideoDto {
  @IsOptional()
  @IsIn(RESOLUTIONS)
  resolution?: (typeof RESOLUTIONS)[number];

  @IsOptional()
  @IsIn(FPS_VALUES)
  fps?: (typeof FPS_VALUES)[number];

  @IsOptional()
  @IsNumber()
  bitrateKbps?: number;

  @IsOptional()
  @IsIn(X264_PRESETS)
  preset?: (typeof X264_PRESETS)[number];
}

export class UpdateStreamSettingsDto {
  /** Version the admin loaded; a mismatch means someone else saved first. */
  @IsOptional()
  @IsInt()
  @Min(0)
  expectedVersion?: number;

  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsBoolean() stopGracefully?: boolean;

  @IsOptional()
  @IsObject()
  @Validate(StreamGamesMapConstraint)
  games?: Record<
    string,
    {
      enabled?: boolean;
      weight?: number;
      themes?: string[];
      maxDurationSec?: number;
    }
  >;

  @IsOptional()
  @ValidateNested()
  @Type(() => BotDto)
  bot?: BotDto;

  @IsOptional()
  @IsNumber()
  secondsBetweenGames?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => OverlayDto)
  overlay?: OverlayDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MusicDto)
  music?: MusicDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VideoDto)
  video?: VideoDto;

  @IsOptional()
  @IsIn(SCENE_LANGUAGES)
  sceneLanguage?: (typeof SCENE_LANGUAGES)[number];
}
