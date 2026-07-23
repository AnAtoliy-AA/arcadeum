import { IsNotEmpty, IsObject } from 'class-validator';

export class UpdateRoomOptionsDto {
  @IsObject()
  @IsNotEmpty()
  options!: Record<string, unknown>;
}
