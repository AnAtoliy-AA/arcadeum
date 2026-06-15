import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const TEAM_NAME_PATTERN = /^[\p{L}\p{N} _-]{1,32}$/u;

export class SeaBattleTeamConfigItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  id?: string;

  @IsString()
  @Matches(TEAM_NAME_PATTERN)
  name!: string;

  @IsHexColor()
  color!: string;

  @IsInt()
  @Min(2)
  @Max(8)
  targetSize!: number;
}

export class SetTeamConfigDto {
  @IsString()
  roomId!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => SeaBattleTeamConfigItemDto)
  teams!: SeaBattleTeamConfigItemDto[];

  @IsOptional()
  @IsBoolean()
  hideShipsFromTeammates?: boolean;

  @IsOptional()
  @IsInt()
  @Min(4)
  @Max(12)
  maxTotalPlayers?: number;
}
