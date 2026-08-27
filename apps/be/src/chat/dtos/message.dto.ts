import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ArrayNotEmpty,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';

const MAX_CHAT_MESSAGE_LENGTH = 2000;
const MAX_ID_LENGTH = 128;
const MAX_RECEIVER_IDS = 50;

export class MessageDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID must not be empty' })
  @MaxLength(MAX_ID_LENGTH)
  readonly chatId: string;

  @IsString()
  @IsNotEmpty({ message: 'Sender ID must not be empty' })
  @MaxLength(MAX_ID_LENGTH)
  readonly senderId: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty({ message: 'Receiver IDs array must not be empty' })
  @ArrayMaxSize(MAX_RECEIVER_IDS)
  @IsString({ each: true })
  @MaxLength(MAX_ID_LENGTH, { each: true })
  readonly receiverIds?: string[];

  @IsString()
  @IsNotEmpty({ message: 'Content must not be empty' })
  @MaxLength(MAX_CHAT_MESSAGE_LENGTH)
  readonly content: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  readonly tempId?: string;
}
