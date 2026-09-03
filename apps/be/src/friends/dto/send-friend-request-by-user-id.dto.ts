import { IsString, IsNotEmpty } from 'class-validator';

export class SendFriendRequestByUserIdDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
