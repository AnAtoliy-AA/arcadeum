import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BulkDeleteUsersDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  userIds!: string[];
}
