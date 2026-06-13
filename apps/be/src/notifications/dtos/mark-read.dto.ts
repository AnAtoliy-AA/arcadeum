import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class MarkReadDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  ids?: string[];

  @ValidateIf((o: MarkReadDto) => !o.ids)
  @IsBoolean()
  all?: boolean;
}
