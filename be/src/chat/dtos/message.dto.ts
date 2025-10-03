import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator';

export class MessageDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID must not be empty' })
  readonly chatId: string;

  @IsString()
  @IsNotEmpty({ message: 'Sender ID must not be empty' })
  readonly senderId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Receiver IDs array must not be empty' })
  readonly receiverIds: string[];

  @IsString()
  @IsNotEmpty({ message: 'Content must not be empty' })
  readonly content: string;
}
