import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AI_VS_AI_DELAYS_MS } from '../common/ai-vs-ai';

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
  @IsIn(AI_VS_AI_DELAYS_MS)
  aiMoveDelayMs?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  botPersonalityWhite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  botPersonalityBlack?: string;
}
