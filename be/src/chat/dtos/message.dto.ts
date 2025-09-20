import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class MessageDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID must not be empty' })
  readonly chatId: string;

  @IsString()
  @IsNotEmpty({ message: 'Sender ID must not be empty' })
  readonly senderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Receiver ID must not be empty' })
  readonly receiverId: string;

  @IsString()
  @IsNotEmpty({ message: 'Content must not be empty' })
  readonly content: string;

  @IsDate()
  readonly timestamp: Date;
}
