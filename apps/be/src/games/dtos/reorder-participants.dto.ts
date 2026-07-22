import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ReorderParticipantsDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @IsMongoId({ each: true })
  userIds!: string[];
}
