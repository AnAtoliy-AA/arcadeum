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
import { TournamentContentDto } from './create-tournament.dto';

export class UpdateTournamentDto {
  @IsOptional()
  @IsIn(TOURNAMENT_GAME_TYPES)
  gameType?: TournamentGameType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationOpensAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsAfter('registrationOpensAt')
  registrationClosesAt?: Date | null;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(256)
  maxPlayers?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  prizeDescription?: string | null;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TournamentContentDto)
  content?: TournamentContentDto;
}
