import { IsNotEmpty, IsString } from 'class-validator';

export class UndoRequestDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}

export class UndoResponseDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  accepted!: boolean;
}
