import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsArray()
  @ArrayNotEmpty()
  readonly users: string[];

  @IsOptional()
  @IsString()
  readonly chatId?: string;
}
