import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateAsyncMatchDto {
  @IsString()
  @IsNotEmpty()
  gameType!: string;

  @IsString()
  @IsNotEmpty()
  opponentId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  turnDurationHours?: number;
}
