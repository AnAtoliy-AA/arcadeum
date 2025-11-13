import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartGameDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsOptional()
  @IsString()
  engine?: string;
}
