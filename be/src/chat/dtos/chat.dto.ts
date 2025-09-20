import { IsString, IsNotEmpty } from 'class-validator';

export class ChatDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID must not be empty' })
  readonly chatId: string;

  @IsString()
  @IsNotEmpty({ message: 'User1 must not be empty' })
  readonly user1: string; // ID of the first user

  @IsString()
  @IsNotEmpty({ message: 'User2 must not be empty' })
  readonly user2: string; // ID of the second user
}
