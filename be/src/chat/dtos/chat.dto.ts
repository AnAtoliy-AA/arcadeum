import { IsString, IsNotEmpty } from 'class-validator';

export class ChatDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID must not be empty' })
  readonly chatId: string;

  @IsNotEmpty({ message: 'Users array must not be empty' })
  readonly users: string[];
}
