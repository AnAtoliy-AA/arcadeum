import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ReorderParticipantsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds!: string[];
}
