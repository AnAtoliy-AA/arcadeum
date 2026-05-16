import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class ConvertGemsDto {
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  gems!: number;

  @IsUUID()
  conversionId!: string;
}
