import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SubmitAsyncMoveDto {
  @IsObject()
  @IsNotEmpty()
  move!: Record<string, unknown>;

  @IsObject()
  @IsNotEmpty()
  newStateSnapshot!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isGameEnd?: boolean;

  @IsOptional()
  @IsString()
  winnerId?: string;
}
