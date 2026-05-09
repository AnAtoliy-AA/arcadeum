import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  TOURNAMENT_GAME_TYPES,
  type TournamentGameType,
} from '../schemas/tournament.schema';
import { IsAfter } from '../../announcements/dto/validators/is-after.validator';

export class TournamentLocaleContentDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class TournamentContentDto {
  @ValidateNested()
  @Type(() => TournamentLocaleContentDto)
  en!: TournamentLocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TournamentLocaleContentDto)
  ru?: TournamentLocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TournamentLocaleContentDto)
  es?: TournamentLocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TournamentLocaleContentDto)
  fr?: TournamentLocaleContentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TournamentLocaleContentDto)
  by?: TournamentLocaleContentDto;
}

export class CreateTournamentDto {
  @IsIn(TOURNAMENT_GAME_TYPES)
  gameType!: TournamentGameType;

  @Type(() => Date)
  @IsDate()
  scheduledAt!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationOpensAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsAfter('registrationOpensAt')
  registrationClosesAt?: Date | null;

  @IsInt()
  @Min(2)
  @Max(256)
  maxPlayers!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  prizeDescription?: string | null;

  @IsObject()
  @ValidateNested()
  @Type(() => TournamentContentDto)
  content!: TournamentContentDto;
}
