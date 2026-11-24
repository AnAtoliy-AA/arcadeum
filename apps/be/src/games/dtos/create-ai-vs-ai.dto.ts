import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AI_VS_AI_DIFFICULTIES,
  AI_VS_AI_MAX_DELAY_MS,
  AI_VS_AI_MIN_DELAY_MS,
} from '../common/ai-vs-ai';

export class CreateAiVsAiGameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  gameId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  variant?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  theme?: string;

  @IsOptional()
  @IsInt()
  @Min(AI_VS_AI_MIN_DELAY_MS)
  @Max(AI_VS_AI_MAX_DELAY_MS)
  aiMoveDelayMs?: number;

  /** Fixed bot difficulty; random from the game's allow-list when omitted. */
  @IsOptional()
  @IsIn(AI_VS_AI_DIFFICULTIES)
  botDifficulty?: (typeof AI_VS_AI_DIFFICULTIES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  botPersonalityWhite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  botPersonalityBlack?: string;
}
