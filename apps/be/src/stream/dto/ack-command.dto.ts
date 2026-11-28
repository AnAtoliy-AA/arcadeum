import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class AckCommandDto {
  @IsIn(['done', 'failed'])
  result!: 'done' | 'failed';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;
}
