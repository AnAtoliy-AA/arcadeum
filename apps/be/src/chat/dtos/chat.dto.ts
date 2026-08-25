import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsNotEmpty,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';

const MAX_ID_LENGTH = 128;
const MAX_USERS = 50;

export class ChatDTO {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID must not be empty' })
  @MaxLength(MAX_ID_LENGTH)
  readonly chatId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Users array must not be empty' })
  @ArrayMaxSize(MAX_USERS)
  @IsString({ each: true })
  @MaxLength(MAX_ID_LENGTH, { each: true })
  readonly users: string[];

  @IsString()
  @IsNotEmpty({ message: 'Current user ID must not be empty' })
  @MaxLength(MAX_ID_LENGTH)
  readonly currentUserId: string;
}
