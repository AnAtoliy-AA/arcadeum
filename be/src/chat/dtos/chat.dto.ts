import { IsArray, ArrayNotEmpty, IsString, IsNotEmpty } from 'class-validator';

export class ChatDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID must not be empty' })
  readonly chatId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Users array must not be empty' })
  readonly users: string[];

  @IsString()
  @IsNotEmpty({ message: 'Current user ID must not be empty' })
  readonly currentUserId: string;
}
